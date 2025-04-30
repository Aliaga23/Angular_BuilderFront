"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { authService, type UserData } from "@/lib/auth-service"

export default function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    // Cargar datos del usuario
    const userData = authService.getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
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
            <span className="text-xl font-bold text-black">Angular Builder</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8"></div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: user.color || "#ef4444" }}
                  >
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.username}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 py-2 text-gray-600 bg-transparent">
                  Iniciar sesión
                </span>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition-all hover:shadow"
                >
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
