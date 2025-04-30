// Web Worker para procesar mensajes en segundo plano

// Función para procesar mensajes
function processMessage(message) {
  // Optimizar el mensaje para reducir tamaño
  const optimizedMessage = optimizeMessage(message)

  // Simular procesamiento
  return {
    type: "PROCESSED_MESSAGE",
    originalMessage: message,
    processedMessage: optimizedMessage,
    timestamp: Date.now(),
  }
}

// Función para optimizar mensajes
function optimizeMessage(message) {
  // Copia para no modificar el original
  const optimized = { ...message }

  // Si hay payload, optimizarlo
  if (optimized.payload) {
    // Eliminar propiedades innecesarias según el tipo de mensaje
    if (message.type === "UPDATE_COMPONENT") {
      // Eliminar propiedades que no afectan la visualización
      const { internalState, cachedValues, ...essentialProps } = optimized.payload
      optimized.payload = essentialProps
    }

    // Comprimir datos grandes si es necesario
    if (message.type === "INITIAL_STATE" && optimized.payload.components) {
      // Simplificar componentes para transferencia
      optimized.payload.components = optimized.payload.components.map((comp) => ({
        id: comp.id,
        type: comp.type,
        position: comp.position,
        props: stripUnnecessaryProps(comp.props),
        style: stripUnnecessaryProps(comp.style),
      }))
    }
  }

  return optimized
}

// Eliminar propiedades innecesarias de un objeto
function stripUnnecessaryProps(obj) {
  if (!obj) return {}

  const result = { ...obj }

  // Propiedades que generalmente no afectan la visualización
  const unnecessaryProps = [
    "internalState",
    "cachedValues",
    "lastUpdated",
    "metadata",
    "debug",
    "history",
    "undoStack",
    "redoStack",
  ]

  unnecessaryProps.forEach((prop) => {
    if (prop in result) {
      delete result[prop]
    }
  })

  return result
}

// Escuchar mensajes del hilo principal
self.addEventListener("message", (event) => {
  const { type, message } = event.data

  if (type === "PROCESS_MESSAGE") {
    const result = processMessage(message)
    self.postMessage(result)
  }
})

// Notificar que el worker está listo
self.postMessage({ type: "WORKER_READY" })
