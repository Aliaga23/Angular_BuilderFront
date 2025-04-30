"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useComponentContext } from "@/context/component-context"
import { useSettings } from "@/context/settings-context"
import SuperOptimizedCanvasComponent from "./super-optimized-canvas-component"
import { prefetchComponentsEnhanced } from "@/lib/enhanced-component-cache"

interface VirtualizedCanvasProps {
  selectedComponentId: string | null
  setSelectedComponentId: (id: string | null) => void
  canvasRef: React.RefObject<HTMLDivElement>
  zoom: number
}

export default function VirtualizedCanvas({
  selectedComponentId,
  setSelectedComponentId,
  canvasRef,
  zoom,
}: VirtualizedCanvasProps) {
  const { getComponentsForCurrentPage } = useComponentContext()
  const { getPerformanceSettings } = useSettings()
  const [visibleRect, setVisibleRect] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const components = getComponentsForCurrentPage()
  const performanceSettings = getPerformanceSettings()
  const [lastScrollTime, setLastScrollTime] = useState(0)

  // Usar la configuración de rendimiento para determinar el margen de carga
  const loadMargin = performanceSettings.lowPerformanceMode
    ? performanceSettings.virtualizedDistance || 100
    : performanceSettings.virtualizedDistance || 300

  // Actualizar el rectángulo visible cuando cambia el scroll o el zoom
  useEffect(() => {
    if (!canvasRef.current) return

    const updateVisibleRect = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const container = canvas.parentElement
      if (!container) return

      // Calcular el área visible teniendo en cuenta el scroll
      setVisibleRect({
        top: container.scrollTop / (zoom / 100),
        left: container.scrollLeft / (zoom / 100),
        width: container.clientWidth / (zoom / 100),
        height: container.clientHeight / (zoom / 100),
      })

      // Actualizar el tiempo del último scroll
      setLastScrollTime(Date.now())
    }

    // Actualizar inicialmente
    updateVisibleRect()

    // Throttle para el evento de scroll
    let scrollTimeout: number | null = null
    const throttledUpdateVisibleRect = () => {
      // Cancelar el timeout anterior si existe
      if (scrollTimeout !== null) {
        window.cancelAnimationFrame(scrollTimeout)
      }

      // Programar la actualización para el próximo frame
      scrollTimeout = window.requestAnimationFrame(() => {
        updateVisibleRect()
        scrollTimeout = null
      })
    }

    // Actualizar cuando cambia el scroll
    const container = canvasRef.current.parentElement
    if (container) {
      container.addEventListener("scroll", throttledUpdateVisibleRect, { passive: true })
      window.addEventListener("resize", throttledUpdateVisibleRect, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", throttledUpdateVisibleRect)
        window.removeEventListener("resize", throttledUpdateVisibleRect)
      }

      if (scrollTimeout !== null) {
        window.cancelAnimationFrame(scrollTimeout)
      }
    }
  }, [canvasRef, zoom])

  // Determinar qué componentes son visibles con optimización
  const { visibleComponents, offscreenComponents } = useMemo(() => {
    if (!visibleRect.width || !visibleRect.height) {
      return { visibleComponents: components, offscreenComponents: [] }
    }

    // Área visible extendida con el margen de carga
    const extendedRect = {
      top: visibleRect.top - loadMargin,
      left: visibleRect.left - loadMargin,
      width: visibleRect.width + loadMargin * 2,
      height: visibleRect.height + loadMargin * 2,
    }

    // Dividir componentes en visibles y fuera de pantalla
    const visible: typeof components = []
    const offscreen: typeof components = []

    // Optimización: ordenar componentes por distancia al centro visible
    const centerX = visibleRect.left + visibleRect.width / 2
    const centerY = visibleRect.top + visibleRect.height / 2

    // Añadir distancia al centro como propiedad temporal
    const componentsWithDistance = components.map((component) => {
      const x = component.position?.x || 0
      const y = component.position?.y || 0
      const width = component.props.width || 300
      const height = component.props.height || 200

      // Calcular el centro del componente
      const componentCenterX = x + width / 2
      const componentCenterY = y + height / 2

      // Calcular distancia al centro del área visible
      const distance = Math.sqrt(Math.pow(componentCenterX - centerX, 2) + Math.pow(componentCenterY - centerY, 2))

      return { component, distance }
    })

    // Ordenar por distancia (más cercanos primero)
    componentsWithDistance.sort((a, b) => a.distance - b.distance)

    // Procesar componentes en orden de cercanía
    for (const { component } of componentsWithDistance) {
      const x = component.position?.x || 0
      const y = component.position?.y || 0
      const width = component.props.width || 300
      const height = component.props.height || 200

      // Comprobar si el componente está dentro del área visible extendida
      if (
        x < extendedRect.left + extendedRect.width &&
        x + width > extendedRect.left &&
        y < extendedRect.top + extendedRect.height &&
        y + height > extendedRect.top
      ) {
        visible.push(component)
      } else {
        offscreen.push(component)
      }
    }

    return { visibleComponents: visible, offscreenComponents: offscreen }
  }, [components, visibleRect, loadMargin])

  // Prefetch de componentes fuera de pantalla pero cercanos
  useEffect(() => {
    // Solo prefetch si está habilitado y no estamos en modo de bajo rendimiento
    if (
      performanceSettings.prefetchEnabled !== false &&
      !performanceSettings.lowPerformanceMode &&
      offscreenComponents.length > 0 &&
      // Solo hacer prefetch si no ha habido scroll recientemente
      Date.now() - lastScrollTime > 200
    ) {
      // Ordenar por distancia al área visible
      const sortedOffscreen = [...offscreenComponents].sort((a, b) => {
        const aX = a.position?.x || 0
        const aY = a.position?.y || 0
        const bX = b.position?.x || 0
        const bY = b.position?.y || 0

        // Calcular distancia al centro del área visible
        const visibleCenterX = visibleRect.left + visibleRect.width / 2
        const visibleCenterY = visibleRect.top + visibleRect.height / 2

        const distA = Math.sqrt(Math.pow(aX - visibleCenterX, 2) + Math.pow(aY - visibleCenterY, 2))
        const distB = Math.sqrt(Math.pow(bX - visibleCenterX, 2) + Math.pow(bY - visibleCenterY, 2))

        return distA - distB
      })

      // Prefetch de los componentes más cercanos
      prefetchComponentsEnhanced(sortedOffscreen.slice(0, 10))
    }
  }, [visibleComponents, offscreenComponents, visibleRect, performanceSettings, lastScrollTime])

  return (
    <>
      {visibleComponents.map((component) => (
        <SuperOptimizedCanvasComponent
          key={component.id}
          component={component}
          isSelected={component.id === selectedComponentId}
          onClick={() => setSelectedComponentId(component.id)}
        />
      ))}
    </>
  )
}
