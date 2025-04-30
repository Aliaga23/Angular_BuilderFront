"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error cuando el usuario escribe
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Iniciar proceso de login
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      })

      // Procesar respuesta de login

      // Guardar token y datos del usuario
      authService.saveToken(response.access_token)
      if (response.user) {
        authService.saveUser(response.user)
      }

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (err) {
      // Manejar error de login
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ "--ring-color": "rgba(239, 68, 68, 0.5)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
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
            <span className="text-xl font-bold">Angular Builder</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#caracteristicas"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Características
            </Link>
            <Link
              href="/#como-funciona"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="/#testimonios"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Testimonios
            </Link>
          </div>
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
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row items-stretch bg-white">
        {/* Sección lateral con imagen - solo visible en pantallas medianas y grandes */}
        <div className="hidden md:flex md:w-1/2 bg-red-50 items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-100 to-red-50 opacity-70"></div>

          <div className="relative z-10 max-w-md text-center">
            <div className="mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 186 200"
                className="text-red-500 mx-auto"
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
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Diseña interfaces Angular sin código</h2>
            <p className="text-lg text-gray-700 mb-8">
              Crea, colabora y exporta componentes Angular profesionales con nuestro constructor visual intuitivo.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Componentes nativos</h3>
                  <p className="mt-1 text-gray-600">Arrastra y suelta componentes Angular nativos</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Colaboración en tiempo real</h3>
                  <p className="mt-1 text-gray-600">Trabaja con tu equipo viendo los cambios al instante</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Exportación a código</h3>
                  <p className="mt-1 text-gray-600">Exporta tus diseños a código Angular limpio y optimizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de login */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h1>
              <p className="text-gray-600">Ingresa tus credenciales para acceder a tu cuenta</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Correo electrónico
                  </Label>
                  <div className="mb-1 text-sm text-gray-500">Usa tu correo registrado para acceder</div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 bg-white border-gray-300 text-gray-900 pl-10 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Contraseña
                    </Label>
                    <Link href="#" className="text-sm text-red-500 hover:text-red-600 font-medium">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 pl-10 pr-10 bg-white border-gray-300 text-gray-900 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-900"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow-md transition-all h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O continúa con</span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-red-500 hover:text-red-600 font-medium">
                    Registrarse
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 bg-white">
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
              <a href="/#caracteristicas" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Características
              </a>
              <a href="/#testimonios" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Testimonios
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Contacto
              </a>
            </div>

            <div className="text-xs text-gray-500">© 2023 Angular Builder. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
