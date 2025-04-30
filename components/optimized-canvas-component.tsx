"use client"

import type React from "react"

import { useRef, useState, useEffect, useMemo, memo } from "react"
import { useComponentContext } from "@/context/component-context"
import { renderWithCache } from "@/lib/component-cache"
import { GripVertical, Trash2, Copy } from "lucide-react"
import { useCollaboration } from "@/context/collaboration-context"

// Función simple de throttle para limitar la frecuencia de llamadas a una función
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

interface OptimizedCanvasComponentProps {
  component: any
  isSelected: boolean
  onClick: () => void
}

function OptimizedCanvasComponent({ component, isSelected, onClick }: OptimizedCanvasComponentProps) {
  const { updateComponentPosition, removeComponent, duplicateComponent } = useComponentContext()
  const componentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialComponentPos, setInitialComponentPos] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const { connectedUsers, userId, setActiveComponent } = useCollaboration()

  // Encontrar usuarios que están editando este componente
  const editingUsers = connectedUsers.filter((user) => user.userId !== userId && user.currentComponent === component.id)

  // Crear una versión throttled de updateComponentPosition
  const throttledUpdatePosition = useRef(
    throttle((id: string, x: number, y: number) => {
      updateComponentPosition(id, x, y)
    }, 50),
  ).current

  // Handle component selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveComponent(component.id)
    onClick()
  }

  // Start dragging from the drag handle
  const startDragging = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Store initial mouse position
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY,
    })

    // Store initial component position
    setInitialComponentPos({
      x: component.position.x,
      y: component.position.y,
    })

    setIsDragging(true)
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    // Calculate the distance moved
    const deltaX = e.clientX - initialMousePos.x
    const deltaY = e.clientY - initialMousePos.y

    // Calculate new position
    const newX = Math.max(0, initialComponentPos.x + deltaX)
    const newY = Math.max(0, initialComponentPos.y + deltaY)

    // Actualizar directamente el DOM para una respuesta más fluida
    if (componentRef.current) {
      componentRef.current.style.left = `${newX}px`
      componentRef.current.style.top = `${newY}px`
    }

    // Update component position using the throttled function
    throttledUpdatePosition(component.id, Math.round(newX), Math.round(newY))
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
    }
  }

  // Handle context menu (right click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowContextMenu(true)
    onClick() // Seleccionar el componente
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showContextMenu])

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // Renderizar el componente con caché
  const renderedComponent = useMemo(() => {
    return renderWithCache(component)
  }, [component])

  return (
    <div
      ref={componentRef}
      style={{
        position: "absolute",
        left: component.position.x,
        top: component.position.y,
        width: component.props.width ? `${component.props.width}px` : component.style.width,
        height: component.props.height ? `${component.props.height}px` : component.style.height,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isSelected || isDragging ? 10 : 1,
        userSelect: "none", // Prevent text selection
        transition: isDragging ? "none" : "box-shadow 0.2s, outline 0.2s",
        boxShadow: isSelected ? "0 0 0 1px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
        willChange: "transform, left, top", // Optimización para el navegador
      }}
      className={`${
        isSelected ? "outline outline-2 outline-primary" : "hover:outline hover:outline-1 hover:outline-primary/50"
      } rounded-md hardware-accelerated`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Drag handle - always visible but subtle when not selected */}
      <div
        className={`absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        ${isSelected ? "opacity-100" : "opacity-0 hover:opacity-100"} transition-opacity`}
        onMouseDown={startDragging}
      >
        <div
          className={`flex items-center justify-center p-1 rounded-full cursor-grab active:cursor-grabbing
          ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          <GripVertical className="h-3 w-3" />
        </div>
      </div>

      {/* The actual component */}
      <div className="relative">{renderedComponent}</div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          className="absolute right-0 top-0 bg-popover border border-border rounded-md shadow-md py-1 w-48 z-50"
          style={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm flex items-center hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              removeComponent(component.id)
              setShowContextMenu(false)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            <span className="text-destructive">Eliminar</span>
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm flex items-center hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              duplicateComponent(component.id)
              setShowContextMenu(false)
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            <span>Duplicar</span>
          </button>
        </div>
      )}
      {editingUsers.length > 0 && (
        <div className="absolute -top-6 right-0 flex space-x-1">
          {editingUsers.map((user) => (
            <div
              key={user.userId}
              className="px-2 py-1 rounded-md text-xs text-white animate-pulse"
              style={{ backgroundColor: user.color }}
              title={`${user.username} está editando este componente`}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Usar memo para evitar re-renderizaciones innecesarias
export default memo(OptimizedCanvasComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el componente o el estado de selección

  // Si el componente está seleccionado, siempre re-renderizar
  if (nextProps.isSelected || prevProps.isSelected) {
    return false // Forzar re-renderizado cuando está seleccionado
  }

  // Verificar cambios en el ID
  if (prevProps.component.id !== nextProps.component.id) {
    return false // Forzar re-renderizado si cambia el ID
  }

  // Verificar cambios en la posición
  const prevPos = prevProps.component.position || {}
  const nextPos = nextProps.component.position || {}
  if (prevPos.x !== nextPos.x || prevPos.y !== nextPos.y) {
    return false // Forzar re-renderizado si cambia la posición
  }

  // Verificar cambios en las propiedades
  if (JSON.stringify(prevProps.component.props) !== JSON.stringify(nextProps.component.props)) {
    return false // Forzar re-renderizado si cambian las propiedades
  }

  // Verificar cambios en el estilo
  if (JSON.stringify(prevProps.component.style) !== JSON.stringify(nextProps.component.style)) {
    return false // Forzar re-renderizado si cambia el estilo
  }

  // Si no hay cambios, evitar re-renderizado
  return true
})
