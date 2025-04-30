"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, ImageIcon, Code, Download, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import NavBar from "@/components/nav-bar"
import ProtectedRoute from "@/components/protected-route"

export default function UIGeneratorPage() {
  const [activeStep, setActiveStep] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Función para manejar la carga de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      // Show the image preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      // Create form data for the API request
      const formData = new FormData()
      formData.append("imagen", file)

      // Make the API request
      const response = await fetch("https://angularbuilder.up.railway.app/generar-ui/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al generar la UI")
      }

      // Handle successful response - the API returns a zip file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "angular_proyecto.zip"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update UI state
      setActiveStep(2)
      setIsGenerated(true)
    } catch (err) {
      setError("Error al generar la UI. Por favor, inténtalo de nuevo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar el arrastre y soltar
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      setIsLoading(true)
      setError(null)

      try {
        // Show the image preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImage(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)

        // Create form data for the API request
        const formData = new FormData()
        formData.append("imagen", file)

        // Make the API request
        const response = await fetch("https://angularbuilder.up.railway.app/generar-ui/", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error al generar la UI")
        }

        // Handle successful response - the API returns a zip file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "angular_proyecto.zip"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Update UI state
        setActiveStep(2)
        setIsGenerated(true)
      } catch (err) {
        setError("Error al generar la UI. Por favor, inténtalo de nuevo.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add("border-red-500")
    e.currentTarget.classList.remove("border-dashed")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("border-red-500")
    e.currentTarget.classList.add("border-dashed")
  }

  // Función para descargar el proyecto
  const downloadProject = () => {
    // Aquí iría la lógica para descargar el proyecto
    console.log("Descargando proyecto Angular...")
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
        <main className="container py-6 max-w-6xl relative z-10">
          <h1 className="text-3xl font-bold mb-2">Generador de UI desde Imágenes</h1>
          <p className="text-black mb-8">
            Convierte tus bocetos o capturas de pantalla en aplicaciones Angular completas
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Paso 1: Subir Imagen */}
            <Card className="bg-white text-black flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 mr-2">
                    1
                  </div>
                  <CardTitle className="text-black">Subir Imagen</CardTitle>
                </div>
                <CardDescription className="text-black">
                  Sube un boceto, wireframe o captura de pantalla
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
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
                        Generando UI...
                      </div>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir y Generar UI
                      </>
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.gif,.bmp"
                    className="hidden"
                  />

                  <div
                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedImage ? (
                      <div className="w-full">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Vista previa"
                          className="max-h-[180px] mx-auto object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="rounded-full p-3 bg-gray-100 mb-3">
                          <Upload className="h-6 w-6 text-black" />
                        </div>
                        <p className="text-sm text-center text-black mb-1">
                          Arrastra tu imagen aquí o haz clic para generar UI
                        </p>
                        <p className="text-xs text-center text-black">Formatos soportados: JPG, PNG, GIF, BMP</p>
                      </>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paso 2: Generar UI */}
            <Card className="bg-white text-black flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 mr-2">
                    2
                  </div>
                  <CardTitle className="text-black">Generar UI</CardTitle>
                </div>
                <CardDescription className="text-black">Convierte tu imagen en una aplicación Angular</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedImage ? (
                  <div className="space-y-6">
                    {!isGenerated ? (
                      <Button
                        onClick={() => {}}
                        disabled={true}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
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
                            Generando UI...
                          </div>
                        ) : (
                          <>
                            <Code className="mr-2 h-5 w-5" />
                            Generar Aplicación Angular
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-green-50 p-6 rounded-md flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                          <p className="text-green-700 text-lg font-medium">¡Aplicación Angular generada con éxito!</p>
                        </div>

                        <p className="text-black text-center">Tu aplicación Angular se ha descargado correctamente</p>

                        <Button
                          onClick={downloadProject}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg flex items-center justify-center"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Descargar Proyecto Angular
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <ImageIcon className="h-12 w-12 text-black mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-black">Sube una imagen primero para generar la UI</h3>
                    <p className="text-sm text-black">Completa el paso 1 para continuar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Características */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-black">Características</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="rounded-full bg-red-50 w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-black">Rápido y Eficiente</h3>
                <p className="text-black">
                  Convierte tus diseños en código Angular en segundos, ahorrando horas de desarrollo.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="rounded-full bg-red-50 w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-black">Componentes Reutilizables</h3>
                <p className="text-black">
                  Genera componentes Angular modulares y reutilizables listos para usar en tu proyecto.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="rounded-full bg-red-50 w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-black">Código Optimizado</h3>
                <p className="text-black">
                  El código generado sigue las mejores prácticas de Angular y está optimizado para rendimiento.
                </p>
              </div>
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

              <div className="text-xs text-gray-500">© 2025 Angular Builder. Todos los derechos reservados.</div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
