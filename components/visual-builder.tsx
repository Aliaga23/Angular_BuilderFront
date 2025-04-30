"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import ComponentSidebar from "./component-sidebar"
import Canvas from "./canvas"
import PageManager from "./page-manager"
import { ComponentProvider } from "@/context/component-context"
import { PageProvider } from "@/context/page-context"
import { CollaborationProvider } from "@/context/collaboration-context"
import { SettingsProvider } from "@/context/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  Undo,
  Redo,
  Save,
  Laptop,
  Smartphone,
  Tablet,
  Menu,
  X,
  PanelLeft,
  Settings,
  Layers,
  Users,
  PanelRight,
} from "lucide-react"

// Importar el nuevo componente
import RealTimeIndicator from "./real-time-indicator"
import ExportJsonButton from "./export-json-button"

// Añadir la importación del ProjectIdHandler
import ProjectIdHandler from "./project-id-handler"

// Añadir estas importaciones al inicio del archivo
import { LazyExportPanel, LazyPropertiesPanel, LazyCollaborationPanel, LazyComponent } from "./lazy-components"

// Importar Toaster pero no useToast
import { Toaster } from "@/components/ui/toaster"

// Importar el componente SaveNotification
import SaveNotification from "./save-notification"

// Añadir la importación de useRouter de next/navigation al inicio del archivo, junto con las otras importaciones:
import { useRouter } from "next/navigation"

export default function VisualBuilder({ projectId: initialProjectId }: { projectId?: string }) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("diseñador")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false)
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [windowWidth, setWindowWidth] = useState<number>(1200) // Default value
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false)

  // Añadir router para navegación
  const router = useRouter()

  // Añadir estos handlers memoizados justo después de la declaración de showCollaborationPanel
  const handleCloseCollaborationPanel = useCallback(() => {
    setShowCollaborationPanel(false)
  }, [])

  const handleViewportChange = useCallback((size: "desktop" | "tablet" | "mobile") => {
    setViewportSize(size)
  }, [])

  const handleMobileMenuToggle = useCallback((open: boolean) => {
    setIsMobileMenuOpen(open)
  }, [])

  const handleMobileSidebarToggle = useCallback((open: boolean) => {
    setIsMobileSidebarOpen(open)
  }, [])

  const handleMobilePropertiesToggle = useCallback((open: boolean) => {
    setIsMobilePropertiesOpen(open)
  }, [])

  // Función para navegar al dashboard
  const handleNavigateToDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  // Modificar la función handleSaveProject para que funcione correctamente con el backend
  const handleSaveProject = useCallback(() => {
    if (typeof window !== "undefined") {
      // Obtener el estado actual del proyecto desde localStorage
      const userId = localStorage.getItem("userId") || ""
      const projectId = localStorage.getItem("projectId") || ""

      if (!projectId) {
        console.error("No hay ID de proyecto para guardar")
        // Mostrar una notificación al usuario
        if (typeof window !== "undefined" && window.toast) {
          window.toast({
            title: "Error al guardar",
            description: "No se pudo identificar el proyecto. Intenta recargar la página.",
            variant: "destructive",
          })
        }
        return
      }

      // Enviar un mensaje especial para solicitar que todos los contextos envíen su estado
      const requestSaveEvent = new CustomEvent("requestProjectSave", {
        detail: { userId, projectId },
      })
      window.dispatchEvent(requestSaveEvent)

      // Solicitar guardar el proyecto sin mostrar mensaje en consola
    }
  }, [])

  // Obtener projectId de la URL si existe
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId)

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      // Intentar obtener projectId de la URL
      const urlParams = new URLSearchParams(window.location.search)
      const urlProjectId = urlParams.get("projectId")

      if (urlProjectId) {
        setProjectId(urlProjectId)
      }
    }
  }, [])

  // Detectar el tamaño de la ventana para ajustes responsivos
  useEffect(() => {
    // Only access window in the browser
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)

      const handleResize = () => {
        setWindowWidth(window.innerWidth)
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Cerrar paneles móviles cuando se selecciona un componente
  useEffect(() => {
    if (selectedComponentId && windowWidth < 768) {
      setIsMobileSidebarOpen(false)
      setIsMobilePropertiesOpen(true)
    }
  }, [selectedComponentId, windowWidth])

  // Guardado automático cada 10 segundos
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveProject()
    }, 10000) // 10 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(autoSaveInterval)
    }
  }, [handleSaveProject])

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  // Dentro del componente VisualBuilder, añadir ProjectIdHandler antes del CollaborationProvider
  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider>
        <SettingsProvider>
          <ProjectIdHandler />
          <CollaborationProvider initialProjectId={projectId}>
            <PageProvider>
              <ComponentProvider>
                <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
                  {/* Header */}
                  <header className="border-b border-border bg-card py-2 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-4">
                        {isMobile ? (
                          <Sheet open={isMobileMenuOpen} onOpenChange={handleMobileMenuToggle}>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                                <Menu className="h-5 w-5" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
                              <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                  <h2 className="text-lg font-medium">Menú</h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="h-8 w-8"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-4 space-y-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={handleNavigateToDashboard}
                                  >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al Dashboard
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={handleSaveProject}
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                  </Button>
                                  <div className="h-px bg-border my-2"></div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => setShowCollaborationPanel(true)}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Colaboradores
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            onClick={handleNavigateToDashboard}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        )}
                        <h1 className="text-lg md:text-xl font-medium tracking-wide truncate">Constructor UI</h1>
                        <div className="text-xs bg-secondary px-2 py-0.5 rounded-md text-muted-foreground hidden md:block">
                          v1.0
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isMobile && (
                          <>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
                              <Undo className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
                              <Redo className="h-4 w-4" />
                            </Button>
                            <div className="h-5 w-px bg-border mx-1 hidden md:block"></div>
                          </>
                        )}

                        {/* Collaboration status */}
                        <RealTimeIndicator />

                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 hidden md:flex"
                          onClick={() => setShowCollaborationPanel(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Colaboradores
                        </Button>

                        {!isMobile && (
                          <>
                            <div className="h-5 w-px bg-border mx-1 hidden md:block"></div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm h-8 hidden md:flex"
                              onClick={handleSaveProject}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Guardar
                            </Button>
                            <ExportJsonButton />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex mt-4 border-b border-border overflow-x-auto scrollbar-hide">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent h-10 p-0">
                          <TabsTrigger
                            value="diseñador"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 md:px-4 h-10 text-sm"
                          >
                            Diseñador UI
                          </TabsTrigger>
                          <TabsTrigger
                            value="imagen"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 md:px-4 h-10 text-sm"
                          >
                            Imagen a UI
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </header>

                  {/* Main Content */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Desktop */}
                    {!isMobile && (
                      <div
                        className={`${isMobile ? "w-16" : "w-72"} md:w-70 border-r border-border bg-card flex-shrink-0 block transition-all duration-300 h-full overflow-hidden`}
                      >
                        <div className="flex flex-col h-full">
                          {isMobile && (
                            <button
                              className="p-2 m-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            >
                              {isMobileSidebarOpen ? (
                                <PanelLeft className="h-4 w-4" />
                              ) : (
                                <PanelRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <div
                            className={`${isMobile && !isMobileSidebarOpen ? "hidden" : "block"} h-full flex flex-col overflow-auto`}
                          >
                            <PageManager />
                            <ComponentSidebar />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sidebar - Mobile */}
                    {isMobile && (
                      <Sheet open={isMobileSidebarOpen} onOpenChange={handleMobileSidebarToggle}>
                        <SheetContent side="left" className="w-[90vw] sm:w-[350px] p-0">
                          <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                              <h2 className="text-lg font-medium">Componentes</h2>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex-1 overflow-auto">
                              <PageManager />
                              <ComponentSidebar />
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}

                    {/* Main Area with Tabs Content */}
                    <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden">
                      <TabsContent value="diseñador" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
                        {/* Canvas Controls */}
                        <div className="flex items-center justify-between p-2 border-b border-border bg-card overflow-x-auto">
                          <div className="flex items-center gap-2">
                            {isMobile && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                onClick={() => setIsMobileSidebarOpen(true)}
                              >
                                <PanelLeft className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Espacio para controles adicionales */}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant={viewportSize === "desktop" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                              onClick={() => handleViewportChange("desktop")}
                            >
                              <Laptop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant={viewportSize === "tablet" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                              onClick={() => handleViewportChange("tablet")}
                            >
                              <Tablet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant={viewportSize === "mobile" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                              onClick={() => handleViewportChange("mobile")}
                            >
                              <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedComponentId && isMobile && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                onClick={() => setIsMobilePropertiesOpen(true)}
                              >
                                <Layers className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Canvas and Properties */}
                        <div className="flex flex-1 overflow-hidden">
                          <div
                            className="flex-1 overflow-auto relative"
                            style={{
                              maxWidth:
                                viewportSize === "mobile" ? "375px" : viewportSize === "tablet" ? "768px" : "100%",
                              margin: viewportSize !== "desktop" ? "0 auto" : "0",
                              transition: "max-width 0.3s ease",
                            }}
                          >
                            {viewportSize !== "desktop" && (
                              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-secondary/80 text-xs py-1 px-3 rounded-full z-10 backdrop-blur-sm">
                                {viewportSize === "mobile" ? "Vista móvil (375px)" : "Vista tablet (768px)"}
                              </div>
                            )}
                            <Canvas
                              selectedComponentId={selectedComponentId}
                              setSelectedComponentId={setSelectedComponentId}
                              viewportSize={viewportSize}
                            />
                          </div>

                          {/* Properties Panel - Desktop */}
                          {!isMobile && (
                            <div className="w-72 md:w-80 border-l border-border overflow-auto hidden md:block flex-shrink-0">
                              {selectedComponentId ? (
                                <LazyComponent>
                                  <LazyPropertiesPanel
                                    componentId={selectedComponentId}
                                    onClose={() => setSelectedComponentId(null)}
                                  />
                                </LazyComponent>
                              ) : (
                                <LazyComponent>
                                  <LazyExportPanel />
                                </LazyComponent>
                              )}
                            </div>
                          )}

                          {/* Properties Panel - Mobile */}
                          {isMobile && selectedComponentId && (
                            <Sheet open={isMobilePropertiesOpen} onOpenChange={handleMobilePropertiesToggle}>
                              <SheetContent side="right" className="w-[90vw] sm:w-[350px] p-0 overflow-hidden">
                                <LazyComponent>
                                  <LazyPropertiesPanel
                                    componentId={selectedComponentId}
                                    onClose={() => {
                                      setSelectedComponentId(null)
                                      setIsMobilePropertiesOpen(false)
                                    }}
                                    isMobile={true}
                                  />
                                </LazyComponent>
                              </SheetContent>
                            </Sheet>
                          )}

                          {/* Floating Action Buttons for Mobile */}
                          {isMobile && (
                            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-10">
                              {!selectedComponentId && (
                                <Button
                                  size="icon"
                                  className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                                  onClick={() => setIsMobileSidebarOpen(true)}
                                >
                                  <PanelLeft className="h-6 w-6" />
                                </Button>
                              )}
                              {selectedComponentId && (
                                <Button
                                  size="icon"
                                  className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                                  onClick={() => setIsMobilePropertiesOpen(true)}
                                >
                                  <Layers className="h-6 w-6" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="imagen" className="flex-1 m-0 p-4">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                              <Settings className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">Imagen a UI en desarrollo</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Collaboration Panel */}
                  <Sheet open={showCollaborationPanel} onOpenChange={setShowCollaborationPanel}>
                    <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0">
                      <LazyComponent>
                        <LazyCollaborationPanel onClose={handleCloseCollaborationPanel} />
                      </LazyComponent>
                    </SheetContent>
                  </Sheet>
                </div>
              </ComponentProvider>
            </PageProvider>
          </CollaborationProvider>
        </SettingsProvider>
      </TooltipProvider>
      <Toaster />
      <SaveNotification />
    </DndProvider>
  )
}
