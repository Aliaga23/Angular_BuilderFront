// Cambiar la URL de la API para usar la nueva URL en Railway
const API_URL = "https://angularbuilder.up.railway.app"

export interface ProjectData {
  pages: any[]
  currentPageIndex: number
  components: any[]
}

export interface Project {
  id: string
  name: string
  owner_id: string
  data?: ProjectData
  created_at: string
  updated_at: string
}

export const projectService = {
  async saveProject(projectId: string, projectData: ProjectData, projectName = "Mi Proyecto"): Promise<boolean> {
    try {
      // Get userId from localStorage or use a default value
      const ownerId = localStorage.getItem("userId")
      if (!ownerId) {
        console.error("No user ID found in localStorage")
        return false
      }

      // Create the request body
      const requestBody: any = {
        name: projectName,
        data: projectData,
      }

      requestBody.owner_id = ownerId

      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        // Error al guardar
        throw new Error(`Error al guardar: ${response.statusText}`)
      }

      // Proyecto guardado exitosamente
      return true
    } catch (error) {
      // Error al guardar el proyecto
      return false
    }
  },

  async loadProject(projectId: string): Promise<ProjectData | null> {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Error al cargar: ${response.statusText}`)
      }

      const project = await response.json()
      return project.data as ProjectData
    } catch (error) {
      // Error al cargar el proyecto
      return null
    }
  },

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar: ${response.statusText}`)
      }

      return true
    } catch (error) {
      // Error al eliminar el proyecto
      return false
    }
  },

  async getAllProjects(): Promise<Project[]> {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem("userId")

      if (!userId) {
        console.error("No user ID found in localStorage")
        return []
      }

      // Use the user ID to get projects
      const response = await fetch(`${API_URL}/api/projects/user/${userId}`)

      if (!response.ok) {
        throw new Error(`Error al obtener proyectos: ${response.statusText}`)
      }

      const data = await response.json()
      return data.projects || []
    } catch (error) {
      console.error("Error al obtener proyectos:", error)
      return []
    }
  },

  async createProject(name: string, description = ""): Promise<Project | null> {
    try {
      // Get userId from localStorage
      const ownerId = localStorage.getItem("userId")

      if (!ownerId) {
        console.error("No user ID found in localStorage")
        return null
      }

      // Crear un proyecto con datos iniciales básicos
      const initialData = {
        pages: [
          {
            name: "landing",
            route: "",
            pageSettings: {
              backgroundColor: "#f9fafb",
              theme: "light",
            },
            components: [],
          },
        ],
        currentPageIndex: 0,
        components: [],
      }

      // Create the request body
      const requestBody: any = {
        name,
        owner_id: ownerId,
        data: initialData,
      }

      const response = await fetch(`${API_URL}/api/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        // Error creating project
        throw new Error(`Error al crear proyecto: ${response.statusText}`)
      }

      const result = await response.json()

      // Como la API ahora devuelve solo el ID, creamos un objeto Project con los datos que tenemos
      const newProject: Project = {
        id: result.project_id,
        name,
        owner_id: ownerId,
        data: initialData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return newProject
    } catch (error) {
      // Error al crear proyecto
      return null
    }
  },
}
