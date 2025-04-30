"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useComponentContext } from "@/context/component-context"
import { usePageContext } from "@/context/page-context"
import { exportToAngular } from "@/lib/utils"

export default function ExportJsonButton() {
  const { getComponentsForCurrentPage } = useComponentContext()
  const { pages } = usePageContext()

  const handleExportToJson = async () => {
    try {
      // Preparar los datos en el mismo formato exacto que se usa en export-panel.tsx
      const exportData = {
        appName: "angular-ui-app",
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
      }

      console.log("Enviando datos al endpoint:", exportData)

      // Enviar los datos al endpoint
      const response = await fetch("https://angularbuilder.up.railway.app/generar-angular/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportData),
      })

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`)
      }

      // Obtener el blob de la respuesta (archivo ZIP)
      const blob = await response.blob()

      // Crear una URL para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear un elemento <a> para descargar el archivo
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = "angular-ui-app.zip"
      document.body.appendChild(a)

      // Hacer clic en el enlace para iniciar la descarga
      a.click()

      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log("Proyecto exportado y descargado exitosamente")
    } catch (error) {
      console.error("Error al exportar el proyecto:", error)
      alert("Error al exportar el proyecto. Descargando versión local como alternativa.")

      // Fallback a la exportación local en caso de error
      exportToAngular(getComponentsForCurrentPage(), "angular-ui-app", pages)
    }
  }

  return (
    <Button
      size="sm"
      className="text-sm h-8 bg-primary hover:bg-primary/90 hidden md:flex"
      onClick={handleExportToJson}
    >
      <FileDown className="h-4 w-4 mr-2" />
      Descargar Proyecto
    </Button>
  )
}
