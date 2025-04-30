"use client"

import { useState } from "react"
import { useComponentContext } from "@/context/component-context"
import { usePageContext } from "@/context/page-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileJson } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Component, AppConfig } from "@/lib/models"

// Mock function for exportToAngular (replace with your actual implementation)
async function exportToAngular(
  components: Component[],
  appName: string,
  pages: any[],
): Promise<{ success: boolean; message: string }> {
  // Simulate a successful export
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true, message: "Export to Angular simulated successfully!" }
}

// Function to normalize components for export
function normalizeComponentsForExport(components: Component[]): Component[] {
  return components.map((component) => {
    // Create a deep copy of the component
    const normalizedComponent = JSON.parse(JSON.stringify(component)) as Component

    // Remove position property as it's only used in the editor
    delete normalizedComponent.position

    // Ensure style properties are compatible with SCSS
    if (normalizedComponent.style) {
      // Convert any pixel values without units to have 'px'
      Object.entries(normalizedComponent.style).forEach(([key, value]) => {
        if (
          typeof value === "number" &&
          ["width", "height", "margin", "padding", "fontSize", "borderRadius"].some((prop) => key.startsWith(prop))
        ) {
          normalizedComponent.style[key] = `${value}px`
        }
      })
    }

    return normalizedComponent
  })
}

// Function to validate components
function validateComponents(components: Component[]): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  const componentMap = new Map<string, Component>()

  // First pass: build component map and check basic properties
  components.forEach((component, index) => {
    if (!component.id) {
      issues.push(`Componente #${index + 1}: Falta ID`)
    } else {
      componentMap.set(component.id, component)
    }

    if (!component.type) {
      issues.push(`Componente #${index + 1}: Falta tipo`)
    }

    if (!component.props) {
      issues.push(`Componente #${index + 1}: Faltan propiedades`)
    }

    if (!component.style) {
      issues.push(`Componente #${index + 1}: Faltan estilos`)
    }
  })

  // Second pass: validate parent-child relationships
  components.forEach((component) => {
    if (component.parentId && !componentMap.has(component.parentId)) {
      issues.push(`Componente ${component.id}: Referencia a un parentId inexistente (${component.parentId})`)
    }

    if (component.children) {
      component.children.forEach((childId) => {
        if (!componentMap.has(childId)) {
          issues.push(`Componente ${component.id}: Referencia a un childId inexistente (${childId})`)
        } else {
          const child = componentMap.get(childId)
          if (child && child.parentId !== component.id) {
            issues.push(`Componente ${component.id}: Inconsistencia en la relación padre-hijo con ${childId}`)
          }
        }
      })
    }
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

export default function ExportPanel() {
  const { getComponentsForCurrentPage } = useComponentContext()
  const { pages } = usePageContext()
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showNormalized, setShowNormalized] = useState(false)
  const [appName, setAppName] = useState("mi-aplicacion-angular")

  // Validate all pages and their components
  const validations = pages.map((page) => ({
    pageName: page.name,
    validation: validateComponents(page.components),
  }))

  const allValid = validations.every((v) => v.validation.valid)

  // Prepare the export data
  const prepareExportData = (): AppConfig => {
    return {
      appName,
      pages: pages.map((page) => ({
        ...page,
        components: normalizeComponentsForExport(page.components),
      })),
    }
  }

  const handleExportToAngular = async () => {
    if (pages.some((page) => page.components.length === 0)) {
      setExportResult({
        success: false,
        message: "Hay páginas sin componentes. Añade componentes a todas las páginas antes de exportar.",
      })
      return
    }

    if (!allValid) {
      setExportResult({
        success: false,
        message: "Hay problemas con algunos componentes. Por favor, corrige los errores antes de exportar.",
      })
      return
    }

    setIsExporting(true)
    setExportResult(null)

    try {
      const result = await exportToAngular(getComponentsForCurrentPage(), appName, pages)

      if (result.success) {
        setExportResult({
          success: true,
          message: "¡Exportación exitosa! Tu archivo JSON ha sido descargado.",
        })
      } else {
        throw new Error("Error en la exportación")
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: `Error en la exportación: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Actualizar la función handleExportToJSON
  const handleExportToJSON = () => {
    if (!allValid) {
      setExportResult({
        success: false,
        message: "Hay problemas con algunos componentes. Por favor, corrige los errores antes de exportar.",
      })
      return
    }

    try {
      // Usar la misma función exportToAngular para generar el JSON en el formato requerido
      exportToAngular(getComponentsForCurrentPage(), appName, pages)

      setExportResult({
        success: true,
        message: "¡Exportación exitosa! El archivo JSON ha sido descargado.",
      })
    } catch (error) {
      setExportResult({
        success: false,
        message: `Error en la exportación: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    }
  }

  // Get the JSON output
  const jsonOutput = JSON.stringify(
    {
      appName: appName || "angular-ui-app",
      backgroundColor: pages[0]?.pageSettings?.backgroundColor || "#0f172a",
      defaultPage: pages[0]?.name || "landing",
      pages: pages.map((page) => {
        // Contador para cada tipo de componente en la página
        const componentTypeCounts: Record<string, number> = {}

        return {
          name: page.name,
          components: page.components.map((component) => {
            // Extraer ancho y alto del estilo o props
            const width =
              component.props.width || (component.style.width ? Number.parseInt(component.style.width) : 300)
            const height =
              component.props.height || (component.style.height ? Number.parseInt(component.style.height) : 200)

            // Generar un ID descriptivo basado en el tipo y nombre del componente
            const componentName =
              component.props.name || component.type.charAt(0).toUpperCase() + component.type.slice(1)
            const formattedName = componentName.replace(/\s+/g, "")

            // Incrementar el contador para este tipo de componente
            componentTypeCounts[component.type] = (componentTypeCounts[component.type] || 0) + 1
            const count = componentTypeCounts[component.type]

            // Crear un ID descriptivo con número secuencial si hay más de uno
            const descriptiveId =
              count > 1 ? `${component.type}-${page.name}-${count}` : `${component.type}-${page.name}`

            // Formatear los links si es un navbar
            const formattedProps = { ...component.props }
            if (component.type === "navbar" && Array.isArray(component.props.links)) {
              formattedProps.links = component.props.links.map((link) =>
                typeof link === "string" ? link : link.href?.replace(/^\//, "") || link.label?.toLowerCase(),
              )
            }

            // Crear el objeto en el formato requerido
            return {
              id: descriptiveId,
              type: component.type,
              name: count > 1 ? `${formattedName}${count}` : formattedName,
              position: component.position || { x: 0, y: 0 },
              size: { width, height },
              props: {
                ...formattedProps,
                // Extraer propiedades de estilo relevantes a props
                ...(component.style.color && { color: component.style.color }),
                ...(component.style.backgroundColor && { backgroundColor: component.style.backgroundColor }),
                ...(component.style.fontSize && { fontSize: component.style.fontSize }),
                ...(component.style.textAlign && { textAlign: component.style.textAlign }),
              },
              // Añadir zIndex si existe
              ...(component.style.zIndex && { zIndex: Number.parseInt(component.style.zIndex) }),
            }
          }),
        }
      }),
    },
    null,
    2,
  )

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-medium text-sm uppercase tracking-wide">Exportar</h3>
      </div>

      <Tabs defaultValue="json" className="flex-1 flex flex-col">
        <TabsList className="w-full h-9 bg-card">
          <TabsTrigger value="json" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <FileJson className="h-4 w-4" />
            JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="flex-1 flex flex-col p-4 m-0">
          <div className="mb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-name" className="text-sm">
                Nombre de la aplicación
              </Label>
              <Input id="app-name" value={appName} onChange={(e) => setAppName(e.target.value)} className="h-8" />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="showNormalized"
                  checked={showNormalized}
                  onChange={() => setShowNormalized(!showNormalized)}
                  className="h-4 w-4"
                />
                <label htmlFor="showNormalized" className="text-xs">
                  Mostrar normalizado
                </label>
              </div>
              {/* Botón de descarga eliminado */}
            </div>
          </div>

          <ScrollArea className="flex-1 border rounded-md border-primary/10 bg-card/50">
            <pre className="p-4 text-xs font-mono">{jsonOutput}</pre>
          </ScrollArea>

          {exportResult && (
            <Alert
              className={`mt-4 ${exportResult.success ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
            >
              <AlertTitle className={exportResult.success ? "text-green-300" : "text-red-300"}>
                {exportResult.success ? "Éxito" : "Error"}
              </AlertTitle>
              <AlertDescription className={exportResult.success ? "text-green-300" : "text-red-300"}>
                {exportResult.message}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
