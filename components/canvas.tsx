"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { useDrop } from "react-dnd"
import { useComponentContext } from "@/context/component-context"
import { usePageContext } from "@/context/page-context"
import VirtualizedCanvas from "./virtualized-canvas"
import { Settings, ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useCollaboration } from "@/context/collaboration-context"
import UserCursor from "./user-cursor"
import { useSettings } from "@/context/settings-context"
import { componentCache } from "@/lib/component-cache"

interface CanvasProps {
  selectedComponentId: string | null
  setSelectedComponentId: (id: string | null) => void
  viewportSize: "desktop" | "tablet" | "mobile"
}

export default function Canvas({ selectedComponentId, setSelectedComponentId, viewportSize }: CanvasProps) {
  const { getComponentsForCurrentPage, addComponent } = useComponentContext()
  const { getCurrentPage } = usePageContext()
  const currentPage = getCurrentPage()
  const { getPerformanceSettings } = useSettings()

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)
  const [canvasWidth, setCanvasWidth] = useState(1200)
  const [canvasHeight, setCanvasHeight] = useState(800)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { connectedUsers, updateCursorPosition, userId } = useCollaboration()

  // Añadir esta referencia justo después de las declaraciones de estado
  const lastCursorUpdateRef = useRef<number | null>(null)

  // Optimizar los handlers de eventos:
  // Añadir estos handlers memoizados después de las declaraciones de estado
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }, [])

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

  const handleCanvasClick = useCallback(() => {
    setSelectedComponentId(null)
  }, [setSelectedComponentId])

  const dragCanvas = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingCanvas) return

      const dx = e.clientX - startPoint.x
      const dy = e.clientY - startPoint.y

      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollPosition.x - dx
        containerRef.current.scrollTop = scrollPosition.y - dy
      }
    },
    [isDraggingCanvas, startPoint, scrollPosition],
  )

  // Actualizar el tamaño del canvas cuando cambia el tamaño de la ventana
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    updateCanvasSize()

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateCanvasSize)
      return () => window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  // Detect touch devices
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches)
    }
  }, [])

  // Mejorar soporte para dispositivos táctiles
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Prevenir zoom en dispositivos móviles al hacer doble tap
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const canvas = canvasRef.current
    if (canvas && typeof window !== "undefined") {
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    }

    return () => {
      if (canvas && typeof window !== "undefined") {
        canvas.removeEventListener("touchstart", handleTouchStart)
      }
    }
  }, [])

  // Efecto para manejar la limpieza de caché periódica
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      componentCache.cleanup()
    }, 60000) // Limpiar cada minuto

    return () => clearInterval(cleanupInterval)
  }, [])

  const [{ isOver }, drop] = useDrop({
    accept: "COMPONENT",
    drop: (item: any, monitor) => {
      // If the item is already being handled by a child component, don't handle it here
      if (monitor.didDrop()) {
        return
      }

      // If it's a new component being added from the sidebar
      const clientOffset = monitor.getClientOffset()

      if (clientOffset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = (clientOffset.x - canvasRect.left) / (zoom / 100)
        const y = (clientOffset.y - canvasRect.top) / (zoom / 100)

        const newComponent = {
          type: item.type,
          props: { ...item.defaultProps },
          style: { ...item.defaultStyle },
          position: { x, y }, // Position is only used in the editor
          children: item.defaultChildren || [],
        }

        // Indicar que estamos renderizando
        setIsRendering(true)

        // Limpiar cualquier timeout anterior
        if (renderTimeoutRef.current) {
          clearTimeout(renderTimeoutRef.current)
        }

        // Añadir el componente
        addComponent(newComponent)

        // Establecer un timeout para indicar que hemos terminado de renderizar
        renderTimeoutRef.current = setTimeout(() => {
          setIsRendering(false)
        }, 500)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  })

  // Mejorar el manejo de eventos del mouse para enviar actualizaciones de cursor más frecuentes

  // Modificar la función handleMouseMove:

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Actualizar la posición del cursor para colaboración sin throttling
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - canvasRect.left
        const y = e.clientY - canvasRect.top

        // Enviar cada movimiento del cursor sin throttling
        updateCursorPosition(x, y)
      }

      // Mantener la funcionalidad original de arrastrar el canvas
      dragCanvas(e)
    },
    [dragCanvas, updateCursorPosition],
  )

  // Funciones para manejar el arrastre del canvas
  const startDraggingCanvas = (e: React.MouseEvent) => {
    if (e.button !== 1 && !e.altKey) return // Solo arrastrar con botón medio o Alt + clic izquierdo

    setIsDraggingCanvas(true)
    setStartPoint({ x: e.clientX, y: e.clientY })

    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      })
    }

    e.preventDefault()
  }

  const stopDraggingCanvas = () => {
    setIsDraggingCanvas(false)
  }

  // Get components for the current page
  const components = getComponentsForCurrentPage()
  const performanceSettings = getPerformanceSettings()

  // Filtrar usuarios conectados para mostrar solo los activos
  const activeUsers = connectedUsers.filter(
    (user) => user.userId !== userId && user.cursorPosition && Date.now() - user.lastActive < 30000, // Solo mostrar usuarios activos en los últimos 30 segundos
  )

  return (
    <div className="h-full flex flex-col">
      {/* Canvas controls */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleZoomOut} title="Reducir zoom">
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Slider value={[zoom]} min={50} max={200} step={5} className="w-24 mx-2" onValueChange={handleZoomChange} />

          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleZoomIn} title="Aumentar zoom">
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="text-xs bg-secondary/30 px-2 py-1 rounded-md ml-2">{zoom}%</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Página:</Label>
            <div className="text-xs font-medium bg-secondary/30 px-2 py-1 rounded-md">
              {currentPage?.name || "Sin nombre"}
            </div>
          </div>

          <div className="h-8 border-l border-border mx-2"></div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Tamaño:</Label>
            <div className="flex gap-1">
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number.parseInt(e.target.value) || 1200)}
                className="w-16 h-7 px-1 text-xs bg-secondary/30 border border-border rounded-md"
              />
              <span className="text-xs flex items-center">×</span>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number.parseInt(e.target.value) || 800)}
                className="w-16 h-7 px-1 text-xs bg-secondary/30 border border-border rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        onMouseMove={handleMouseMove}
        onMouseUp={stopDraggingCanvas}
        onMouseLeave={stopDraggingCanvas}
      >
        {/* Indicador de renderizado */}
        {isRendering && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/80 text-xs py-1 px-3 rounded-full z-20 backdrop-blur-sm flex items-center gap-2">
            <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Renderizando...</span>
          </div>
        )}

        {/* Indicador de usuarios conectados */}
        {activeUsers.length > 0 && (
          <div className="absolute top-4 right-4 bg-background/80 text-xs py-1 px-3 rounded-full z-20 backdrop-blur-sm">
            <span className="mr-2">Usuarios conectados:</span>
            {activeUsers.map((user) => (
              <span
                key={user.userId}
                className="inline-block px-2 py-1 rounded-full text-white mx-1"
                style={{ backgroundColor: user.color }}
              >
                {user.username}
              </span>
            ))}
          </div>
        )}

        <div
          id="canvas"
          ref={(node) => {
            drop(node)
            canvasRef.current = node
          }}
          className={`relative canvas-grid ${
            viewportSize === "mobile" ? "viewport-mobile" : viewportSize === "tablet" ? "viewport-tablet" : ""
          }`}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundColor: currentPage?.pageSettings.backgroundColor || "#f9fafb",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "0 0",
            cursor: isDraggingCanvas ? "grabbing" : "default",
          }}
          onClick={handleCanvasClick}
          onMouseDown={startDraggingCanvas}
          onMouseMove={handleMouseMove}
        >
          {/* Empty state */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">Ningún componente seleccionado</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {isTouchDevice
                  ? "Toca el botón + para añadir componentes desde el panel lateral"
                  : "Arrastra componentes desde el panel lateral"}
              </p>
            </div>
          )}

          {/* Componentes virtualizados */}
          {components.length > 0 && (
            <VirtualizedCanvas
              selectedComponentId={selectedComponentId}
              setSelectedComponentId={setSelectedComponentId}
              canvasRef={canvasRef}
              zoom={zoom}
            />
          )}

          {/* Cursores de otros usuarios - Renderizar siempre, incluso si no hay componentes */}
          {activeUsers.length > 0 && (
            <>
              {activeUsers.map((user) => (
                <UserCursor
                  key={user.userId}
                  position={user.cursorPosition!}
                  username={user.username}
                  color={user.color}
                  zoom={zoom}
                />
              ))}
              {/* Indicador de usuarios activos más visible */}
              <div className="absolute top-4 right-4 bg-background/90 text-xs py-2 px-4 rounded-md z-30 backdrop-blur-sm border border-primary shadow-lg">
                <span className="mr-2 font-medium">Usuarios conectados:</span>
                {activeUsers.map((user) => (
                  <span
                    key={user.userId}
                    className="inline-block px-2 py-1 rounded-full text-white mx-1 shadow-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.username}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canvas navigation help */}
      <div className="absolute bottom-4 left-4 bg-secondary/80 backdrop-blur-sm text-xs p-2 rounded-md z-10 pointer-events-none">
        <div className="flex items-center gap-1">
          <Move className="h-3 w-3" />
          <span>Alt + Arrastrar o botón medio para navegar</span>
        </div>
      </div>
    </div>
  )
}
