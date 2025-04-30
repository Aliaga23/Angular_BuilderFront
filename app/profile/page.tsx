"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import NavBar from "@/components/nav-bar"
import { authService, type UserData } from "@/lib/auth-service"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    color: "#3b82f6",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cargar datos del usuario
    const userData = authService.getUser()
    if (userData) {
      setUser(userData)
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        color: userData.color || "#3b82f6",
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar mensajes
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      // Por ahora, simulamos una actualización exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Actualizar datos del usuario en localStorage
      if (user) {
        const updatedUser = {
          ...user,
          username: formData.username,
          email: formData.email,
          color: formData.color,
        }
        authService.saveUser(updatedUser)
        setUser(updatedUser)
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <NavBar />

        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Mi perfil</h1>

            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>Perfil actualizado correctamente</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-medium"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.username ? formData.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-10"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color de perfil</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-16 h-10 p-1"
                      />
                      <span className="text-sm">Este color se usará para tu avatar y elementos personalizados</span>
                    </div>
                  </div>

                  <Button type="submit" className="bg-red-500 hover:bg-red-600 w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Volver al dashboard
                </Button>
                <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  Eliminar cuenta
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
