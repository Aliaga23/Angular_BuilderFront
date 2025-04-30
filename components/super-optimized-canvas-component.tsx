"use client"

import type React from "react"
import { useRef, useState, useEffect, useMemo, memo, useCallback } from "react"
import { useComponentContext } from "@/context/component-context"
import { renderWithEnhancedCache } from "@/lib/enhanced-component-cache"
import { Trash2, Copy } from "lucide-react"
import { useCollaboration } from "@/context/collaboration-context"

// Función mejorada de throttle con opciones avanzadas
function advancedThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  } = {},
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan = 0
  let lastArgs: Parameters<T> | null = null
  const { leading = true, trailing = true, maxWait } = options

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now()

    // Si es la primera llamada y queremos ejecutar al inicio
    if (!lastRan && leading) {
      func.apply(this, args)
      lastRan = now
      return
    }

    // Limpiar el timeout anterior si existe
    if (lastFunc) {
      clearTimeout(lastFunc)
    }

    // Verificar si ha pasado el tiempo máximo de espera
    if (maxWait !== undefined && now - lastRan >= maxWait && lastArgs) {
      func.apply(this, lastArgs)
      lastRan = now
      lastArgs = null
      return
    }

    // Guardar los argumentos más recientes
    lastArgs = args

    // Si queremos ejecutar al final del periodo
    if (trailing) {
      lastFunc = setTimeout(
        () => {
          const timeSinceLastRan = Date.now() - lastRan
          if (timeSinceLastRan >= limit && lastArgs) {
            func.apply(this, lastArgs)
            lastRan = Date.now()
            lastArgs = null
          }
        },
        limit - (now - lastRan),
      )
    }
  }
}

interface SuperOptimizedCanvasComponentProps {
  component: any
  isSelected: boolean
  onClick: () => void
}

function SuperOptimizedCanvasComponent({ component, isSelected, onClick }: SuperOptimizedCanvasComponentProps) {
  const { updateComponentPosition, removeComponent, duplicateComponent } = useComponentContext()
  const componentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialComponentPos, setInitialComponentPos] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const { connectedUsers, userId, setActiveComponent } = useCollaboration()
  const positionRef = useRef(component.position)
  const lastUpdateTimeRef = useRef(0)

  // Encontrar usuarios que están editando este componente
  const editingUsers = useMemo(() => {
    return connectedUsers.filter((user) => user.userId !== userId && user.currentComponent === component.id)
  }, [connectedUsers, userId, component.id])

  // Crear una versión throttled de updateComponentPosition con opciones avanzadas
  const throttledUpdatePosition = useCallback(
    advancedThrottle(
      (id: string, x: number, y: number) => {
        // Actualizar la posición exacta sin restricciones ni redondeo
        updateComponentPosition(id, x, y)
        positionRef.current = { x, y }
        lastUpdateTimeRef.current = Date.now()
      },
      50,
      { leading: true, trailing: true, maxWait: 100 },
    ),
    [updateComponentPosition],
  )

  // Actualizar la referencia de posición cuando cambia el componente
  useEffect(() => {
    positionRef.current = component.position
  }, [component.position])

  // Handle component selection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setActiveComponent(component.id)
      onClick()
    },
    [component.id, setActiveComponent, onClick],
  )

  // Start dragging from anywhere in the component
  const startDragging = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [component.position],
  )

  // Handle mouse move for dragging - optimizado para rendimiento
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      // Calculate the distance moved
      const deltaX = e.clientX - initialMousePos.x
      const deltaY = e.clientY - initialMousePos.y

      // Calculate new position - sin restricciones
      const newX = initialComponentPos.x + deltaX
      const newY = initialComponentPos.y + deltaY

      // Redondear las posiciones para el DOM
      const roundedX = Math.round(newX)
      const roundedY = Math.round(newY)

      // Actualizar directamente el DOM para una respuesta más fluida
      if (componentRef.current) {
        componentRef.current.style.left = `${roundedX}px`
        componentRef.current.style.top = `${roundedY}px`
      }

      // Update component position using the throttled function with rounded values
      throttledUpdatePosition(component.id, roundedX, roundedY)
    },
    [isDragging, initialMousePos, initialComponentPos, component.id, throttledUpdatePosition],
  )

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)

      // Forzar una actualización final con la posición exacta redondeada
      if (componentRef.current) {
        const left = Number.parseFloat(componentRef.current.style.left)
        const top = Number.parseFloat(componentRef.current.style.top)

        if (!isNaN(left) && !isNaN(top)) {
          updateComponentPosition(component.id, Math.round(left), Math.round(top))
        }
      }
    }
  }, [isDragging, component.id, updateComponentPosition])

  // Handle context menu (right click)
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowContextMenu(true)
      onClick() // Seleccionar el componente
    },
    [onClick],
  )

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
      window.addEventListener("mousemove", handleMouseMove, { passive: true })
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Renderizar el componente con caché mejorada
  const renderedComponent = useMemo(() => {
    return renderWithEnhancedCache(component)
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
        contain: "layout paint style", // Optimización adicional para aislamiento de renderizado
        cursor: "move", // Cambiar el cursor para indicar que todo el componente es arrastrable
      }}
      className={`${
        isSelected
          ? "outline outline-2 outline-primary"
          : editingUsers.length > 0
            ? `outline outline-1 outline-dashed`
            : "hover:outline hover:outline-1 hover:outline-primary/50"
      } rounded-md hardware-accelerated`}
      onClick={handleClick}
      onMouseDown={startDragging} // Permitir arrastrar desde cualquier parte del componente
      onContextMenu={handleContextMenu}
    >
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
        <div className="absolute -top-6 right-0 flex space-x-1 z-20">
          {editingUsers.map((user) => (
            <div
              key={user.userId}
              className="px-2 py-1 rounded-md text-xs text-white animate-pulse shadow-md"
              style={{
                backgroundColor: user.color,
                boxShadow: `0 0 8px ${user.color}80`, // Añadir un resplandor del color del usuario
              }}
              title={`${user.username} está editando este componente`}
            >
              <span className="font-medium">{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Usar memo con una función de comparación altamente optimizada
export default memo(SuperOptimizedCanvasComponent, (prevProps, nextProps) => {
  // Si el componente está seleccionado, siempre re-renderizar
  if (nextProps.isSelected || prevProps.isSelected) {
    return false
  }

  // Verificar cambios en el ID
  if (prevProps.component.id !== nextProps.component.id) {
    return false
  }

  // Verificar cambios en la posición con tolerancia
  const prevPos = prevProps.component.position || {}
  const nextPos = nextProps.component.position || {}

  // Permitir pequeñas diferencias en la posición sin re-renderizar
  const positionTolerance = 2 // 2px de tolerancia
  if (Math.abs(prevPos.x - nextPos.x) > positionTolerance || Math.abs(prevPos.y - nextPos.y) > positionTolerance) {
    return false
  }

  // Verificar cambios en propiedades visuales críticas
  const prevStyle = prevProps.component.style || {}
  const nextStyle = nextProps.component.style || {}

  if (
    prevStyle.backgroundColor !== nextStyle.backgroundColor ||
    prevStyle.color !== nextStyle.color ||
    prevStyle.borderColor !== nextStyle.borderColor
  ) {
    return false
  }

  // Verificar cambios en dimensiones
  if (
    prevProps.component.props.width !== nextProps.component.props.width ||
    prevProps.component.props.height !== nextProps.component.props.height
  ) {
    return false
  }

  // Verificar cambios en propiedades de texto
  if (
    prevProps.component.props.text !== nextProps.component.props.text ||
    prevProps.component.props.label !== nextProps.component.props.label
  ) {
    return false
  }

  // Si no hay cambios visuales importantes, evitar re-renderizado
  return true
})
