// Sistema de cola de mensajes con prioridades para optimizar la comunicación en tiempo real
import type { ChangeMessage } from "@/context/collaboration-context"

// Tipos de prioridad para los mensajes
type Priority = "high" | "medium" | "low"

// Interfaz para un mensaje en cola con prioridad
interface QueuedMessage {
  message: ChangeMessage
  priority: Priority
  timestamp: number
  attempts: number
}

class MessageQueue {
  private queue: QueuedMessage[] = []
  private socket: WebSocket | null = null
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private maxAttempts = 3
  private batchSize = 10
  private cursorPositions: Record<string, any> = {}
  private componentMoves: Record<string, any> = {}
  private lastBatchTime = 0
  private batchInterval = 200 // ms

  constructor() {
    // Iniciar el procesamiento de la cola cuando se crea la instancia
    this.startProcessing()
  }

  // Establecer el socket WebSocket
  public setSocket(socket: WebSocket): void {
    this.socket = socket

    // Si hay mensajes en cola, procesar inmediatamente
    if (this.queue.length > 0) {
      this.processQueue()
    }
  }

  // Añadir un mensaje a la cola
  public enqueue(message: ChangeMessage): void {
    // Determinar la prioridad del mensaje según su tipo
    const priority = this.getPriority(message.type)

    // Manejar casos especiales para optimización
    if (message.type === "CURSOR_POSITION") {
      // Almacenar la última posición del cursor por usuario
      if (message.userId) {
        this.cursorPositions[message.userId] = message.payload

        // Verificar si es momento de enviar un lote de posiciones
        const now = Date.now()
        if (now - this.lastBatchTime >= this.batchInterval && Object.keys(this.cursorPositions).length > 0) {
          this.sendCursorBatch()
        }

        // No encolar mensajes individuales de cursor, se enviarán en lote
        return
      }
    }

    if (message.type === "MOVE_COMPONENT") {
      // Almacenar el último movimiento de componente por ID
      if (message.componentId) {
        this.componentMoves[message.componentId] = message

        // Verificar si es momento de enviar un lote de movimientos
        const now = Date.now()
        if (now - this.lastBatchTime >= this.batchInterval && Object.keys(this.componentMoves).length > 0) {
          this.sendComponentMovesBatch()
        }

        // No encolar mensajes individuales de movimiento, se enviarán en lote
        return
      }
    }

    // Añadir el mensaje a la cola con su prioridad
    this.queue.push({
      message,
      priority,
      timestamp: Date.now(),
      attempts: 0,
    })

    // Ordenar la cola por prioridad y timestamp
    this.sortQueue()

    // Si no se está procesando, iniciar el procesamiento
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  // Procesar la cola de mensajes
  private processQueue(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true

    // Procesar un lote de mensajes
    const batch = this.queue.slice(0, this.batchSize)
    let successCount = 0

    for (const item of batch) {
      try {
        // Incrementar el contador de intentos
        item.attempts++

        // Enviar el mensaje
        this.socket.send(JSON.stringify(item.message))

        // Marcar como exitoso
        successCount++

        // Eliminar de la cola
        const index = this.queue.indexOf(item)
        if (index !== -1) {
          this.queue.splice(index, 1)
        }
      } catch (error) {
        console.error("Error al enviar mensaje:", error)

        // Si se ha excedido el número máximo de intentos, eliminar de la cola
        if (item.attempts >= this.maxAttempts) {
          const index = this.queue.indexOf(item)
          if (index !== -1) {
            this.queue.splice(index, 1)
          }
        }
      }
    }

    // Si quedan mensajes en la cola, programar el siguiente procesamiento
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 50)
    } else {
      this.isProcessing = false
    }
  }

  // Determinar la prioridad de un mensaje según su tipo
  private getPriority(type: string): Priority {
    // Mensajes de alta prioridad (críticos para la experiencia del usuario)
    if (["ADD_COMPONENT", "REMOVE_COMPONENT", "INITIAL_STATE", "USER_CONNECTED", "REQUEST_STATE"].includes(type)) {
      return "high"
    }

    // Mensajes de prioridad media
    if (["UPDATE_COMPONENT", "ADD_PAGE", "REMOVE_PAGE", "UPDATE_PAGE", "ACTIVE_COMPONENT"].includes(type)) {
      return "medium"
    }

    // Mensajes de baja prioridad (pueden retrasarse sin afectar significativamente la experiencia)
    return "low"
  }

  // Ordenar la cola por prioridad y timestamp
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Primero ordenar por prioridad
      const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      // Si tienen la misma prioridad, ordenar por timestamp (más antiguo primero)
      return a.timestamp - b.timestamp
    })
  }

  // Enviar un lote de posiciones de cursor
  private sendCursorBatch(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || Object.keys(this.cursorPositions).length === 0) {
      return
    }

    // Crear un mensaje de lote con todas las posiciones de cursor
    const batchMessage: ChangeMessage = {
      type: "BATCH_CURSOR_POSITIONS",
      timestamp: Date.now(),
      payload: { ...this.cursorPositions },
    }

    try {
      // Enviar el lote
      this.socket.send(JSON.stringify(batchMessage))

      // Limpiar las posiciones almacenadas
      this.cursorPositions = {}

      // Actualizar el tiempo del último lote
      this.lastBatchTime = Date.now()
    } catch (error) {
      console.error("Error al enviar lote de posiciones de cursor:", error)
    }
  }

  // Enviar un lote de movimientos de componentes
  private sendComponentMovesBatch(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || Object.keys(this.componentMoves).length === 0) {
      return
    }

    // Crear un mensaje de lote con todos los movimientos de componentes
    const batchMessage: ChangeMessage = {
      type: "BATCH_COMPONENT_MOVES",
      timestamp: Date.now(),
      payload: { ...this.componentMoves },
    }

    try {
      // Enviar el lote
      this.socket.send(JSON.stringify(batchMessage))

      // Limpiar los movimientos almacenados
      this.componentMoves = {}

      // Actualizar el tiempo del último lote
      this.lastBatchTime = Date.now()
    } catch (error) {
      console.error("Error al enviar lote de movimientos de componentes:", error)
    }
  }

  // Iniciar el procesamiento periódico de la cola
  private startProcessing(): void {
    // Procesar la cola cada 100ms
    this.processingInterval = setInterval(() => {
      // Enviar lotes pendientes si ha pasado suficiente tiempo
      const now = Date.now()
      if (now - this.lastBatchTime >= this.batchInterval) {
        if (Object.keys(this.cursorPositions).length > 0) {
          this.sendCursorBatch()
        }

        if (Object.keys(this.componentMoves).length > 0) {
          this.sendComponentMovesBatch()
        }
      }

      // Procesar la cola si hay mensajes y no se está procesando
      if (this.queue.length > 0 && !this.isProcessing) {
        this.processQueue()
      }
    }, 100)
  }

  // Limpiar la cola y detener el procesamiento
  public clear(): void {
    this.queue = []
    this.cursorPositions = {}
    this.componentMoves = {}

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    this.isProcessing = false
  }

  // Obtener estadísticas de la cola
  public getStats(): { queueLength: number; highPriority: number; mediumPriority: number; lowPriority: number } {
    const highPriority = this.queue.filter((item) => item.priority === "high").length
    const mediumPriority = this.queue.filter((item) => item.priority === "medium").length
    const lowPriority = this.queue.filter((item) => item.priority === "low").length

    return {
      queueLength: this.queue.length,
      highPriority,
      mediumPriority,
      lowPriority,
    }
  }
}

// Exportar una instancia singleton
export const messageQueue = new MessageQueue()
