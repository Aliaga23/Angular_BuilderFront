"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// Añadir un nuevo import para el icono de Database
import {
  ChevronDown,
  Clock,
  MoreVertical,
  Plus,
  Search,
  Trash,
  Users,
  LayoutDashboard,
  FileCode,
  Database,
  ImageIcon,
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import NavBar from "@/components/nav-bar"
import { authService } from "@/lib/auth-service"
import { projectService, type Project } from "@/lib/api-service"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Cargar proyectos al iniciar
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      try {
        const userData = authService.getUser()
        setUser(userData)

        // Load projects using the getAllProjects function
        const projectsList = await projectService.getAllProjects()
        setProjects(projectsList)

        if (projectsList.length === 0) {
          toast({
            title: "Información",
            description: "Para crear un nuevo proyecto, haz clic en el botón 'Nuevo proyecto'",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los proyectos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [toast])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setIsLoading(true)
    try {
      const newProject = await projectService.createProject(newProjectName.trim())

      if (newProject) {
        setProjects([newProject, ...projects])
        toast({
          title: "Proyecto creado",
          description: "El proyecto se ha creado correctamente",
        })
      } else {
        throw new Error("No se pudo crear el proyecto")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setNewProjectName("")
      setIsDialogOpen(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.")) {
      return
    }

    setIsLoading(true)
    try {
      const success = await projectService.deleteProject(id)

      if (success) {
        setProjects(projects.filter((project) => project.id !== id))
        toast({
          title: "Proyecto eliminado",
          description: "El proyecto se ha eliminado correctamente",
        })
      } else {
        throw new Error("No se pudo eliminar el proyecto")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Hoy"
    } else if (diffDays === 1) {
      return "Ayer"
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else if (diffDays < 30) {
      return `Hace ${Math.floor(diffDays / 7)} semanas`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-gray-800">
        {/* Header */}
        <NavBar />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-red-100/20 to-transparent"></div>
        </div>

        {/* Main Content */}
        <main className="container py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis proyectos</h1>
              <p className="text-gray-600">Gestiona tus proyectos de interfaz visual para Angular</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear nuevo proyecto</DialogTitle>
                  <DialogDescription>Crea un nuevo proyecto para comenzar a diseñar tu interfaz.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del proyecto</Label>
                    <Input
                      id="name"
                      placeholder="Mi proyecto"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleCreateProject}
                    disabled={isLoading || !newProjectName.trim()}
                  >
                    {isLoading ? "Creando..." : "Crear proyecto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl mb-10 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proyectos..."
                  className="pl-10 border-gray-200 bg-white h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="text-sm h-11 border-gray-200 bg-white">
                  Todos los proyectos <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="text-sm h-11 border-gray-200 bg-white">
                  Más reciente <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Todos</div>
              <div className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                Recientes
              </div>
              <div className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                Favoritos
              </div>
              <div className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                Compartidos
              </div>
            </div>
          </div>

          {isLoading ? (
            // Skeleton loader para proyectos
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="p-0">
                    <div className="h-2 bg-gradient-to-r from-red-300 to-red-400"></div>
                    <div className="h-32 bg-gray-50">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-16" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4 shadow-sm">
                <LayoutDashboard className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}". Intenta con otra búsqueda.`
                  : "Crea tu primer proyecto para comenzar a diseñar interfaces para Angular."}
              </p>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Crear nuevo proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {/* Decorative background elements to match landing page style */}
              <div className="absolute -z-10 top-1/4 right-1/4 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
              <div className="absolute -z-10 bottom-1/4 left-1/4 w-72 h-72 bg-red-50 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

              {filteredProjects.map((project, index) => (
                <Card
                  key={project.id}
                  className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-3px] group bg-white"
                >
                  <CardHeader className="p-0">
                    <div className="h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
                    <div className="h-32 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <LayoutDashboard className="w-32 h-32 text-red-500" />
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-red-500 border border-red-100 shadow-sm">
                          Angular UI
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2 text-gray-900 group-hover:text-red-500 transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {project.description || "Sin descripción"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-red-100">
                          <DropdownMenuItem className="cursor-pointer hover:text-red-500 focus:text-red-500">
                            <Users className="mr-2 h-4 w-4" />
                            <span>Compartir</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:text-red-500 focus:text-red-500">
                            <FileCode className="mr-2 h-4 w-4" />
                            <span>Exportar código</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteProject(project.id)}
                            className="text-red-500 focus:text-red-500 cursor-pointer hover:bg-red-50"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      {project.updated_at ? formatDate(project.updated_at) : "Nuevo"}
                    </div>
                    <Link href={`/builder/${project.id}`}>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md">
                        Abrir
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Herramientas adicionales */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Herramientas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-3px] group bg-white">
                <CardHeader className="p-0">
                  <div className="h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
                  <div className="h-24 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden flex items-center justify-center">
                    <Database className="w-10 h-10 text-red-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 text-gray-900 group-hover:text-red-500 transition-colors">
                    Generador CRUD desde XMI
                  </CardTitle>
                  <p className="text-gray-600 text-sm mb-4">
                    Convierte diagramas de clase XMI en aplicaciones CRUD Angular completas
                  </p>
                  <Link href="/crud-generator">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md">
                      Abrir generador
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-3px] group bg-white">
                <CardHeader className="p-0">
                  <div className="h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
                  <div className="h-24 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-red-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 text-gray-900 group-hover:text-red-500 transition-colors">
                    Generador de UI desde Imágenes
                  </CardTitle>
                  <p className="text-gray-600 text-sm mb-4">
                    Convierte tus bocetos o capturas de pantalla en aplicaciones Angular completas
                  </p>
                  <Link href="/ui-generator">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md">
                      Abrir generador
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 bg-white mt-12">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 186 200"
                  className="text-red-500 mr-2"
                >
                  <path
                    fill="currentColor"
                    d="M93 0 0 33.2 14 156.3l79 43.7 79-43.7 14-123.1L93 0zm0 18.6 75.5 27.1-12.7 112-62.8 34.8-62.8-34.8-12.7-112L93 18.6z"
                  />
                  <path
                    fill="currentColor"
                    d="M93 18.6 30.2 45.7l8.7 95.5 54.1 29.9 54.1-30 8.7-95.4L93 18.6zm0 24.2 35.2 74.4h-22.9l-12.3-30.7-12.3 30.7H58.9l34.1-74.4z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">Angular Builder</span>
              </div>

              <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Características
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Testimonios
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Contacto
                </a>
              </div>

              <div className="text-xs text-gray-500">© 2025 Angular Builder. Todos los derechos reservados.</div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
