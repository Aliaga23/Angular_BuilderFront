"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth-service"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated()
      setIsAuthenticated(isAuth)

      if (!isAuth) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Mostrar nada mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Si está autenticado, mostrar el contenido
  return isAuthenticated ? <>{children}</> : null
}
