// Sistema de caché para componentes renderizados
// Esto mejora el rendimiento al evitar re-renderizaciones innecesarias

import type { Component } from "@/lib/models"
import { renderComponent } from "@/lib/component-renderer"
import type React from "react"

// Interfaz para la entrada de caché
interface CacheEntry {
  renderedComponent: React.ReactNode
  hash: string
  lastAccessed: number
  version: number // Añadir versión para forzar invalidación
}

// Tamaño máximo de la caché
const MAX_CACHE_SIZE = 100

// Tiempo de vida de la caché en milisegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000

// Número máximo de componentes a prefetch en cada ciclo
const MAX_PREFETCH_COUNT = 5

class ComponentCache {
  private cache: Map<string, CacheEntry> = new Map()
  private cacheHits = 0
  private cacheMisses = 0
  private globalVersion = 1 // Versión global para forzar invalidación
  private prefetchQueue: string[] = []
  private isPrefetching = false

  // Generar un hash para un componente
  private generateHash(component: Component): string {
    // Crear un hash basado en las propiedades relevantes del componente
    const { id, type, props, style } = component
    return JSON.stringify({ id, type, props, style })
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
  public set(component: Component, renderedComponent: React.ReactNode): void {
    const id = component.id
    const hash = this.generateHash(component)

    // Almacenar el componente renderizado en la caché
    this.cache.set(id, {
      renderedComponent,
      hash,
      lastAccessed: Date.now(),
      version: this.globalVersion,
    })

    // Si la caché es demasiado grande, eliminar las entradas más antiguas
    if (this.cache.size > MAX_CACHE_SIZE) {
      this.cleanup()
    }
  }

  // Invalidar una entrada de la caché
  public invalidate(id: string): void {
    this.cache.delete(id)
    // También eliminar de la cola de prefetch si existe
    this.prefetchQueue = this.prefetchQueue.filter((queuedId) => queuedId !== id)
  }

  // Invalidar todas las entradas de la caché
  public invalidateAll(): void {
    this.globalVersion++
    // console.log(`Caché invalidada globalmente. Nueva versión: ${this.globalVersion}`)
  }

  // Limpiar la caché
  public cleanup(): void {
    // Si la caché es pequeña, no hacer nada
    if (this.cache.size <= MAX_CACHE_SIZE / 2) {
      return
    }

    const now = Date.now()
    const entries = Array.from(this.cache.entries())

    // Ordenar por tiempo de último acceso (más antiguo primero)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    // Eliminar las entradas más antiguas
    const entriesToRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 4))
    for (const [id] of entriesToRemove) {
      this.cache.delete(id)
    }

    // Eliminar entradas que no se han accedido en mucho tiempo
    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > CACHE_TTL) {
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
        const rendered = renderComponent(component)
        this.set(component, rendered)
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
  public getStats(): { size: number; hits: number; misses: number; hitRate: number; version: number } {
    const total = this.cacheHits + this.cacheMisses
    const hitRate = total > 0 ? this.cacheHits / total : 0

    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: hitRate,
      version: this.globalVersion,
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
  }
}

// Exportar una instancia singleton
export const componentCache = new ComponentCache()

// Función de ayuda para renderizar un componente con caché
export function renderWithCache(component: Component): React.ReactNode {
  // Intentar obtener de la caché
  const cached = componentCache.get(component)
  if (cached) {
    return cached
  }

  // Si no está en caché, renderizar y almacenar
  const rendered = renderComponent(component)
  componentCache.set(component, rendered)
  return rendered
}

// Función para prefetch de componentes
export function prefetchComponents(components: Component[]): void {
  componentCache.prefetch(components)
}

// Función para invalidar la caché cuando se reciben cambios
export function invalidateCacheOnChanges(): void {
  componentCache.invalidateAll()
}

// Hacer accesible la caché para depuración
if (typeof window !== "undefined") {
  ;(window as any).componentCache = componentCache
}
