"use client"

import { useCollaboration } from "@/context/collaboration-context"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"

export default function ServerStatus() {
  const { isConnected, projectId, userId, connectedUsers } = useCollaboration()
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null)

  // Actualizar el tiempo del último mensaje
  useEffect(() => {
    if (isConnected) {
      setLastMessageTime(new Date().toLocaleTimeString())
    }
  }, [isConnected])

  const handleReconnect = () => {
    setIsReconnecting(true)
    // Forzar reconexión al WebSocket
    localStorage.setItem("forceReconnect", "true")
    window.location.reload()
  }

  return (
    <div className="p-4 border border-dashed border-border rounded-md bg-secondary/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Estado del Servidor</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-primary border-primary/30 hover:bg-primary/10"
          onClick={handleReconnect}
          disabled={isReconnecting}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isReconnecting ? "animate-spin" : ""}`} />
          Forzar reconexión
        </Button>
      </div>

      <div className="space-y-2">
        <div className="p-3 rounded-md bg-secondary/30 text-sm">
          <p>
            URL del servidor:{" "}
            <code className="text-xs bg-secondary p-1 rounded">
              wss://angularbuilder.up.railway.app/ws/{projectId}/{userId}
            </code>
          </p>
          <p className="mt-2">
            Estado:{" "}
            <span className={isConnected ? "text-green-500" : "text-red-500"}>
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
            {isConnected && (
              <span className="ml-2 text-xs text-muted-foreground">({connectedUsers.length} usuarios conectados)</span>
            )}
          </p>
          {lastMessageTime && (
            <p className="mt-1 text-xs">
              Último mensaje: <span className="font-mono">{lastMessageTime}</span>
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isConnected
            ? "Los cambios se sincronizarán automáticamente con otros usuarios."
            : "No se pueden sincronizar los cambios. Verifica la conexión al servidor."}
        </p>

        {!isConnected && (
          <div className="flex items-center gap-2 mt-2">
            <WifiOff className="h-4 w-4 text-red-500" />
            <p className="text-xs text-red-500">
              Servidor desconectado. Intenta reconectar o verifica que el servidor esté en ejecución.
            </p>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center gap-2 mt-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <p className="text-xs text-green-500">Servidor conectado. La colaboración en tiempo real está activa.</p>
          </div>
        )}

        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Enviar un ping al servidor para verificar la conexión
              const pingMessage = {
                type: "PING",
                userId,
                projectId,
                timestamp: Date.now(),
                payload: { time: Date.now() },
              }

              try {
                // Acceder directamente al socket para enviar el ping
                if (window.socket && window.socket.readyState === WebSocket.OPEN) {
                  window.socket.send(JSON.stringify(pingMessage))
                  // Ping enviado al servidor
                  setLastMessageTime(new Date().toLocaleTimeString())
                } else {
                  // No se pudo enviar ping: WebSocket no disponible
                }
              } catch (error) {
                // Error al enviar ping
              }
            }}
          >
            Enviar ping al servidor
          </Button>
        </div>
      </div>
    </div>
  )
}
