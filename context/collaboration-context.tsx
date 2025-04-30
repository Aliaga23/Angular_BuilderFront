"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from "react"
import { messageQueue } from "@/lib/message-queue"
import { computeDiff, applyDiff, compressObject } from "@/lib/diff-utils"
import { invalidateCacheOnChanges } from "@/lib/enhanced-component-cache"

// Declarar la propiedad socket en el objeto window para TypeScript
declare global {
  interface Window {
    socket?: WebSocket
    toast?: any // Assuming toast is a function
  }
}

// Tipos para los mensajes de colaboración
export type ChangeType =
  | "ADD_COMPONENT"
  | "UPDATE_COMPONENT"
  | "REMOVE_COMPONENT"
  | "MOVE_COMPONENT"
  | "DUPLICATE_COMPONENT"
  | "UPDATE_PAGE"
  | "ADD_PAGE"
  | "REMOVE_PAGE"
  | "INITIAL_STATE"
  | "USER_CONNECTED"
  | "USER_DISCONNECTED"
  | "CURSOR_POSITION"
  | "ACTIVE_COMPONENT"
  | "CHANGE_CURRENT_PAGE"
  | "REQUEST_STATE"
  | "BATCH_CURSOR_POSITIONS"
  | "BATCH_COMPONENT_MOVES"
  | "BATCH_COMPONENT_UPDATES"
  | "BATCH_ACTIVE_COMPONENTS"
  | "PROJECT_SAVED"
  | "CONNECTED_USERS"

export interface ChangeMessage {
  type: ChangeType
  projectId?: string
  userId?: string
  timestamp?: number
  payload: any
  componentId?: string
  pageIndex?: number
  fullState?: any
  diff?: any
}

// Añadir a la interfaz ConnectedUser
export interface ConnectedUser {
  userId: string
  username: string
  color: string
  lastActive: number
  cursorPosition?: { x: number; y: number }
  currentComponent?: string | null
}

// Añadir a la interfaz CollaborationContextType
export interface CollaborationContextType {
  isConnected: boolean
  connectedUsers: ConnectedUser[]
  sendChange: (change: Omit<ChangeMessage, "userId" | "timestamp" | "projectId">, fullState?: any) => void
  userId: string
  projectId: string
  handleIncomingMessage: (message: ChangeMessage) => void
  lastMessage: ChangeMessage | null
  updateCursorPosition: (x: number, y: number) => void
  setActiveComponent: (componentId: string | null) => void
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

// Colores para asignar a usuarios
const USER_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
]

// Función para generar un color consistente basado en userId
const getUserColor = (userId: string) => {
  // Convertir userId a un número usando la suma de los códigos de caracteres
  const sum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Usar el módulo para obtener un índice dentro del array de colores
  return USER_COLORS[sum % USER_COLORS.length]
}

export function CollaborationProvider({
  children,
  initialProjectId,
}: {
  children: ReactNode
  initialProjectId?: string
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<ChangeMessage | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const processedMessagesRef = useRef<Set<string>>(new Set())
  const lastStateRef = useRef<any>(null)
  const cursorPositionRef = useRef<{ x: number; y: number } | null>(null)
  const lastCursorUpdateRef = useRef<number>(0)
  const activeComponentRef = useRef<string | null>(null)
  const stateRequestTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Obtener userId del localStorage o generar uno nuevo
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) return storedUserId

      // Generar nuevo userId
      const newUserId = Math.random().toString(36).substring(2, 9)
      localStorage.setItem("userId", newUserId)
      return newUserId
    }
    return Math.random().toString(36).substring(2, 9)
  })

  // Obtener o generar projectId
  const [projectId] = useState(() => {
    if (initialProjectId) return initialProjectId

    if (typeof window !== "undefined") {
      const storedProjectId = localStorage.getItem("projectId")
      if (storedProjectId) return storedProjectId

      // Generar nuevo projectId
      const newProjectId = Math.random().toString(36).substring(2, 9)
      localStorage.setItem("projectId", newProjectId)
      return newProjectId
    }
    return Math.random().toString(36).substring(2, 9)
  })

  // Función optimizada para manejar mensajes entrantes
  const handleIncomingMessage = useCallback(
    (message: ChangeMessage) => {
      // Ignorar mensajes propios excepto CONNECTED_USERS
      if (message.userId === userId && message.type !== "CONNECTED_USERS") return

      // Crear un ID único para este mensaje
      const messageId = `${message.type}-${message.userId}-${message.timestamp}`

      // Evitar procesar el mismo mensaje múltiples veces
      if (processedMessagesRef.current.has(messageId)) return
      processedMessagesRef.current.add(messageId)

      // Limitar el tamaño del conjunto de mensajes procesados
      if (processedMessagesRef.current.size > 200) {
        const iterator = processedMessagesRef.current.values()
        for (let i = 0; i < 50; i++) {
          processedMessagesRef.current.delete(iterator.next().value)
        }
      }

      // Actualizar la última actividad del usuario
      if (message.userId) {
        setConnectedUsers((prev) => {
          // Evitar actualizaciones innecesarias
          const existingUserIndex = prev.findIndex((u) => u.userId === message.userId)

          if (existingUserIndex >= 0) {
            // Para mensajes de cursor, actualizar inmediatamente
            if (message.type === "CURSOR_POSITION" || message.type === "BATCH_CURSOR_POSITIONS") {
              const updatedUsers = [...prev]
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                cursorPosition: message.payload,
                lastActive: Date.now(),
              }
              return updatedUsers
            }

            // Para mensajes de componente activo, actualizar inmediatamente
            if (message.type === "ACTIVE_COMPONENT" || message.type === "BATCH_ACTIVE_COMPONENTS") {
              const updatedUsers = [...prev]
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                currentComponent: message.payload.componentId,
                lastActive: Date.now(),
              }
              return updatedUsers
            }

            // Para otros mensajes, solo actualizar si ha pasado suficiente tiempo
            const now = Date.now()
            const lastActive = prev[existingUserIndex].lastActive
            if (now - lastActive < 2000) return prev // No actualizar si fue hace menos de 2 segundos

            const updatedUsers = [...prev]
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              lastActive: now,
            }
            return updatedUsers
          }

          return prev
        })
      }

      // Actualizar el último mensaje recibido
      setLastMessage(message)

      // Manejar mensajes por lotes
      if (message.type === "BATCH_CURSOR_POSITIONS" && message.payload) {
        // Procesar cada posición de cursor en el lote
        Object.entries(message.payload).forEach(([batchUserId, position]) => {
          if (batchUserId !== userId) {
            setConnectedUsers((prev) => {
              const userIndex = prev.findIndex((u) => u.userId === batchUserId)
              if (userIndex >= 0) {
                const updatedUsers = [...prev]
                updatedUsers[userIndex] = {
                  ...updatedUsers[userIndex],
                  cursorPosition: position,
                  lastActive: Date.now(),
                }
                return updatedUsers
              }
              return prev
            })
          }
        })
        return
      }

      if (message.type === "BATCH_ACTIVE_COMPONENTS" && message.payload) {
        // Procesar cada componente activo en el lote
        Object.entries(message.payload).forEach(([batchUserId, componentData]) => {
          if (batchUserId !== userId) {
            setConnectedUsers((prev) => {
              const userIndex = prev.findIndex((u) => u.userId === batchUserId)
              if (userIndex >= 0) {
                const updatedUsers = [...prev]
                updatedUsers[userIndex] = {
                  ...updatedUsers[userIndex],
                  currentComponent: componentData.componentId,
                  lastActive: Date.now(),
                }
                return updatedUsers
              }
              return prev
            })
          }
        })
        return
      }

      // Para mensajes que modifican componentes, invalidar la caché
      if (
        ["ADD_COMPONENT", "UPDATE_COMPONENT", "REMOVE_COMPONENT", "MOVE_COMPONENT", "INITIAL_STATE"].includes(
          message.type,
        )
      ) {
        invalidateCacheOnChanges()
      }

      // Manejar mensajes específicos
      switch (message.type) {
        case "CURSOR_POSITION":
          if (message.userId && message.payload) {
            console.log(`Cursor recibido de ${message.userId}:`, message.payload) // Añadir log para depuración
            setConnectedUsers((prev) => {
              const userIndex = prev.findIndex((u) => u.userId === message.userId)

              if (userIndex >= 0) {
                const updatedUsers = [...prev]
                updatedUsers[userIndex] = {
                  ...updatedUsers[userIndex],
                  cursorPosition: message.payload,
                  lastActive: Date.now(),
                }
                return updatedUsers
              } else {
                // Si el usuario no existe en la lista, añadirlo
                // Esto es importante para que los nuevos usuarios vean los cursores
                const newUser: ConnectedUser = {
                  userId: message.userId!,
                  username: `Usuario ${message.userId!.substring(0, 4)}`,
                  color: getUserColor(message.userId!),
                  lastActive: Date.now(),
                  cursorPosition: message.payload,
                }
                console.log("Añadiendo nuevo usuario con cursor:", newUser) // Log para depuración
                return [...prev, newUser]
              }
            })
          }
          break

        case "CONNECTED_USERS":
          if (message.payload && Array.isArray(message.payload)) {
            setConnectedUsers(
              message.payload.map((user: any) => ({
                userId: user.userId,
                username: user.username || `Usuario ${user.userId.substring(0, 4)}`,
                color: user.color || getUserColor(user.userId),
                lastActive: user.lastActive || Date.now(),
                cursorPosition: user.cursorPosition || null,
                currentComponent: user.currentComponent || null,
              })),
            )
          }
          break

        case "USER_CONNECTED":
          if (message.payload) {
            // Cuando un nuevo usuario se conecta, añadirlo a la lista de usuarios conectados
            setConnectedUsers((prev) => {
              const exists = prev.some((u) => u.userId === message.userId)
              if (exists) return prev

              // Si somos un usuario ya conectado, enviar nuestra posición de cursor al nuevo usuario
              if (
                message.userId !== userId &&
                cursorPositionRef.current &&
                socketRef.current &&
                socketRef.current.readyState === WebSocket.OPEN
              ) {
                // Enviar nuestra posición de cursor al nuevo usuario
                socketRef.current.send(
                  JSON.stringify({
                    type: "CURSOR_POSITION",
                    userId,
                    projectId,
                    timestamp: Date.now(),
                    payload: cursorPositionRef.current,
                  }),
                )
              }

              return [
                ...prev,
                {
                  userId: message.userId!,
                  username: message.payload.username || `Usuario ${message.userId?.substring(0, 4)}`,
                  color: message.payload.color || getUserColor(message.userId!),
                  lastActive: Date.now(),
                  cursorPosition: null,
                  currentComponent: null,
                },
              ]
            })
          }
          break

        case "ACTIVE_COMPONENT":
          if (message.userId && message.payload) {
            setConnectedUsers((prev) => {
              const userIndex = prev.findIndex((u) => u.userId === message.userId)
              if (userIndex >= 0) {
                const updatedUsers = [...prev]
                updatedUsers[userIndex] = {
                  ...updatedUsers[userIndex],
                  currentComponent: message.payload.componentId,
                  lastActive: Date.now(),
                }
                return updatedUsers
              }
              return prev
            })
          }
          break

        // Añadir manejo específico para mensajes de componentes
        case "ADD_COMPONENT":
        case "UPDATE_COMPONENT":
        case "REMOVE_COMPONENT":
        case "MOVE_COMPONENT":
          // Estos mensajes deben ser manejados por los contextos específicos
          // El mensaje ya se ha enviado a través del socket y será procesado
          // por los manejadores correspondientes en component-context.tsx y page-context.tsx
          break

        case "INITIAL_STATE":
          // El estado inicial se maneja automáticamente en los contextos correspondientes
          break
        case "PROJECT_SAVED":
          // Mostrar una notificación al usuario
          if (typeof window !== "undefined" && window.toast) {
            window.toast({
              title: "Proyecto guardado",
              description: `El proyecto ha sido guardado por ${message.userId}`,
              duration: 3000,
            })
          }
          break
      }
    },
    [userId, projectId],
  )

  // Función optimizada para enviar cambios
  const sendChange = useCallback(
    (change: Omit<ChangeMessage, "userId" | "timestamp" | "projectId">, fullState?: any) => {
      // Crear el mensaje completo
      const fullChange: ChangeMessage = {
        ...change,
        userId,
        projectId,
        timestamp: Date.now(),
      }

      // Si se proporciona el estado completo, guardarlo para futuras comparaciones
      if (fullState) {
        // Comprimir el estado para reducir tamaño
        const compressedState = compressObject(fullState, [
          "internalState",
          "cachedValues",
          "lastUpdated",
          "metadata",
          "debug",
          "history",
          "undoStack",
          "redoStack",
        ])

        // Si hay un estado anterior, calcular diferencias
        if (lastStateRef.current && change.type !== "INITIAL_STATE") {
          const diff = computeDiff(lastStateRef.current, compressedState)
          if (diff) {
            fullChange.diff = diff
          }
        }

        // Actualizar la referencia del último estado
        lastStateRef.current = compressedState

        // Incluir el estado completo solo para ciertos tipos de mensajes
        if (["INITIAL_STATE", "REQUEST_STATE"].includes(change.type)) {
          fullChange.fullState = compressedState
        }
      }

      // Añadir a la cola de mensajes para envío optimizado
      messageQueue.enqueue(fullChange)
    },
    [userId, projectId],
  )

  // Función optimizada para actualizar la posición del cursor
  const updateCursorPosition = useCallback(
    (x: number, y: number) => {
      // Actualizar la referencia
      cursorPositionRef.current = { x, y }

      // Limitar la frecuencia de actualizaciones pero hacerlas más frecuentes
      const now = Date.now()
      if (now - lastCursorUpdateRef.current < 30) {
        // Reducido de 50ms a 30ms
        return
      }

      lastCursorUpdateRef.current = now

      // Enviar la posición del cursor al servidor
      sendChange({
        type: "CURSOR_POSITION",
        payload: { x, y },
      })

      // Actualizar la posición del cursor del usuario actual localmente
      setConnectedUsers((prev) => {
        const userIndex = prev.findIndex((u) => u.userId === userId)
        if (userIndex >= 0) {
          const updatedUsers = [...prev]
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            cursorPosition: { x, y },
            lastActive: Date.now(),
          }
          return updatedUsers
        }
        return prev
      })
    },
    [userId, sendChange],
  )

  // Función optimizada para establecer el componente activo
  const setActiveComponent = useCallback(
    (componentId: string | null) => {
      // Si no ha cambiado, no hacer nada
      if (componentId === activeComponentRef.current) {
        return
      }

      activeComponentRef.current = componentId

      // Enviar el componente activo al servidor
      sendChange({
        type: "ACTIVE_COMPONENT",
        payload: { componentId },
      })

      // Actualizar el componente activo del usuario actual
      setConnectedUsers((prev) => {
        const userIndex = prev.findIndex((u) => u.userId === userId)
        if (userIndex >= 0) {
          const updatedUsers = [...prev]
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            currentComponent: componentId,
            lastActive: Date.now(),
          }
          return updatedUsers
        }
        return prev
      })
    },
    [userId, sendChange],
  )

  // Conectar al WebSocket cuando el componente se monta
  useEffect(() => {
    // Evitar ejecutar en el servidor
    if (typeof window === "undefined") return

    // Resetear contador de intentos de reconexión
    reconnectAttemptsRef.current = 0

    const connectWebSocket = () => {
      try {
        // Limpiar cualquier timeout de reconexión pendiente
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }

        // Obtener la URL del WebSocket del entorno o usar valor por defecto
        const wsUrl = `wss://angularbuilder.up.railway.app/ws/${projectId}/${userId}`
        // Conectando al WebSocket

        const ws = new WebSocket(wsUrl)

        // Establecer un timeout para la conexión
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close()
          }
        }, 5000)

        ws.onopen = () => {
          clearTimeout(connectionTimeout)
          setIsConnected(true)
          // Conectado al servidor colaborativo

          // Configurar la cola de mensajes con el socket
          messageQueue.setSocket(ws)

          // Enviar mensaje de conexión
          const connectMessage: ChangeMessage = {
            type: "USER_CONNECTED",
            userId,
            projectId,
            timestamp: Date.now(),
            payload: {
              username: localStorage.getItem("username") || `Usuario ${userId.substring(0, 4)}`,
              color: getUserColor(userId),
            },
          }

          ws.send(JSON.stringify(connectMessage))

          // Enviar posición del cursor inmediatamente después de conectar
          // Esto asegura que los nuevos usuarios vean nuestro cursor aunque no lo hayamos movido
          if (cursorPositionRef.current) {
            const cursorMessage: ChangeMessage = {
              type: "CURSOR_POSITION",
              userId,
              projectId,
              timestamp: Date.now(),
              payload: cursorPositionRef.current,
            }
            ws.send(JSON.stringify(cursorMessage))
          }

          // Solicitar el estado inicial después de conectar
          const requestStateMessage: ChangeMessage = {
            type: "REQUEST_STATE",
            userId,
            projectId,
            timestamp: Date.now(),
            payload: {},
          }

          ws.send(JSON.stringify(requestStateMessage))
        }

        ws.onclose = (event) => {
          setIsConnected(false)
          // Desconectado del servidor colaborativo

          // Limpiar la cola de mensajes
          messageQueue.clear()

          // Intentar reconectar después de un tiempo, con backoff exponencial
          const reconnectDelay = Math.min(5000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++
          // Intentando reconectar

          reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectDelay)
        }

        ws.onerror = (error) => {
          // Error en la conexión WebSocket
          setIsConnected(false)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ChangeMessage

            // Responder a los pings inmediatamente
            if (message.type === "PING") {
              // Ping recibido, enviando pong
              ws.send(
                JSON.stringify({
                  type: "PONG",
                  userId,
                  projectId,
                  timestamp: Date.now(),
                  payload: { pong: true },
                }),
              )
            }

            // Si el mensaje contiene diferencias, aplicarlas al estado local
            if (message.diff && lastStateRef.current) {
              const updatedState = applyDiff(lastStateRef.current, message.diff)
              lastStateRef.current = updatedState
              message.fullState = updatedState
            }

            // Procesar el mensaje normalmente
            handleIncomingMessage(message)
          } catch (error) {
            console.error("Error al procesar mensaje:", error)
          }
        }

        socketRef.current = ws
        // Hacer accesible el socket para depuración
        if (typeof window !== "undefined") {
          window.socket = ws
        }
      } catch (error) {
        // Error al conectar al servidor WebSocket
        setIsConnected(false)

        // Intentar reconectar después de un tiempo
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    // Limpiar al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (stateRequestTimeoutRef.current) {
        clearTimeout(stateRequestTimeoutRef.current)
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }

      messageQueue.clear()
    }
  }, [projectId, userId, handleIncomingMessage])

  // Añadir el usuario actual a la lista de usuarios conectados
  useEffect(() => {
    if (isConnected) {
      const currentUser: ConnectedUser = {
        userId,
        username: localStorage.getItem("username") || `Usuario ${userId.substring(0, 4)}`,
        color: getUserColor(userId), // Usar color consistente
        lastActive: Date.now(),
      }

      setConnectedUsers((prev) => {
        // Si el usuario ya está en la lista, no actualizar
        if (prev.some((u) => u.userId === userId)) return prev

        // Si no, añadirlo
        return [currentUser, ...prev]
      })
    }
  }, [isConnected, userId])

  // Limpiar usuarios inactivos periódicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setConnectedUsers((prev) =>
        prev.filter(
          (user) => user.userId === userId || now - user.lastActive < 60000, // 1 minuto
        ),
      )
    }, 30000) // Cada 30 segundos

    return () => clearInterval(cleanupInterval)
  }, [userId])

  return (
    <CollaborationContext.Provider
      value={{
        isConnected,
        connectedUsers,
        sendChange,
        userId,
        projectId,
        handleIncomingMessage,
        lastMessage,
        updateCursorPosition,
        setActiveComponent,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  )
}

export function useCollaboration() {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error("useCollaboration debe usarse dentro de un CollaborationProvider")
  }
  return context
}
