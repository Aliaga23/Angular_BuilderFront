import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Función para convertir componentes al formato requerido
function convertToRequiredFormat(components: any[], pageName: string) {
  // Contador para cada tipo de componente
  const componentTypeCounts: Record<string, number> = {}

  return components.map((component) => {
    // Extraer ancho y alto del estilo o props
    const width = component.props.width || (component.style.width ? Number.parseInt(component.style.width) : 300)
    const height = component.props.height || (component.style.height ? Number.parseInt(component.style.height) : 200)

    // Generar un ID descriptivo basado en el tipo y nombre del componente
    const componentName = component.props.name || component.type.charAt(0).toUpperCase() + component.type.slice(1)
    const formattedName = componentName.replace(/\s+/g, "")

    // Incrementar el contador para este tipo de componente
    componentTypeCounts[component.type] = (componentTypeCounts[component.type] || 0) + 1
    const count = componentTypeCounts[component.type]

    // Crear un ID descriptivo con número secuencial si hay más de uno
    const descriptiveId = count > 1 ? `${component.type}-${pageName}-${count}` : `${component.type}-${pageName}`

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
  })
}

// Esta es la función de exportación real
export async function exportToAngular(components: any[], appName: string, pages: any[]) {
  try {
    // Preparar el objeto JSON en el formato requerido
    const jsonData = {
      appName: appName || "angular-ui-app",
      backgroundColor: pages[0]?.pageSettings?.backgroundColor || "#0f172a",
      defaultPage: pages[0]?.name || "landing",
      pages: pages.map((page) => ({
        name: page.name,
        components: convertToRequiredFormat(page.components, page.name),
      })),
    }

    // Convertir a JSON
    const jsonString = JSON.stringify(jsonData, null, 2)

    // Crear un blob y descargar
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${appName || "angular-ui-app"}.json`
    document.body.appendChild(a)
    a.click()

    // Limpiar
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, message: "Exportación exitosa" }
  } catch (error) {
    console.error("Error exporting to Angular:", error)
    return { success: false, message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}` }
  }
}
