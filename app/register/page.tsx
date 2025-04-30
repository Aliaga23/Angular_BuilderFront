"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Eye, EyeOff, ArrowRight, User, Mail, Lock, CheckCircle, Info } from "lucide-react"
import { authService } from "@/lib/auth-service"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Limpiar error general cuando el usuario escribe
    if (error) setError(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Modifica la función handleSubmit para que no guarde el token después del registro
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setFormSubmitted(true)
    setError(null)

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      console.log("Registration response:", response)

      // NO guardar el token aquí
      // authService.saveToken(response.access_token);

      // NO guardar datos del usuario aquí
      // if (response.user) {
      //   authService.saveUser(response.user);
      // }

      // NO disparar el evento auth-change
      // window.dispatchEvent(new Event("auth-change"));

      // Redirigir al login
      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const { password } = formData
    if (!password) return 0

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    return strength
  }

  const getPasswordRequirements = () => {
    const { password } = formData
    return [
      { text: "Al menos 8 caracteres", met: password.length >= 8 },
      { text: "Al menos una letra mayúscula", met: /[A-Z]/.test(password) },
      { text: "Al menos un número", met: /[0-9]/.test(password) },
      { text: "Al menos un carácter especial", met: /[^A-Za-z0-9]/.test(password) },
    ]
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors">
              Características
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="/#testimonials"
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
                Registrarse
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Únete a nuestra comunidad de desarrolladores</h2>
            <p className="text-lg text-gray-700 mb-8">
              Crea, colabora y exporta componentes Angular profesionales con nuestro constructor visual intuitivo.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Acceso completo</h3>
                  <p className="mt-1 text-gray-600">Accede a todas las herramientas y funcionalidades</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Proyectos ilimitados</h3>
                  <p className="mt-1 text-gray-600">Crea tantos proyectos como necesites sin restricciones</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Soporte premium</h3>
                  <p className="mt-1 text-gray-600">Acceso a nuestro equipo de soporte especializado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de registro */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear una cuenta</h1>
              <p className="text-gray-600">Ingresa tus datos para comenzar a crear proyectos Angular</p>
            </div>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Nombre de usuario
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Tu nombre de usuario"
                        value={formData.username}
                        onChange={handleChange}
                        className={`h-12 pl-10 bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-red-500 ${errors.username ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Correo electrónico
                    </Label>
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
                        className={`h-12 pl-10 bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-red-500 ${errors.email ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Contraseña
                    </Label>
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
                        className={`pl-10 pr-10 h-12 bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-red-500 ${errors.password ? "border-red-500" : ""}`}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    {formData.password && !errors.password && (
                      <div className="mt-2">
                        <div className="text-xs mb-1 flex justify-between">
                          <span>Seguridad de la contraseña:</span>
                          <span
                            className={
                              passwordStrength === 0
                                ? "text-red-500"
                                : passwordStrength === 1
                                  ? "text-orange-500"
                                  : passwordStrength === 2
                                    ? "text-yellow-500"
                                    : passwordStrength === 3
                                      ? "text-lime-500"
                                      : "text-green-500"
                            }
                          >
                            {passwordStrength === 0 && "Muy débil"}
                            {passwordStrength === 1 && "Débil"}
                            {passwordStrength === 2 && "Media"}
                            {passwordStrength === 3 && "Fuerte"}
                            {passwordStrength === 4 && "Muy fuerte"}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              passwordStrength === 0
                                ? "bg-red-500 w-1/5"
                                : passwordStrength === 1
                                  ? "bg-orange-500 w-2/5"
                                  : passwordStrength === 2
                                    ? "bg-yellow-500 w-3/5"
                                    : passwordStrength === 3
                                      ? "bg-lime-500 w-4/5"
                                      : "bg-green-500 w-full"
                            }`}
                          ></div>
                        </div>

                        {/* Requisitos de contraseña */}
                        <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                          <div className="flex items-center mb-2">
                            <Info className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-600">La contraseña debe cumplir:</span>
                          </div>
                          <ul className="space-y-1">
                            {getPasswordRequirements().map((req, index) => (
                              <li key={index} className="flex items-center text-xs">
                                {req.met ? (
                                  <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                ) : (
                                  <div className="h-3 w-3 border border-gray-300 rounded-full mr-1 flex-shrink-0" />
                                )}
                                <span className={req.met ? "text-gray-700" : "text-gray-500"}>{req.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  {formSubmitted && Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Por favor, corrige los errores antes de continuar.</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow-md transition-all"
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
                        Registrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Crear cuenta
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="p-6 pt-0 border-t border-gray-100">
                <div className="text-sm text-center">
                  <span className="text-black">¿Ya tienes una cuenta?</span>{" "}
                  <Link href="/login" className="text-red-500 hover:text-red-600 font-medium">
                    Iniciar sesión
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <footer className="border-t border-gray-100 py-8 bg-white">
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
              <a href="/#features" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Características
              </a>
              <a href="/#testimonials" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Testimonios
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Contacto
              </a>
            </div>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
