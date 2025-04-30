// Sistema de caché mejorado para componentes renderizados
// Esto reduce significativamente el número de renderizados

import type { Component } from "@/lib/models"
import { renderComponent } from "@/lib/component-renderer"
import type React from "react"

// Interfaz para la entrada de caché
interface CacheEntry {
  renderedComponent: React.ReactNode
  hash: string
  lastAccessed: number
  version: number
  renderTime: number
  complexity: number
}

// Tamaño máximo de la caché
const MAX_CACHE_SIZE = 150

// Tiempo de vida de la caché en milisegundos (10 minutos)
const CACHE_TTL = 10 * 60 * 1000

// Número máximo de componentes a prefetch en cada ciclo
const MAX_PREFETCH_COUNT = 10

class EnhancedComponentCache {
  private cache: Map<string, CacheEntry> = new Map()
  private cacheHits = 0
  private cacheMisses = 0
  private globalVersion = 1
  private prefetchQueue: string[] = []
  private isPrefetching = false
  private memoryUsage = 0
  private maxMemoryUsage: number = 50 * 1024 * 1024 // 50MB por defecto
  private renderTimes: Record<string, number[]> = {}

  // Generar un hash para un componente
  private generateHash(component: Component): string {
    // Crear un hash basado en las propiedades relevantes del componente
    const { id, type, props, style } = component
    return JSON.stringify({ id, type, props, style })
  }

  // Estimar la complejidad de un componente
  private estimateComplexity(component: Component): number {
    let complexity = 1

    // Tipos de componentes más complejos
    if (["table", "grid", "tabs", "datepicker"].includes(component.type)) {
      complexity *= 3
    }

    // Componentes con muchas propiedades
    complexity += Object.keys(component.props).length * 0.2

    // Componentes con estilos complejos
    complexity += Object.keys(component.style).length * 0.1

    // Componentes con hijos
    if (component.children && component.children.length > 0) {
      complexity += component.children.length * 0.5
    }

    return complexity
  }

  // Estimar el uso de memoria de un componente renderizado
  private estimateMemoryUsage(component: React.ReactNode): number {
    // Evitamos usar JSON.stringify directamente en el componente React
    // ya que puede contener referencias circulares

    // En su lugar, usamos una estimación basada en el tipo de componente
    if (component === null || component === undefined) {
      return 0
    }

    // Si es un objeto React, estimamos un tamaño base
    if (typeof component === "object") {
      // Tamaño base para un componente React
      const baseSize = 1024 // 1KB como base

      // Si tiene propiedades, añadimos más memoria estimada
      if (component && typeof component === "object") {
        try {
          // Intentamos contar las propiedades de primer nivel
          const propCount = Object.keys(component).length
          return baseSize + propCount * 256 // 256 bytes por propiedad
        } catch (e) {
          // Si hay error al acceder a las propiedades, usamos solo el tamaño base
          return baseSize
        }
      }

      return baseSize
    }

    // Para tipos primitivos, usamos una estimación simple
    if (typeof component === "string") {
      return component.length * 2 // 2 bytes por carácter
    }

    if (typeof component === "number" || typeof component === "boolean") {
      return 8 // 8 bytes para números y booleanos
    }

    // Valor por defecto para otros tipos
    return 64
  }

  // Obtener un componente de la caché
  public get(component: Component): React.ReactNode | null {
    const id = component.id
    const hash = this.generateHash(component)
    const entry = this.cache.get(id)

    // Si no hay entrada en la caché o el hash ha cambiado, es un fallo de caché
    if (!entry || entry.hash !== hash || entry.version < this.globalVersion) {
      this.cacheMisses++
      return null
    }

    // Actualizar el tiempo de último acceso
    entry.lastAccessed = Date.now()
    this.cacheHits++

    // Devolver el componente renderizado
    return entry.renderedComponent
  }

  // Almacenar un componente en la caché
  public set(component: Component, renderedComponent: React.ReactNode, renderTime?: number): void {
    const id = component.id
    const hash = this.generateHash(component)
    const complexity = this.estimateComplexity(component)

    // Medir el tiempo de renderizado si no se proporciona
    const actualRenderTime = renderTime || this.getAverageRenderTime(component.type) || 10

    // Actualizar los tiempos de renderizado para este tipo de componente
    this.updateRenderTimes(component.type, actualRenderTime)

    // Estimar el uso de memoria de forma segura
    let memoryUsage = 0
    try {
      memoryUsage = this.estimateMemoryUsage(renderedComponent)
    } catch (e) {
      // Si hay error al estimar, usamos un valor predeterminado basado en la complejidad
      memoryUsage = complexity * 1024 // 1KB por unidad de complejidad
    }

    // Actualizar el uso total de memoria
    this.memoryUsage += memoryUsage

    // Almacenar el componente renderizado en la caché
    this.cache.set(id, {
      renderedComponent,
      hash,
      lastAccessed: Date.now(),
      version: this.globalVersion,
      renderTime: actualRenderTime,
      complexity,
    })

    // Si la caché es demasiado grande o usa demasiada memoria, limpiar
    if (this.cache.size > MAX_CACHE_SIZE || this.memoryUsage > this.maxMemoryUsage) {
      this.cleanup()
    }
  }

  // Actualizar los tiempos de renderizado para un tipo de componente
  private updateRenderTimes(type: string, time: number): void {
    if (!this.renderTimes[type]) {
      this.renderTimes[type] = []
    }

    this.renderTimes[type].push(time)

    // Mantener solo los últimos 10 tiempos
    if (this.renderTimes[type].length > 10) {
      this.renderTimes[type].shift()
    }
  }

  // Obtener el tiempo promedio de renderizado para un tipo de componente
  private getAverageRenderTime(type: string): number | null {
    if (!this.renderTimes[type] || this.renderTimes[type].length === 0) {
      return null
    }

    const sum = this.renderTimes[type].reduce((a, b) => a + b, 0)
    return sum / this.renderTimes[type].length
  }

  // Invalidar una entrada de la caché
  public invalidate(id: string): void {
    const entry = this.cache.get(id)
    if (entry) {
      // Actualizar el uso de memoria de forma segura
      try {
        this.memoryUsage -= this.estimateMemoryUsage(entry.renderedComponent)
      } catch (e) {
        // Si hay error, simplemente reducimos la memoria en un valor fijo
        this.memoryUsage -= 1024 // Reducir 1KB como estimación
      }

      // Eliminar de la caché
      this.cache.delete(id)
    }

    // También eliminar de la cola de prefetch si existe
    this.prefetchQueue = this.prefetchQueue.filter((queuedId) => queuedId !== id)
  }

  // Invalidar todas las entradas de la caché
  public invalidateAll(): void {
    this.globalVersion++
    this.memoryUsage = 0
  }

  // Limpiar la caché
  public cleanup(): void {
    // Si la caché es pequeña, no hacer nada
    if (this.cache.size <= MAX_CACHE_SIZE / 2 && this.memoryUsage <= this.maxMemoryUsage / 2) {
      return
    }

    const now = Date.now()
    const entries = Array.from(this.cache.entries())

    // Calcular una puntuación para cada entrada basada en:
    // - Tiempo desde el último acceso
    // - Complejidad del componente (priorizar mantener componentes complejos)
    // - Tiempo de renderizado (priorizar mantener componentes costosos)
    const scoredEntries = entries.map(([id, entry]) => {
      const timeSinceAccess = now - entry.lastAccessed
      const accessScore = Math.min(timeSinceAccess / CACHE_TTL, 1) // 0-1, más alto = menos reciente
      const complexityScore = Math.min(entry.complexity / 10, 1) // 0-1, más alto = más complejo
      const renderTimeScore = Math.min(entry.renderTime / 100, 1) // 0-1, más alto = más costoso

      // Fórmula de puntuación: priorizar mantener componentes complejos y costosos que se accedieron recientemente
      const score = accessScore - complexityScore * 0.4 - renderTimeScore * 0.6

      return { id, entry, score }
    })

    // Ordenar por puntuación (más alto = mejor candidato para eliminar)
    scoredEntries.sort((a, b) => b.score - a.score)

    // Eliminar entradas hasta que estemos por debajo de los límites
    let removedCount = 0
    for (const { id, entry } of scoredEntries) {
      // Detener si hemos eliminado suficientes entradas
      if (
        this.cache.size <= MAX_CACHE_SIZE * 0.7 &&
        this.memoryUsage <= this.maxMemoryUsage * 0.7 &&
        removedCount >= Math.ceil(this.cache.size * 0.2)
      ) {
        break
      }

      // Actualizar el uso de memoria de forma segura
      try {
        this.memoryUsage -= this.estimateMemoryUsage(entry.renderedComponent)
      } catch (e) {
        // Si hay error, simplemente reducimos la memoria en un valor fijo
        this.memoryUsage -= 1024 // Reducir 1KB como estimación
      }

      // Eliminar de la caché
      this.cache.delete(id)
      removedCount++
    }

    // Eliminar entradas que no se han accedido en mucho tiempo
    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > CACHE_TTL) {
        // Actualizar el uso de memoria de forma segura
        try {
          this.memoryUsage -= this.estimateMemoryUsage(entry.renderedComponent)
        } catch (e) {
          // Si hay error, simplemente reducimos la memoria en un valor fijo
          this.memoryUsage -= 1024 // Reducir 1KB como estimación
        }

        // Eliminar de la caché
        this.cache.delete(id)
      }
    }
  }

  // Añadir componentes a la cola de prefetch
  public prefetch(components: Component[]): void {
    // Filtrar componentes que ya están en caché
    const componentsToAdd = components.filter((component) => {
      const hash = this.generateHash(component)
      const entry = this.cache.get(component.id)
      return !entry || entry.hash !== hash
    })

    // Ordenar por complejidad y tiempo de renderizado estimado
    componentsToAdd.sort((a, b) => {
      const complexityA = this.estimateComplexity(a)
      const complexityB = this.estimateComplexity(b)
      const renderTimeA = this.getAverageRenderTime(a.type) || 10
      const renderTimeB = this.getAverageRenderTime(b.type) || 10

      // Priorizar componentes más complejos y costosos
      return complexityB * renderTimeB - complexityA * renderTimeA
    })

    // Añadir a la cola de prefetch
    this.prefetchQueue.push(...componentsToAdd.map((c) => c.id))

    // Eliminar duplicados
    this.prefetchQueue = [...new Set(this.prefetchQueue)]

    // Iniciar el proceso de prefetch si no está en marcha
    if (!this.isPrefetching) {
      this.startPrefetching(componentsToAdd)
    }
  }

  // Iniciar el proceso de prefetch
  private async startPrefetching(components: Component[]): Promise<void> {
    if (this.isPrefetching || this.prefetchQueue.length === 0) return

    this.isPrefetching = true

    // Procesar en segundo plano usando requestIdleCallback o setTimeout
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        ;(window as any).requestIdleCallback(() => this.processPrefetchQueue(components))
      } else {
        setTimeout(() => this.processPrefetchQueue(components), 100)
      }
    }
  }

  // Procesar la cola de prefetch
  private processPrefetchQueue(components: Component[]): void {
    // Tomar un número limitado de componentes para procesar
    const componentsToProcess = components.slice(0, MAX_PREFETCH_COUNT)

    // Renderizar y almacenar en caché
    for (const component of componentsToProcess) {
      if (!this.cache.has(component.id)) {
        const startTime = performance.now()
        const rendered = renderComponent(component)
        const renderTime = performance.now() - startTime

        this.set(component, rendered, renderTime)
      }
    }

    // Actualizar la cola
    this.prefetchQueue = this.prefetchQueue.filter((id) => !componentsToProcess.some((c) => c.id === id))

    // Continuar con el siguiente lote si hay más en la cola
    this.isPrefetching = false
    if (this.prefetchQueue.length > 0) {
      // Encontrar los componentes correspondientes a los IDs en la cola
      const nextComponents = this.prefetchQueue
        .map((id) => components.find((c) => c.id === id))
        .filter(Boolean) as Component[]

      this.startPrefetching(nextComponents)
    }
  }

  // Obtener estadísticas de la caché
  public getStats(): {
    size: number
    hits: number
    misses: number
    hitRate: number
    version: number
    memoryUsage: number
    maxMemoryUsage: number
  } {
    const total = this.cacheHits + this.cacheMisses
    const hitRate = total > 0 ? this.cacheHits / total : 0

    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: hitRate,
      version: this.globalVersion,
      memoryUsage: this.memoryUsage,
      maxMemoryUsage: this.maxMemoryUsage,
    }
  }

  // Establecer el uso máximo de memoria
  public setMaxMemoryUsage(bytes: number): void {
    this.maxMemoryUsage = bytes

    // Si ya estamos por encima del límite, limpiar
    if (this.memoryUsage > this.maxMemoryUsage) {
      this.cleanup()
    }
  }

  // Limpiar toda la caché
  public clear(): void {
    this.cache.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    this.prefetchQueue = []
    this.isPrefetching = false
    this.globalVersion++
    this.memoryUsage = 0
  }
}

// Exportar una instancia singleton
export const enhancedComponentCache = new EnhancedComponentCache()

// Función de ayuda para renderizar un componente con caché
export function renderWithEnhancedCache(component: Component): React.ReactNode {
  // Intentar obtener de la caché
  const cached = enhancedComponentCache.get(component)
  if (cached) {
    return cached
  }

  // Si no está en caché, renderizar y almacenar
  const startTime = performance.now()
  const rendered = renderComponent(component)
  const renderTime = performance.now() - startTime

  enhancedComponentCache.set(component, rendered, renderTime)
  return rendered
}

// Función para prefetch de componentes
export function prefetchComponentsEnhanced(components: Component[]): void {
  enhancedComponentCache.prefetch(components)
}

// Función para invalidar la caché cuando se reciben cambios
// Esta es la función que faltaba y que está siendo importada en collaboration-context.tsx
export function invalidateCacheOnChanges(): void {
  enhancedComponentCache.invalidateAll()
}
