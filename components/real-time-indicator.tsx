"use client"

import { useEffect, useState } from "react"
import { useCollaboration } from "@/context/collaboration-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export default function RealTimeIndicator() {
  const { isConnected, connectedUsers } = useCollaboration()
  const [lastActivity, setLastActivity] = useState<Date | null>(null)
  const [reconnecting, setReconnecting] = useState(false)

  // Actualizar la última actividad cuando hay cambios
  useEffect(() => {
    if (isConnected) {
      setLastActivity(new Date())
      setReconnecting(false)
    } else {
      setReconnecting(true)
    }
  }, [isConnected, connectedUsers])

  // Función para reconectar manualmente
  const handleReconnect = () => {
    // Recargar la página para forzar una reconexión
    window.location.reload()
  }

  // Filtrar usuarios activos (excluyendo al usuario actual)
  const activeUsers = connectedUsers.filter(
    (user) => user.userId !== localStorage.getItem("userId") && Date.now() - user.lastActive < 60000,
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary/30 cursor-help">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : reconnecting ? (
              <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge
              variant={isConnected ? "success" : reconnecting ? "outline" : "destructive"}
              className="h-5 px-2 text-xs"
            >
              {isConnected ? "Conectado" : reconnecting ? "Reconectando..." : "Desconectado"}
            </Badge>
            {activeUsers.length > 0 && (
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs text-white border-2 border-background animate-pulse"
                    style={{ backgroundColor: user.color }}
                    title={user.username}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs border-2 border-background">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 p-1">
            <p className="text-sm font-medium">
              {isConnected ? "Conectado en tiempo real" : "Sin conexión en tiempo real"}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeUsers.length} {activeUsers.length === 1 ? "usuario conectado" : "usuarios conectados"}
            </p>
            {activeUsers.length > 0 && (
              <div className="mt-1 space-y-1">
                <p className="text-xs font-medium">Usuarios activos:</p>
                {activeUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }}></div>
                    <span className="text-xs">{user.username}</span>
                  </div>
                ))}
              </div>
            )}
            {lastActivity && (
              <p className="text-xs text-muted-foreground">Última actividad: {lastActivity.toLocaleTimeString()}</p>
            )}
            {!isConnected && (
              <button
                onClick={handleReconnect}
                className="mt-2 w-full text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:bg-primary/90 transition-colors"
              >
                Reconectar manualmente
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
