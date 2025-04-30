"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Page, PageSettings } from "@/lib/models"
import { useCollaboration } from "./collaboration-context"
import { projectService } from "@/lib/api-service"
// Importar las funciones de utilidad
import { isStructuralPageChange } from "@/lib/collaboration-utils"

// Función de utilidad para logs condicionales
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development" && false) {
    // Establecido en false para deshabilitar logs
    console.log(`[PageContext] ${message}`, data || "")
  }
}

interface PageContextType {
  pages: Page[]
  currentPageIndex: number
  addPage: (page: Omit<Page, "components">) => void
  removePage: (index: number) => void
  updatePage: (index: number, updatedPage: Page) => void
  setCurrentPageIndex: (index: number) => void
  getCurrentPage: () => Page | undefined
  updatePageSettings: (index: number, settings: PageSettings) => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

// Initial default page
const defaultPage: Page = {
  name: "landing",
  route: "",
  pageSettings: {
    backgroundColor: "#f9fafb",
    theme: "light",
  },
  components: [],
}

// Función para obtener el estado completo del proyecto
function getFullProjectState(pages: Page[], currentPageIndex: number) {
  return {
    pages,
    currentPageIndex,
    components: pages[currentPageIndex]?.components || [],
  }
}

export function PageProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([defaultPage])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const { sendChange, handleIncomingMessage, projectId } = useCollaboration()

  // Cargar el proyecto desde la base de datos al iniciar
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return

      try {
        const projectData = await projectService.loadProject(projectId)
        if (projectData && projectData.pages) {
          // Proyecto cargado desde la base de datos
          setPages(projectData.pages)
          setCurrentPageIndex(projectData.currentPageIndex || 0)
        }
      } catch (error) {
        console.error("Error al cargar el proyecto:", error)
      }
    }

    loadProject()
  }, [projectId])

  // Registrar manejadores para mensajes entrantes relacionados con páginas
  useEffect(() => {
    // Extender el manejador de mensajes entrantes para procesar cambios de página
    const handlePageMessage = (message: any) => {
      // Ignorar mensajes propios
      if (message.userId === localStorage.getItem("userId")) return

      // Procesar mensajes específicos de páginas
      switch (message.type) {
        case "INITIAL_STATE":
          // Estado inicial recibido

          if (message.payload?.pages && Array.isArray(message.payload.pages)) {
            // Actualizando todas las páginas desde estado inicial
            setPages(message.payload.pages)

            // Establecer la página actual
            if (message.payload.currentPageIndex !== undefined) {
              setCurrentPageIndex(message.payload.currentPageIndex)
            }
          }
          break

        case "ADD_PAGE":
          if (message.payload) {
            // Añadiendo página desde colaborador
            setPages((prev) => [...prev, message.payload])
          }
          break

        case "REMOVE_PAGE":
          if (message.pageIndex !== undefined) {
            // Eliminando página desde colaborador
            setPages((prev) => prev.filter((_, i) => i !== message.pageIndex))

            // Ajustar el índice de página actual si es necesario
            if (currentPageIndex >= message.pageIndex && currentPageIndex > 0) {
              setCurrentPageIndex(currentPageIndex - 1)
            }
          }
          break

        case "UPDATE_PAGE":
          if (message.pageIndex !== undefined && message.payload) {
            // Actualizando página desde colaborador
            setPages((prev) =>
              prev.map((page, i) => (i === message.pageIndex ? { ...page, ...message.payload } : page)),
            )
          }
          break

        case "CHANGE_CURRENT_PAGE":
          if (message.payload?.index !== undefined) {
            // Cambiando página actual desde colaborador
            setCurrentPageIndex(message.payload.index)
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

        // Procesar el mensaje para páginas
        try {
          const message = JSON.parse(event.data)
          handlePageMessage(message)
        } catch (error) {
          console.error("Error procesando mensaje para páginas:", error)
        }
      }

      return () => {
        // Restaurar el manejador original al desmontar
        if (window.socket) {
          window.socket.onmessage = originalOnMessage
        }
      }
    }
  }, [currentPageIndex, setCurrentPageIndex])

  // Mejorar la función que maneja el evento de guardar proyecto
  useEffect(() => {
    // Función para manejar la solicitud de guardar el proyecto
    const handleSaveRequest = async (event: CustomEvent) => {
      const { userId } = event.detail

      // Obtener el estado completo del proyecto
      const fullState = getFullProjectState(pages, currentPageIndex)

      // Guardar en la base de datos
      try {
        if (projectId) {
          const success = await projectService.saveProject(projectId, fullState)
          if (success) {
            // Proyecto guardado en la base de datos
          }
        }
      } catch (error) {
        console.error("Error al guardar el proyecto:", error)
      }

      // Enviar el estado completo al servidor
      if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        const saveMessage = {
          type: "PROJECT_SAVED",
          userId,
          projectId,
          timestamp: Date.now(),
          payload: {
            requestFullState: true,
          },
          fullState,
        }

        window.socket.send(JSON.stringify(saveMessage))
        // Enviando estado completo del proyecto para guardar

        // Disparar un evento para notificar que el proyecto se ha guardado
        const savedEvent = new CustomEvent("projectSaved")
        window.dispatchEvent(savedEvent)
      } else {
        // No se pudo guardar el proyecto: WebSocket no disponible o cerrado
      }
    }

    // Registrar el listener para el evento
    if (typeof window !== "undefined") {
      window.addEventListener("requestProjectSave", handleSaveRequest as EventListener)

      // Limpiar el listener al desmontar
      return () => {
        window.removeEventListener("requestProjectSave", handleSaveRequest as EventListener)
      }
    }
  }, [pages, currentPageIndex, projectId])

  const addPage = (page: Omit<Page, "components">) => {
    const newPage = { ...page, components: [] }
    const updatedPages = [...pages, newPage]
    setPages(updatedPages)

    // Obtener el estado completo actualizado
    const fullState = getFullProjectState(updatedPages, currentPageIndex)

    // Enviar cambio al servidor con el estado completo
    sendChange(
      {
        type: "ADD_PAGE",
        payload: newPage,
        pageIndex: pages.length, // Índice de la nueva página
      },
      fullState,
    )
  }

  const removePage = (index: number) => {
    if (pages.length <= 1) return // Don't remove the last page

    const updatedPages = pages.filter((_, i) => i !== index)
    setPages(updatedPages)

    // Adjust current page index if needed
    let newPageIndex = currentPageIndex
    if (currentPageIndex >= index && currentPageIndex > 0) {
      newPageIndex = currentPageIndex - 1
      setCurrentPageIndex(newPageIndex)
    }

    // Obtener el estado completo actualizado
    const fullState = getFullProjectState(updatedPages, newPageIndex)

    // Enviar cambio al servidor con el estado completo
    sendChange(
      {
        type: "REMOVE_PAGE",
        payload: { index },
        pageIndex: index,
      },
      fullState,
    )
  }

  // Modificar la función updatePage para usar la función de utilidad
  const updatePage = (index: number, updatedPage: Page) => {
    const originalPage = pages[index]
    const updatedPages = pages.map((page, i) => (i === index ? updatedPage : page))
    setPages(updatedPages)

    // Determinar si es un cambio estructural importante usando la función de utilidad
    const isStructural = isStructuralPageChange(originalPage, updatedPage)

    // Obtener el estado completo actualizado solo si es un cambio estructural
    const fullState = isStructural ? getFullProjectState(updatedPages, currentPageIndex) : undefined

    // Enviar cambio al servidor con el estado completo solo si es necesario
    sendChange(
      {
        type: "UPDATE_PAGE",
        payload: updatedPage,
        pageIndex: index,
      },
      fullState,
    )
  }

  const getCurrentPage = () => {
    return pages[currentPageIndex]
  }

  // Modificar la función updatePageSettings para ser más selectiva

  const updatePageSettings = (index: number, settings: PageSettings) => {
    const updatedPages = pages.map((page, i) => (i === index ? { ...page, pageSettings: settings } : page))
    setPages(updatedPages)

    // Determinar si es un cambio estructural importante
    // Los cambios en la configuración de la página generalmente son estructurales
    const isStructuralChange =
      settings.backgroundColor !== pages[index].pageSettings.backgroundColor ||
      settings.theme !== pages[index].pageSettings.theme

    // Obtener el estado completo actualizado solo si es un cambio estructural
    const fullState = isStructuralChange ? getFullProjectState(updatedPages, currentPageIndex) : undefined

    // Enviar cambio al servidor con el estado completo solo si es necesario
    sendChange(
      {
        type: "UPDATE_PAGE",
        payload: { pageSettings: settings },
        pageIndex: index,
      },
      fullState,
    )
  }

  // Añadir una función para cambiar la página actual sin enviar fullState
  // ya que solo es un cambio de visualización, no estructural

  const handleSetCurrentPageIndex = (index: number) => {
    if (index >= 0 && index < pages.length) {
      // Actualizar el estado local
      setCurrentPageIndex(index)

      // Enviar el cambio sin fullState ya que no es un cambio estructural
      sendChange({
        type: "CHANGE_CURRENT_PAGE",
        payload: { index },
      })
    }
  }

  return (
    <PageContext.Provider
      value={{
        pages,
        currentPageIndex,
        addPage,
        removePage,
        updatePage,
        setCurrentPageIndex: handleSetCurrentPageIndex,
        getCurrentPage,
        updatePageSettings,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export function usePageContext() {
  const context = useContext(PageContext)
  if (context === undefined) {
    throw new Error("usePageContext must be used within a PageProvider")
  }
  return context
}
