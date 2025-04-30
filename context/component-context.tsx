"use client"

import { createContext, useContext, useCallback, type ReactNode, useEffect } from "react"
import { generateId } from "@/lib/utils"
import type { Component, Page } from "@/lib/models"
import { usePageContext } from "./page-context"
import { useCollaboration } from "./collaboration-context"

// Función de utilidad para logs condicionales
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development" && false) {
    // Establecido en false para deshabilitar logs
    console.log(`[ComponentContext] ${message}`, data || "")
  }
}

// Importar las funciones de utilidad
import { isStructuralComponentChange } from "@/lib/collaboration-utils"

interface ComponentContextType {
  addComponent: (component: Omit<Component, "id"> & { id?: string }) => string
  removeComponent: (id: string) => void
  updateComponent: (id: string, updatedComponent: Partial<Component>) => void
  getComponent: (id: string) => Component | undefined
  duplicateComponent: (id: string) => void
  updateComponentPosition: (id: string, x: number, y: number) => void
  getComponentsForCurrentPage: () => Component[]
  addChildToParent: (parentId: string, childId: string) => void
  removeChildFromParent: (parentId: string, childId: string) => void
}

const ComponentContext = createContext<ComponentContextType | undefined>(undefined)

// Función para obtener el estado completo del proyecto
function getFullProjectState(pages: Page[], currentPageIndex: number) {
  return {
    pages,
    currentPageIndex,
    components: pages[currentPageIndex]?.components || [],
  }
}

export function ComponentProvider({ children }: { children: ReactNode }) {
  const { pages, currentPageIndex, updatePage } = usePageContext()
  const { sendChange } = useCollaboration()

  const getComponentsForCurrentPage = useCallback(() => {
    return pages[currentPageIndex]?.components || []
  }, [pages, currentPageIndex])

  const addComponent = useCallback(
    (component: Omit<Component, "id"> & { id?: string }) => {
      // Usar el ID proporcionado o generar uno nuevo
      const newId = component.id || generateId()

      const newComponent: Component = {
        ...component,
        id: newId,
      }

      const updatedComponents = [...getComponentsForCurrentPage(), newComponent]

      // Si este componente tiene un parent, añadirlo al array de children del parent
      if (component.parentId) {
        const parentIndex = updatedComponents.findIndex((c) => c.id === component.parentId)
        if (parentIndex >= 0) {
          const parent = updatedComponents[parentIndex]
          updatedComponents[parentIndex] = {
            ...parent,
            children: [...(parent.children || []), newComponent.id],
          }
        }
      }

      const updatedPage = {
        ...pages[currentPageIndex],
        components: updatedComponents,
      }

      updatePage(currentPageIndex, updatedPage)

      // Obtener el estado completo actualizado
      const fullState = getFullProjectState(
        pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
        currentPageIndex,
      )

      // Enviar cambio al servidor con el estado completo
      sendChange(
        {
          type: "ADD_COMPONENT",
          payload: newComponent,
          pageIndex: currentPageIndex,
        },
        fullState,
      )

      return newId
    },
    [getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  const removeComponent = useCallback(
    (id: string) => {
      const components = getComponentsForCurrentPage()
      const component = components.find((c) => c.id === id)

      if (!component) return

      // Si este componente tiene un parent, eliminarlo del array de children del parent
      if (component.parentId) {
        const parentIndex = components.findIndex((c) => c.id === component.parentId)
        if (parentIndex >= 0) {
          const parent = components[parentIndex]
          const updatedParent = {
            ...parent,
            children: (parent.children || []).filter((childId) => childId !== id),
          }
          components[parentIndex] = updatedParent
        }
      }

      // Eliminar también todos los hijos de este componente
      const idsToRemove = new Set<string>()
      const collectIdsToRemove = (componentId: string) => {
        idsToRemove.add(componentId)
        const comp = components.find((c) => c.id === componentId)
        if (comp?.children?.length) {
          comp.children.forEach((childId) => collectIdsToRemove(childId))
        }
      }

      collectIdsToRemove(id)

      const updatedComponents = components.filter((c) => !idsToRemove.has(c.id))

      const updatedPage = {
        ...pages[currentPageIndex],
        components: updatedComponents,
      }

      updatePage(currentPageIndex, updatedPage)

      // Obtener el estado completo actualizado
      const fullState = getFullProjectState(
        pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
        currentPageIndex,
      )

      // Enviar cambio al servidor con el estado completo
      sendChange(
        {
          type: "REMOVE_COMPONENT",
          componentId: id,
          pageIndex: currentPageIndex,
        },
        fullState,
      )
    },
    [getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  // Modificar la función updateComponent para usar la función de utilidad
  const updateComponent = useCallback(
    (id: string, updatedComponentData: Partial<Component>) => {
      const components = getComponentsForCurrentPage()
      const componentIndex = components.findIndex((c) => c.id === id)

      if (componentIndex === -1) return

      const originalComponent = components[componentIndex]
      const updatedComponents = [...components]
      updatedComponents[componentIndex] = {
        ...updatedComponents[componentIndex],
        ...updatedComponentData,
      }

      const updatedPage = {
        ...pages[currentPageIndex],
        components: updatedComponents,
      }

      updatePage(currentPageIndex, updatedPage)

      // Determinar si es un cambio estructural importante usando la función de utilidad
      const isStructural = isStructuralComponentChange(originalComponent, updatedComponentData)

      // Obtener el estado completo actualizado solo si es un cambio estructural
      const fullState = isStructural
        ? getFullProjectState(
            pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
            currentPageIndex,
          )
        : undefined

      // Enviar cambio al servidor con el estado completo solo si es necesario
      sendChange(
        {
          type: "UPDATE_COMPONENT",
          componentId: id,
          payload: {
            id,
            ...updatedComponentData,
          },
          pageIndex: currentPageIndex,
        },
        fullState,
      )
    },
    [getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  const getComponent = useCallback(
    (id: string) => {
      return getComponentsForCurrentPage().find((component) => component.id === id)
    },
    [getComponentsForCurrentPage],
  )

  const duplicateComponent = useCallback(
    (id: string) => {
      const component = getComponent(id)
      if (component) {
        const newId = generateId()
        const duplicated: Component = {
          ...component,
          id: newId,
          position: component.position
            ? {
                x: component.position.x + 20,
                y: component.position.y + 20,
              }
            : undefined,
        }

        const updatedComponents = [...getComponentsForCurrentPage(), duplicated]

        // Si este componente tiene un parent, añadirlo al array de children del parent
        if (component.parentId) {
          const parentIndex = updatedComponents.findIndex((c) => c.id === component.parentId)
          if (parentIndex >= 0) {
            const parent = updatedComponents[parentIndex]
            updatedComponents[parentIndex] = {
              ...parent,
              children: [...(parent.children || []), newId],
            }
          }
        }

        const updatedPage = {
          ...pages[currentPageIndex],
          components: updatedComponents,
        }

        updatePage(currentPageIndex, updatedPage)

        // Obtener el estado completo actualizado
        const fullState = getFullProjectState(
          pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
          currentPageIndex,
        )

        // Enviar cambio al servidor como ADD_COMPONENT con el estado completo
        sendChange(
          {
            type: "ADD_COMPONENT",
            payload: duplicated,
            pageIndex: currentPageIndex,
          },
          fullState,
        )
      }
    },
    [getComponent, getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  // Modificar la función updateComponentPosition para asegurar que las posiciones sean enteros
  const updateComponentPosition = useCallback(
    (id: string, x: number, y: number) => {
      // Obtener el componente actual
      const component = getComponent(id)
      if (!component) return

      // Redondear las coordenadas a enteros
      const roundedX = Math.round(x)
      const roundedY = Math.round(y)

      // Verificar si la posición ha cambiado realmente
      if (component.position && component.position.x === roundedX && component.position.y === roundedY) {
        return // No actualizar si la posición es la misma
      }

      updateComponent(id, {
        position: {
          x: roundedX,
          y: roundedY,
        },
      })

      // No enviamos el estado completo para las actualizaciones de posición
      // ya que son muy frecuentes y no son cambios estructurales críticos
      sendChange({
        type: "MOVE_COMPONENT",
        componentId: id,
        payload: {
          position: {
            x: roundedX,
            y: roundedY,
          },
        },
        pageIndex: currentPageIndex,
      })
    },
    [updateComponent, sendChange, currentPageIndex, getComponent],
  )

  const addChildToParent = useCallback(
    (parentId: string, childId: string) => {
      const components = getComponentsForCurrentPage()
      const parentIndex = components.findIndex((c) => c.id === parentId)
      const childIndex = components.findIndex((c) => c.id === childId)

      if (parentIndex >= 0 && childIndex >= 0) {
        const parent = components[parentIndex]
        const child = components[childIndex]

        const updatedParent = {
          ...parent,
          children: [...(parent.children || []), childId],
        }

        const updatedChild = {
          ...child,
          parentId,
        }

        const updatedComponents = [...components]
        updatedComponents[parentIndex] = updatedParent
        updatedComponents[childIndex] = updatedChild

        const updatedPage = {
          ...pages[currentPageIndex],
          components: updatedComponents,
        }

        updatePage(currentPageIndex, updatedPage)

        // Obtener el estado completo actualizado
        const fullState = getFullProjectState(
          pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
          currentPageIndex,
        )

        // Enviar cambios al servidor con el estado completo
        sendChange(
          {
            type: "UPDATE_COMPONENT",
            componentId: parentId,
            payload: updatedParent,
            pageIndex: currentPageIndex,
          },
          fullState,
        )

        // No es necesario enviar el estado completo dos veces
        sendChange({
          type: "UPDATE_COMPONENT",
          componentId: childId,
          payload: updatedChild,
          pageIndex: currentPageIndex,
        })
      }
    },
    [getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  const removeChildFromParent = useCallback(
    (parentId: string, childId: string) => {
      const components = getComponentsForCurrentPage()
      const parentIndex = components.findIndex((c) => c.id === parentId)
      const childIndex = components.findIndex((c) => c.id === childId)

      if (parentIndex >= 0 && childIndex >= 0) {
        const parent = components[parentIndex]
        const child = components[childIndex]

        const updatedParent = {
          ...parent,
          children: (parent.children || []).filter((id) => id !== childId),
        }

        const updatedChild = {
          ...child,
          parentId: undefined,
        }

        const updatedComponents = [...components]
        updatedComponents[parentIndex] = updatedParent
        updatedComponents[childIndex] = updatedChild

        const updatedPage = {
          ...pages[currentPageIndex],
          components: updatedComponents,
        }

        updatePage(currentPageIndex, updatedPage)

        // Obtener el estado completo actualizado
        const fullState = getFullProjectState(
          pages.map((p, i) => (i === currentPageIndex ? updatedPage : p)),
          currentPageIndex,
        )

        // Enviar cambios al servidor con el estado completo
        sendChange(
          {
            type: "UPDATE_COMPONENT",
            componentId: parentId,
            payload: updatedParent,
            pageIndex: currentPageIndex,
          },
          fullState,
        )

        // No es necesario enviar el estado completo dos veces
        sendChange({
          type: "UPDATE_COMPONENT",
          componentId: childId,
          payload: updatedChild,
          pageIndex: currentPageIndex,
        })
      }
    },
    [getComponentsForCurrentPage, pages, currentPageIndex, updatePage, sendChange],
  )

  useEffect(() => {
    // Extender el manejador de mensajes entrantes para procesar cambios de componentes
    const handleComponentMessage = (message: any) => {
      // Ignorar mensajes propios
      if (message.userId === localStorage.getItem("userId")) return

      // Procesar mensajes relacionados con componentes
      switch (message.type) {
        case "ADD_COMPONENT":
          if (message.payload && message.pageIndex === currentPageIndex) {
            // Añadiendo componente desde colaborador

            // Crear una copia de los componentes actuales
            const updatedComponents = [...getComponentsForCurrentPage()]

            // Añadir el nuevo componente
            updatedComponents.push(message.payload)

            // Actualizar la página
            const updatedPage = {
              ...pages[currentPageIndex],
              components: updatedComponents,
            }

            updatePage(currentPageIndex, updatedPage)
          }
          break

        case "UPDATE_COMPONENT":
          if (message.componentId && message.pageIndex === currentPageIndex) {
            // Actualizando componente desde colaborador

            // Crear una copia de los componentes actuales
            const updatedComponents = [...getComponentsForCurrentPage()]

            // Encontrar el componente a actualizar
            const componentIndex = updatedComponents.findIndex((c) => c.id === message.componentId)

            if (componentIndex !== -1) {
              // Actualizar el componente
              updatedComponents[componentIndex] = {
                ...updatedComponents[componentIndex],
                ...message.payload,
              }

              // Actualizar la página
              const updatedPage = {
                ...pages[currentPageIndex],
                components: updatedComponents,
              }

              updatePage(currentPageIndex, updatedPage)
            }
          }
          break

        case "REMOVE_COMPONENT":
          if (message.componentId && message.pageIndex === currentPageIndex) {
            // Eliminando componente desde colaborador

            // Crear una copia de los componentes actuales
            const updatedComponents = getComponentsForCurrentPage().filter((c) => c.id !== message.componentId)

            // Actualizar la página
            const updatedPage = {
              ...pages[currentPageIndex],
              components: updatedComponents,
            }

            updatePage(currentPageIndex, updatedPage)
          }
          break

        case "MOVE_COMPONENT":
          if (message.componentId && message.pageIndex === currentPageIndex && message.payload?.position) {
            // Moviendo componente desde colaborador

            // Crear una copia de los componentes actuales
            const updatedComponents = [...getComponentsForCurrentPage()]

            // Encontrar el componente a mover
            const componentIndex = updatedComponents.findIndex((c) => c.id === message.componentId)

            if (componentIndex !== -1) {
              // Actualizar la posición del componente
              updatedComponents[componentIndex] = {
                ...updatedComponents[componentIndex],
                position: message.payload.position,
              }

              // Actualizar la página
              const updatedPage = {
                ...pages[currentPageIndex],
                components: updatedComponents,
              }

              updatePage(currentPageIndex, updatedPage)
            }
          }
          break

        case "INITIAL_STATE":
          if (message.payload?.pages && Array.isArray(message.payload.pages)) {
            // Recibido estado inicial con componentes
            // El estado inicial se maneja en page-context.tsx
          }
          break
      }
    }

    // Registrar el manejador para los mensajes WebSocket
    if (typeof window !== "undefined" && window.socket) {
      const originalOnMessage = window.socket.onmessage

      window.socket.onmessage = (event) => {
        // Llamar al manejador original primero
        if (originalOnMessage) {
          originalOnMessage.call(window.socket, event)
        }

        // Procesar el mensaje para componentes
        try {
          const message = JSON.parse(event.data)
          handleComponentMessage(message)
        } catch (error) {
          // Error procesando mensaje para componentes
        }
      }

      return () => {
        // Restaurar el manejador original al desmontar
        if (window.socket) {
          window.socket.onmessage = originalOnMessage
        }
      }
    }
  }, [currentPageIndex, pages, updatePage, getComponentsForCurrentPage])

  return (
    <ComponentContext.Provider
      value={{
        addComponent,
        removeComponent,
        updateComponent,
        getComponent,
        duplicateComponent,
        updateComponentPosition,
        getComponentsForCurrentPage,
        addChildToParent,
        removeChildFromParent,
      }}
    >
      {children}
    </ComponentContext.Provider>
  )
}

export function useComponentContext() {
  const context = useContext(ComponentContext)
  if (context === undefined) {
    throw new Error("useComponentContext must be used within a ComponentProvider")
  }
  return context
}
