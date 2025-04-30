"use server"

// Función para normalizar los componentes antes de exportar
function normalizeComponents(components: any[]) {
  return components.map((component) => {
    // Crear una copia del componente para no modificar el original
    const normalizedComponent = { ...component }

    // Normalizar posiciones (redondear x, y)
    if (normalizedComponent.position) {
      normalizedComponent.position = {
        x: Math.round(normalizedComponent.position.x),
        y: Math.round(normalizedComponent.position.y),
      }
    }

    // Normalizar estilos
    if (normalizedComponent.style) {
      const normalizedStyle = { ...normalizedComponent.style }

      // Convertir valores porcentuales a píxeles para width, height, etc.
      // Esto asume que el usuario ha establecido valores específicos en el panel de propiedades
      if (normalizedStyle.width === "100%") {
        // Usar un valor específico en píxeles en lugar del porcentaje
        // Esto debería venir de las propiedades del componente
        normalizedStyle.width = normalizedComponent.props.width ? `${normalizedComponent.props.width}px` : "300px"
      }

      if (normalizedStyle.height === "100%") {
        normalizedStyle.height = normalizedComponent.props.height ? `${normalizedComponent.props.height}px` : "200px"
      }

      normalizedComponent.style = normalizedStyle
    }

    return normalizedComponent
  })
}

// Función para convertir componentes al formato requerido
function convertToRequiredFormat(components: any[]) {
  return components.map((component) => {
    // Extraer ancho y alto del estilo o props
    const width = component.props.width || (component.style.width ? Number.parseInt(component.style.width) : 300)
    const height = component.props.height || (component.style.height ? Number.parseInt(component.style.height) : 200)

    // Crear el objeto en el formato requerido
    return {
      id: component.id,
      type: component.type,
      name: component.props.name || component.type.charAt(0).toUpperCase() + component.type.slice(1),
      position: component.position || { x: 0, y: 0 },
      size: { width, height },
      props: {
        ...component.props,
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

export async function exportToAngular(components: any[], appName: string, pages: any[]) {
  try {
    // Preparar el objeto JSON en el formato requerido
    const jsonData = {
      appName: appName || "angular-ui-app",
      backgroundColor: pages[0]?.pageSettings?.backgroundColor || "#0f172a",
      defaultPage: pages[0]?.name || "landing",
      pages: pages.map((page) => ({
        name: page.name,
        components: convertToRequiredFormat(page.components),
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

    return { success: true }
  } catch (error) {
    console.error("Error exporting to Angular:", error)
    throw error
  }
}
