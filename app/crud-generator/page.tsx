"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, FileCode, Download, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import NavBar from "@/components/nav-bar"
import ProtectedRoute from "@/components/protected-route"

interface Attribute {
  name: string
  type: string
  isRequired: boolean
}

interface EntityClass {
  name: string
  attributes: Attribute[]
  primary_key: Attribute
  auto_increment: boolean
}

export default function CrudGeneratorPage() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [xmlContent, setXmlContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [detectedClasses, setDetectedClasses] = useState<{ name: string; fields: number }[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [entityData, setEntityData] = useState<EntityClass | null>(null)
  const [primaryKeyType, setPrimaryKeyType] = useState("integer")
  const [primaryKeyName, setPrimaryKeyName] = useState("id")
  const [autoIncrement, setAutoIncrement] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Añadir estado para almacenar el array completo de clases
  const [classesData, setClassesData] = useState<EntityClass[]>([])

  // Actualizar la función handleFileUpload para guardar el array completo de clases
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0]
      setFile(uploadedFile)
      setIsLoading(true)
      setError(null)

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", uploadedFile)

      // Enviar el archivo al endpoint /parse-xmi/
      fetch("https://angularbuilder.up.railway.app/parse-xmi/", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al analizar el archivo XMI")
          }
          return response.json()
        })
        .then((data) => {
          // Guardar el array completo de clases
          setClassesData(data)

          // Convertir el array de clases a nuestro formato de detectedClasses para la UI
          const classes = data.map((cls: EntityClass) => ({
            name: cls.name,
            fields: cls.attributes ? cls.attributes.length : 0,
          }))
          setDetectedClasses(classes)
          setStep(2)
          toast({
            title: "Análisis completado",
            description: `Se han detectado ${classes.length} clases en el diagrama`,
          })
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: "Error",
            description: "No se pudo analizar el archivo XMI",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      // Leer el contenido del archivo
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setXmlContent(event.target.result as string)
        }
      }
      reader.readAsText(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const analyzeXmi = async () => {
    if (!xmlContent && !file) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo XMI o pega su contenido",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Si hay contenido pegado, crear un archivo Blob y enviarlo
      if (xmlContent) {
        const blob = new Blob([xmlContent], { type: "application/xml" })
        const file = new File([blob], "pasted-content.xml", { type: "application/xml" })

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("https://angularbuilder.up.railway.app/parse-xmi/", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error al analizar el contenido XMI")
        }

        const data = await response.json()

        // Guardar el array completo de clases
        setClassesData(data)

        // Convertir el array de clases a nuestro formato de detectedClasses para la UI
        const classes = data.map((cls: EntityClass) => ({
          name: cls.name,
          fields: cls.attributes ? cls.attributes.length : 0,
        }))
        setDetectedClasses(classes)
        setStep(2)
        toast({
          title: "Análisis completado",
          description: `Se han detectado ${classes.length} clases en el diagrama`,
        })
      } else {
        // Si hay un archivo seleccionado, usar handleFileUpload
        if (fileInputRef.current?.files?.[0]) {
          handleFileUpload({ target: { files: fileInputRef.current.files } } as React.ChangeEvent<HTMLInputElement>)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo analizar el archivo XMI",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Actualizar la función selectClass para usar los datos reales
  const selectClass = (className: string) => {
    if (!classesData.length) return

    // Buscar la clase seleccionada en el array completo
    const selectedClassData = classesData.find((cls) => cls.name === className)
    if (!selectedClassData) return

    setSelectedClass(className)
    setEntityData(selectedClassData)

    // Si la clase tiene atributos, seleccionamos el primero como clave primaria por defecto
    if (selectedClassData.attributes && selectedClassData.attributes.length > 0) {
      // Si ya tiene una clave primaria definida, usarla
      if (selectedClassData.primary_key && selectedClassData.primary_key.name) {
        setPrimaryKeyName(selectedClassData.primary_key.name)
        setPrimaryKeyType(selectedClassData.primary_key.type)
      } else {
        // Si no, usar el primer atributo
        setPrimaryKeyName(selectedClassData.attributes[0].name)
        setPrimaryKeyType(selectedClassData.attributes[0].type)
      }
    }

    // Establecemos el valor de auto_increment según lo que venga en los datos
    setAutoIncrement(selectedClassData.auto_increment || false)
  }

  // Actualizar la función generateCrud para enviar el JSON correcto
  const generateCrud = async () => {
    if (!selectedClass || !entityData) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una clase para generar el CRUD",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Buscar el atributo seleccionado como clave primaria
      const primaryKeyAttr = entityData.attributes.find((attr) => attr.name === primaryKeyName)

      if (!primaryKeyAttr) {
        toast({
          title: "Error",
          description: "Por favor, selecciona un atributo válido como clave primaria",
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      // Preparamos el JSON final con los datos configurados
      const finalEntityData = {
        name: entityData.name,
        attributes: entityData.attributes,
        primary_key: {
          ...primaryKeyAttr,
          type: primaryKeyType, // Usar el tipo seleccionado por el usuario
        },
        auto_increment: autoIncrement,
      }

      // Enviar el JSON al endpoint /generar-crud/
      const response = await fetch("https://angularbuilder.up.railway.app/generar-crud/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalEntityData),
      })

      if (!response.ok) {
        throw new Error("Error al generar el CRUD")
      }

      // Obtener el blob del archivo ZIP
      const blob = await response.blob()

      // Crear una URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a")
      a.href = url
      a.download = `crud-${selectedClass?.toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStep(3)
      toast({
        title: "CRUD generado correctamente",
        description: "Tu aplicación Angular ha sido descargada",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el CRUD",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Actualizar la función downloadCrud para descargar el CRUD nuevamente
  const downloadCrud = async () => {
    if (!selectedClass || !entityData) return

    try {
      // Buscar el atributo seleccionado como clave primaria
      const primaryKeyAttr = entityData.attributes.find((attr) => attr.name === primaryKeyName)

      if (!primaryKeyAttr) {
        toast({
          title: "Error",
          description: "Por favor, selecciona un atributo válido como clave primaria",
          variant: "destructive",
        })
        return
      }

      // Preparamos el JSON final con los datos configurados
      const finalEntityData = {
        name: entityData.name,
        attributes: entityData.attributes,
        primary_key: {
          ...primaryKeyAttr,
          type: primaryKeyType, // Usar el tipo seleccionado por el usuario
        },
        auto_increment: autoIncrement,
      }

      // Enviar el JSON al endpoint /generar-crud/
      const response = await fetch("https://angularbuilder.up.railway.app/generar-crud/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalEntityData),
      })

      if (!response.ok) {
        throw new Error("Error al generar el CRUD")
      }

      // Obtener el blob del archivo ZIP
      const blob = await response.blob()

      // Crear una URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a")
      a.href = url
      a.download = `crud-${selectedClass?.toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "CRUD descargado",
        description: "Tu aplicación Angular ha sido descargada nuevamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el CRUD",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <NavBar />

        <main className="container py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Generador CRUD desde XMI</h1>
            <p className="text-gray-700">Convierte diagramas de clase XMI en aplicaciones CRUD Angular completas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Paso 1: Cargar Diagrama XMI */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold mr-3">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Cargar Diagrama XMI</h2>
                </div>
                <p className="text-sm text-gray-700 mt-1">Sube un archivo XMI o pega su contenido</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded text-gray-800 hover:bg-gray-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Subir Archivo
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".xmi,.xml,.json"
                        className="hidden"
                      />
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded text-gray-800 hover:bg-gray-50 transition-colors">
                      <FileCode className="mr-2 h-4 w-4" /> Pegar Contenido
                    </button>
                  </div>

                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add("border-red-300", "bg-red-50")
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove("border-red-300", "bg-red-50")
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 mb-2 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        Arrastra tu archivo XMI aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-600">
                        Formatos soportados: .xmi, .xml, .json (procesado por API)
                      </p>
                    </div>
                  </div>

                  {file && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="flex items-center">
                        <FileCode className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <button
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                        onClick={() => setFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <button
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                    onClick={analyzeXmi}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>Analizando...</>
                    ) : (
                      <>
                        <FileCode className="mr-2 h-4 w-4" /> Analizar XMI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Paso 2: Seleccionar Clase */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold mr-3">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Seleccionar Clase</h2>
                </div>
                <p className="text-sm text-gray-700 mt-1">Elige la clase para generar el CRUD</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar clases..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-black"
                      disabled={detectedClasses.length === 0}
                    />
                  </div>

                  <div className="space-y-2">
                    {detectedClasses.length === 0 ? (
                      <div className="text-center py-8 text-gray-700">
                        <div className="mx-auto mb-3 w-12 h-12 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </div>
                        <p className="font-medium">No hay clases detectadas</p>
                        <p className="text-sm text-gray-600">Sube un diagrama XMI para comenzar</p>
                      </div>
                    ) : (
                      detectedClasses.map((cls) => (
                        <div
                          key={cls.name}
                          className={`p-4 border rounded cursor-pointer transition-all ${
                            selectedClass === cls.name
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => selectClass(cls.name)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{cls.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {cls.fields} campos
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedClass && entityData && (
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-800 mb-1">Clave Primaria:</label>
                        <select
                          value={primaryKeyName}
                          onChange={(e) => {
                            setPrimaryKeyName(e.target.value)
                            // Actualizar también el tipo según el atributo seleccionado
                            const attr = entityData.attributes.find((a) => a.name === e.target.value)
                            if (attr) {
                              setPrimaryKeyType(attr.type)
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                        >
                          {entityData.attributes.map((attr) => (
                            <option key={attr.name} value={attr.name}>
                              {attr.name} ({attr.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center mb-4">
                        <button
                          type="button"
                          onClick={() => setAutoIncrement(!autoIncrement)}
                          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          role="switch"
                          aria-checked={autoIncrement}
                        >
                          <span
                            className={`${
                              autoIncrement ? "translate-x-6 bg-red-500" : "translate-x-1 bg-white"
                            } inline-block h-4 w-4 transform rounded-full transition-transform`}
                          />
                        </button>
                        <label
                          className="ml-2 text-sm text-gray-800 cursor-pointer"
                          onClick={() => setAutoIncrement(!autoIncrement)}
                        >
                          Clave primaria autoincrementable
                        </label>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-gray-800">Atributos:</h4>
                        <div className="space-y-2">
                          {entityData.attributes.map((attr, index) => (
                            <div
                              key={index}
                              className={`grid grid-cols-3 gap-2 text-sm cursor-pointer ${
                                primaryKeyName === attr.name ? "bg-red-50 border border-red-200 rounded" : ""
                              }`}
                              onClick={() => setPrimaryKeyName(attr.name)}
                            >
                              <div className="bg-gray-100 p-2 rounded text-gray-800">{attr.name}</div>
                              <div
                                className={`p-2 rounded ${
                                  attr.type === "string" || attr.type === "float"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-50 text-gray-800"
                                }`}
                              >
                                {attr.type}
                              </div>
                              <div className="flex items-center">
                                {attr.isRequired && (
                                  <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                                    Requerido
                                  </span>
                                )}
                                {primaryKeyName === attr.name && (
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full ml-1">
                                    Clave Primaria
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                        onClick={generateCrud}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <>Generando...</> : <>Continuar</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paso 3: Generar Aplicación CRUD */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold mr-3">
                    3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Generar Aplicación CRUD</h2>
                </div>
                <p className="text-sm text-gray-700 mt-1">Descarga tu aplicación Angular completa</p>
              </div>
              <div className="p-5">
                {step < 3 ? (
                  <div className="text-center py-8 text-gray-700">
                    <div className="mx-auto mb-3 w-12 h-12 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <p className="font-medium">Completa los pasos anteriores</p>
                    <p className="text-sm text-gray-600">Selecciona una clase para generar el CRUD</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center text-gray-800">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        Archivos que se generarán
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">Estructura del proyecto</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Angular 16</span>
                        </div>

                        <div className="space-y-1 pl-4 text-sm">
                          <p className="text-gray-700 flex items-center">
                            <svg
                              className="h-3 w-3 mr-1 text-green-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Configuración completa (angular.json, package.json, tsconfig.json)
                          </p>
                          <p className="text-gray-700 flex items-center">
                            <svg
                              className="h-3 w-3 mr-1 text-green-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Estructura de carpetas organizada (components, models, services)
                          </p>
                          <p className="text-gray-700 flex items-center">
                            <svg
                              className="h-3 w-3 mr-1 text-green-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Estilos SCSS con tema oscuro personalizado
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">Componentes CRUD</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Funcionales</span>
                        </div>

                        <div className="space-y-1 pl-4 text-sm">
                          {selectedClass && (
                            <>
                              <p className="text-gray-700 font-mono text-xs flex items-center">
                                <svg
                                  className="h-3 w-3 mr-1 text-green-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {selectedClass.toLowerCase()}-list.component.ts
                              </p>
                              <p className="text-gray-700 font-mono text-xs flex items-center">
                                <svg
                                  className="h-3 w-3 mr-1 text-green-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {selectedClass.toLowerCase()}-detail.component.ts
                              </p>
                              <p className="text-gray-700 font-mono text-xs flex items-center">
                                <svg
                                  className="h-3 w-3 mr-1 text-green-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {selectedClass.toLowerCase()}-form.component.ts
                              </p>
                              <p className="text-gray-700 font-mono text-xs flex items-center">
                                <svg
                                  className="h-3 w-3 mr-1 text-green-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {selectedClass.toLowerCase()}.service.ts
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                      onClick={downloadCrud}
                    >
                      <Download className="mr-2 h-4 w-4" /> Generar y Descargar CRUD
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
