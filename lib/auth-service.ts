// Servicio para manejar la autenticación
const API_URL = "https://angularbuilder.up.railway.app"

export interface UserData {
  id: string
  username: string
  email: string
  color: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user?: UserData
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log("Enviando solicitud a:", `${API_URL}/register`)

      // Configuración específica para desarrollo local
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // No incluimos credentials: "include" para evitar problemas de CORS en desarrollo local
        mode: "cors", // Explícitamente establecemos el modo CORS
      })

      console.log("Respuesta del servidor:", response.status)

      if (!response.ok) {
        let errorMessage = "Error al registrar usuario"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch (e) {
          console.error("No se pudo parsear la respuesta de error:", e)
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error("Error en registro:", error)
      throw error
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log("Enviando solicitud a:", `${API_URL}/login`)
      console.log("Datos:", data)

      // Configuración específica para desarrollo local
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // No incluimos credentials: "include" para evitar problemas de CORS en desarrollo local
        mode: "cors", // Explícitamente establecemos el modo CORS
      })

      console.log("Respuesta del servidor:", response.status)

      if (!response.ok) {
        let errorMessage = "Credenciales incorrectas"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch (e) {
          console.error("No se pudo parsear la respuesta de error:", e)
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error("Error en login:", error)
      throw error
    }
  },

  saveToken(token: string): void {
    localStorage.setItem("auth_token", token)
  },

  saveUser(user: UserData): void {
    localStorage.setItem("user", JSON.stringify(user))
    // Also store the user ID separately for easier access
    localStorage.setItem("userId", user.id)
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  },

  getUser(): UserData | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  logout(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  },
}
