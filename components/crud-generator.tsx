"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileUp, Code, Download, ChevronRight, ChevronDown, FileCode, Database, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface Attribute {
  name: string
  type: string
  isRequired: boolean
}

interface EntityClass {
  name: string
  attributes: Attribute[]
  primary_key: any
  auto_increment: boolean
}

interface AnalysisResult {
  entities: EntityClass[]
}

const CrudGenerator = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [fileName, setFileName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedJson, setGeneratedJson] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Añadir estado para la clave primaria seleccionada
  const [primaryKey, setPrimaryKey] = useState<Attribute | null>(null)
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false)

  const handlePasteContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value)
  }

  // Actualizar la función handleFileUpload para enviar el archivo al endpoint /parse-xmi/
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
    setError(null)

    // Crear FormData para enviar el archivo
    const formData = new FormData()
    formData.append("file", file)

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
        // Ahora data es un array de clases
        setAnalysisResult({ entities: data })
        if (data.length > 0) {
          // No seleccionamos ninguna clase por defecto, dejamos que el usuario elija
          setActiveStep(2)
        } else {
          setError("No se encontraron clases en el archivo XMI")
        }
      })
      .catch((err) => {
        console.error(err)
        setError("Error al analizar el archivo XMI. Por favor, verifica el formato.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // Actualizar la función analyzeXmi para usar el nuevo handleFileUpload
  const analyzeXmi = async () => {
    if (!fileContent && !fileInputRef.current?.files?.[0]) {
      setError("Por favor, carga un archivo XMI o pega su contenido")
      return
    }

    // Si hay un archivo seleccionado, usar ese
    if (fileInputRef.current?.files?.[0]) {
      handleFileUpload({ target: { files: fileInputRef.current.files } } as React.ChangeEvent<HTMLInputElement>)
      return
    }

    // Si hay contenido pegado, crear un archivo Blob y enviarlo
    if (fileContent) {
      setIsLoading(true)
      setError(null)

      const blob = new Blob([fileContent], { type: "application/xml" })
      const file = new File([blob], "pasted-content.xml", { type: "application/xml" })

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("https://angularbuilder.up.railway.app/parse-xmi/", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error al analizar el contenido XMI")
        }

        const data = await response.json()
        setAnalysisResult({ entities: data })
        if (data.length > 0) {
          setSelectedEntity(data[0].name)
          // Si hay una clave primaria definida, usarla
          if (data[0].primary_key && data[0].primary_key.name) {
            setPrimaryKey(data[0].primary_key)
          } else if (data[0].attributes && data[0].attributes.length > 0) {
            // Si no hay clave primaria, usar el primer atributo
            setPrimaryKey(data[0].attributes[0])
          }
          setAutoIncrement(data[0].auto_increment || false)
        }
        setActiveStep(2)
      } catch (err) {
        console.error(err)
        setError("Error al analizar el contenido XMI. Por favor, verifica el formato.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para verificar si una entidad ya tiene una clave primaria definida
  const hasPrimaryKeyDefined = (entity: EntityClass): boolean => {
    return entity.primary_key && (entity.primary_key.name || entity.primary_key.composite)
  }

  // Actualizar la función para seleccionar la clave primaria
  const updatePrimaryKey = (entityName: string, attribute: Attribute) => {
    if (!analysisResult) return

    setPrimaryKey(attribute)
  }

  // Actualizar la función generateJson para enviar los datos al endpoint /generar-crud/
  const generateJson = async () => {
    if (!analysisResult || !selectedEntity) return

    const selectedEntityData = analysisResult.entities.find((e) => e.name === selectedEntity)
    if (!selectedEntityData) return

    let finalData

    // Si la entidad ya tiene una clave primaria definida, usarla directamente
    if (hasPrimaryKeyDefined(selectedEntityData)) {
      finalData = {
        name: selectedEntityData.name,
        attributes: selectedEntityData.attributes,
        primary_key: selectedEntityData.primary_key,
        auto_increment: selectedEntityData.auto_increment || false,
      }
    } else {
      // Si no tiene clave primaria definida, usar la seleccionada por el usuario
      if (!primaryKey) {
        setError("Por favor, selecciona una clave primaria")
        return
      }

      finalData = {
        name: selectedEntityData.name,
        attributes: selectedEntityData.attributes,
        primary_key: primaryKey,
        auto_increment: autoIncrement,
      }
    }

    const jsonData = JSON.stringify(finalData, null, 2)
    setGeneratedJson(jsonData)
    setIsLoading(true)

    try {
      // Enviar el JSON al endpoint /generar-crud/
      const response = await fetch("https://angularbuilder.up.railway.app/generar-crud/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
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
      a.download = `crud-${selectedEntity?.toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setActiveStep(3)
      toast({
        title: "CRUD generado correctamente",
        description: "Tu aplicación Angular ha sido descargada",
      })
    } catch (err) {
      console.error(err)
      setError("Error al generar el CRUD. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar la función downloadCrud para usar el JSON ya generado
  const downloadCrud = async () => {
    if (!generatedJson || !selectedEntity) return

    setIsLoading(true)
    try {
      // Enviar el JSON al endpoint /generar-crud/
      const response = await fetch("https://angularbuilder.up.railway.app/generar-crud/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generatedJson,
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
      a.download = `crud-${selectedEntity?.toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "CRUD descargado",
        description: "Tu aplicación Angular ha sido descargada nuevamente",
      })
    } catch (err) {
      console.error(err)
      setError("Error al descargar el CRUD. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizado de la entidad seleccionada
  const renderSelectedEntity = () => {
    if (!analysisResult || !selectedEntity) return null

    const entity = analysisResult.entities.find((e) => e.name === selectedEntity)
    if (!entity) return null

    // Verificar si la entidad ya tiene una clave primaria definida
    const hasDefinedPrimaryKey = hasPrimaryKeyDefined(entity)

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Clave Primaria:</h3>
          </div>

          {hasDefinedPrimaryKey ? (
            // Si ya tiene clave primaria definida, mostrar información
            <div className="p-4 bg-primary/10 border border-primary rounded-md">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="mr-2">
                  Configuración existente
                </Badge>
                <p className="text-sm font-medium">Esta entidad ya tiene una clave primaria definida</p>
              </div>

              {entity.primary_key.composite ? (
                // Si es una clave compuesta
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Clave primaria compuesta:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {entity.primary_key.composite.map((fieldName: string, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded-md">
                        <span className="text-sm font-medium">{fieldName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Si es una clave simple
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Nombre: <span className="font-medium">{entity.primary_key.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tipo: <span className="font-medium">{entity.primary_key.type}</span>
                  </p>
                  <div className="flex items-center mt-2">
                    <Switch id="auto-increment-readonly" checked={entity.auto_increment} disabled />
                    <Label htmlFor="auto-increment-readonly" className="ml-2">
                      Autoincrementable
                    </Label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Si no tiene clave primaria definida, mostrar selector
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selecciona un atributo como clave primaria:</p>
                <Select
                  value={primaryKey?.name}
                  onValueChange={(value) => {
                    const attr = entity.attributes.find((a) => a.name === value)
                    if (attr) {
                      setPrimaryKey(attr)
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un atributo" />
                  </SelectTrigger>
                  <SelectContent>
                    {entity.attributes.map((attr) => (
                      <SelectItem key={attr.name} value={attr.name}>
                        {attr.name} ({attr.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-increment" checked={autoIncrement} onCheckedChange={setAutoIncrement} />
                <Label htmlFor="auto-increment">Clave primaria autoincrementable</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                El sistema generará automáticamente el valor de la clave primaria
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Atributos:</h3>
          <div className="grid grid-cols-3 gap-2">
            {entity.attributes.map((attr, index) => {
              // Verificar si este atributo es la clave primaria
              const isPrimaryKey = hasDefinedPrimaryKey
                ? entity.primary_key.composite
                  ? entity.primary_key.composite.includes(attr.name)
                  : entity.primary_key.name === attr.name
                : primaryKey?.name === attr.name

              return (
                <div
                  key={index}
                  className={`p-2 border rounded-md ${isPrimaryKey ? "border-primary bg-primary/10" : ""}`}
                  onClick={() => !hasDefinedPrimaryKey && setPrimaryKey(attr)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{attr.name}</span>
                    <Badge variant={attr.isRequired ? "default" : "outline"}>{attr.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{attr.isRequired ? "Requerido" : "Opcional"}</p>
                  {isPrimaryKey && (
                    <Badge variant="secondary" className="mt-1">
                      {entity.primary_key.composite ? "Parte de Clave Compuesta" : "Clave Primaria"}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Button onClick={generateJson} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>Generando CRUD...</>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" />
              Generar y Descargar CRUD
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedJson && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">JSON Generado:</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre className="text-xs">{generatedJson}</pre>
            </ScrollArea>
            <Button onClick={downloadCrud} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>Descargando CRUD...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar CRUD Nuevamente
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Actualizar la función selectClass para manejar la selección de una clase del array
  const selectClass = (className: string) => {
    if (!analysisResult) return

    const selectedEntityData = analysisResult.entities.find((entity) => entity.name === className)
    if (!selectedEntityData) return

    setSelectedEntity(className)

    // Si la entidad ya tiene una clave primaria definida, usarla
    if (hasPrimaryKeyDefined(selectedEntityData)) {
      setPrimaryKey(selectedEntityData.primary_key)
      setAutoIncrement(selectedEntityData.auto_increment || false)
    } else {
      // Si no tiene clave primaria definida, usar el primer atributo
      if (selectedEntityData.attributes.length > 0) {
        setPrimaryKey(selectedEntityData.attributes[0])
      } else {
        setPrimaryKey(null)
      }
      setAutoIncrement(false)
    }

    // Resetear el JSON generado (para que se regenere correctamente)
    setGeneratedJson(null)

    // Asegurar el paso activo
    setActiveStep(2)
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Generador CRUD desde XMI</h1>
      <p className="text-muted-foreground mb-8">
        Convierte diagramas de clase XMI en aplicaciones CRUD Angular completas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paso 1: Cargar Diagrama */}
        <Card className={`${activeStep === 1 ? "ring-2 ring-primary" : ""}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                1
              </div>
              <CardTitle>Cargar Diagrama XMI</CardTitle>
            </div>
            <CardDescription>Sube un archivo XMI o pega su contenido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xmi,.xml,.json"
                  className="hidden"
                />
                <Button variant="outline" className="w-full">
                  <FileUp className="mr-2 h-4 w-4" />
                  Pegar Contenido
                </Button>
              </div>

              {fileName && (
                <div className="text-sm">
                  <span className="font-medium">Archivo:</span> {fileName}
                </div>
              )}

              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
                {fileContent ? (
                  <div className="w-full">
                    <Textarea
                      value={fileContent}
                      onChange={handlePasteContent}
                      className="min-h-[150px] text-xs font-mono"
                    />
                  </div>
                ) : (
                  <>
                    <div className="rounded-full p-3 bg-muted mb-3">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground mb-1">
                      Arrastra tu archivo XMI aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                      Formatos soportados: .xmi, .xml, .json (procesado por API)
                    </p>
                  </>
                )}
              </div>

              <Button onClick={analyzeXmi} disabled={!fileContent || isLoading} className="w-full">
                {isLoading ? "Analizando..." : "Analizar XMI"}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paso 2: Seleccionar Clase */}
        <Card className={`${activeStep === 2 ? "ring-2 ring-primary" : ""}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                2
              </div>
              <CardTitle>Seleccionar Clase</CardTitle>
            </div>
            <CardDescription>Elige la clase para generar el CRUD</CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult ? (
              <div className="space-y-4">
                <div className="relative">
                  <Input placeholder="Buscar clases..." className="pl-8" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>

                <div className="space-y-2">
                  {analysisResult.entities.map((entity) => (
                    <div
                      key={entity.name}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedEntity === entity.name ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                      } border`}
                      onClick={() => selectClass(entity.name)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{entity.name}</div>
                        <div className="flex items-center">
                          {hasPrimaryKeyDefined(entity) && (
                            <Badge variant="outline" className="mr-2">
                              PK definida
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {entity.attributes.length} campos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedEntity && renderSelectedEntity()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay clases disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  Carga y analiza un diagrama XMI para ver las clases disponibles
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paso 3: Generar Aplicación */}
        <Card className={`${activeStep === 3 ? "ring-2 ring-primary" : ""}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                3
              </div>
              <CardTitle>Generar Aplicación CRUD</CardTitle>
            </div>
            <CardDescription>Descarga tu aplicación Angular completa</CardDescription>
          </CardHeader>
          <CardContent>
            {activeStep === 3 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Archivos que se generarán</h3>
                  <Badge variant="outline">Angular 16</Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      <span className="font-medium">Estructura del proyecto</span>
                    </div>
                    <div className="pl-6 space-y-1 text-sm">
                      <div className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>Configuración completa (angular.json, package.json, tsconfig.json)</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>Estructura de carpetas organizada (components, models, services)</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>Estilos SCSS con tema oscuro personalizado</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      <span className="font-medium">Componentes CRUD</span>
                      <Badge className="ml-2" variant="outline">
                        Funcionales
                      </Badge>
                    </div>
                    <div className="pl-6 space-y-1 text-sm">
                      <div className="flex items-center">
                        <FileCode className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-mono text-xs">{selectedEntity?.toLowerCase()}-list.component.ts</span>
                      </div>
                      <div className="flex items-center">
                        <FileCode className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-mono text-xs">{selectedEntity?.toLowerCase()}-detail.component.ts</span>
                      </div>
                      <div className="flex items-center">
                        <FileCode className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-mono text-xs">{selectedEntity?.toLowerCase()}-form.component.ts</span>
                      </div>
                      <div className="flex items-center">
                        <FileCode className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-mono text-xs">{selectedEntity?.toLowerCase()}.service.ts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={downloadCrud}>
                  <Package className="mr-2 h-4 w-4" />
                  Generar y Descargar CRUD
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aplicación no generada</h3>
                <p className="text-sm text-muted-foreground">
                  Completa los pasos anteriores para generar tu aplicación CRUD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CrudGenerator
