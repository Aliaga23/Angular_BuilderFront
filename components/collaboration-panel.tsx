"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Users, UserPlus, Activity, Copy, Check } from "lucide-react"
import { useCollaboration } from "@/context/collaboration-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ServerStatus from "./server-status"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface CollaborationPanelProps {
  onClose: () => void
}

export default function CollaborationPanel({ onClose }: CollaborationPanelProps) {
  const { isConnected, connectedUsers, projectId, userId } = useCollaboration()
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || ""
    }
    return ""
  })
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  // Generar el enlace de invitación cuando se monta el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      // Asegurarse de que no haya parámetros duplicados
      url.searchParams.delete("projectId")
      url.searchParams.append("projectId", projectId)
      setInviteLink(url.toString())
    }
  }, [projectId])

  const saveUsername = () => {
    if (username.trim()) {
      localStorage.setItem("username", username)
      toast({
        title: "Nombre guardado",
        description: "Tu nombre de usuario ha sido actualizado.",
      })
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setCopied(true)
        toast({
          title: "Enlace copiado",
          description: "Enlace de invitación copiado al portapapeles.",
        })
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace. Inténtalo de nuevo.",
          variant: "destructive",
        })
      })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Colaboración</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="users" className="flex-1 flex flex-col">
        <TabsList className="w-full h-9 bg-card px-4 pt-4">
          <TabsTrigger value="users" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="flex-1 p-4 space-y-6 overflow-auto m-0">
          {/* Estado de conexión */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{isConnected ? "Conectado al servidor" : "Desconectado"}</span>
          </div>

          {/* ID del proyecto */}
          <div className="space-y-2">
            <Label className="text-sm">ID del proyecto</Label>
            <div className="flex gap-2">
              <Input value={projectId} readOnly className="bg-secondary/30 text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowInviteDialog(true)}
                title="Invitar colaboradores"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Comparte este ID o usa el botón de invitación para que otros puedan unirse a tu proyecto.
            </p>
          </div>

          {/* Tu perfil */}
          <div className="space-y-2">
            <Label className="text-sm">Tu nombre de usuario</Label>
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="text-sm"
              />
              <Button variant="outline" onClick={saveUsername}>
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Este nombre se mostrará a otros usuarios cuando colabores.</p>
          </div>

          {/* Usuarios conectados */}
          <div className="space-y-3">
            <Label className="text-sm">Usuarios conectados ({connectedUsers.length})</Label>

            <div className="space-y-2">
              {/* Tu usuario */}
              <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/30">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: connectedUsers.find((u) => u.userId === userId)?.color || "#3b82f6" }}
                >
                  {username ? username.charAt(0).toUpperCase() : "Y"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{username || "Tú"}</div>
                  <div className="text-xs text-muted-foreground">{userId} (tú)</div>
                </div>
                <div className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">En línea</div>
              </div>

              {/* Otros usuarios */}
              {connectedUsers
                .filter((user) => user.userId !== userId)
                .map((user) => (
                  <div key={user.userId} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/20">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground truncate" title={user.userId}>
                        {user.userId.substring(0, 8)}...
                      </div>
                    </div>
                    <div className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">En línea</div>
                  </div>
                ))}

              {connectedUsers.length <= 1 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No hay otros usuarios conectados</p>
                  <p className="text-xs mt-1">Invita a otros para comenzar a colaborar</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar colaboradores
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4 space-y-6 overflow-auto m-0">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Actividad en tiempo real</h3>

            {/* Estado del servidor */}
            <ServerStatus />

            {/* Actividad reciente */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Actividad reciente</h4>
              <div className="border rounded-md p-4 bg-secondary/20">
                <RecentActivity />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de invitación */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar colaboradores</DialogTitle>
            <DialogDescription>
              Comparte este enlace con las personas que quieras invitar a colaborar en este proyecto.
              <strong className="block mt-2 text-primary">
                Importante: Ambos usuarios deben estar conectados para ver los cursores mutuamente.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="invite-link" className="sr-only">
                Enlace de invitación
              </Label>
              <Input id="invite-link" value={inviteLink} readOnly className="font-mono text-xs" />
            </div>
            <Button size="sm" className="px-3" onClick={copyInviteLink} variant="secondary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copiar</span>
            </Button>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Instrucciones para invitados:</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
              <li>Comparte este enlace con tus colaboradores</li>
              <li>Cuando abran el enlace, se unirán automáticamente a tu proyecto</li>
              <li>Podrán ver y editar los mismos componentes que tú en tiempo real</li>
              <li>Cada colaborador tendrá un color asignado para identificar sus acciones</li>
              <li className="text-primary font-medium">
                Asegúrate de que ambos usuarios estén conectados al mismo tiempo para ver los cursores mutuamente
              </li>
            </ol>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="default" onClick={() => setShowInviteDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RecentActivity() {
  const { lastMessage, connectedUsers } = useCollaboration()
  const [activities, setActivities] = useState<
    Array<{
      type: string
      userId: string
      timestamp: number
      message: string
    }>
  >([])

  // Actualizar actividades cuando llega un nuevo mensaje
  useEffect(() => {
    if (!lastMessage) return

    // Ignorar ciertos tipos de mensajes
    if (["CURSOR_POSITION", "BATCH_CURSOR_POSITIONS", "PING", "PONG"].includes(lastMessage.type)) {
      return
    }

    // Crear mensaje legible
    let message = ""
    const username = connectedUsers.find((u) => u.userId === lastMessage.userId)?.username || "Usuario"

    switch (lastMessage.type) {
      case "ADD_COMPONENT":
        message = `${username} añadió un componente ${lastMessage.payload?.type || ""}`
        break
      case "UPDATE_COMPONENT":
        message = `${username} actualizó un componente`
        break
      case "REMOVE_COMPONENT":
        message = `${username} eliminó un componente`
        break
      case "MOVE_COMPONENT":
        message = `${username} movió un componente`
        break
      case "ADD_PAGE":
        message = `${username} añadió una página: ${lastMessage.payload?.name || ""}`
        break
      case "REMOVE_PAGE":
        message = `${username} eliminó una página`
        break
      case "UPDATE_PAGE":
        message = `${username} actualizó una página`
        break
      case "USER_CONNECTED":
        message = `${username} se conectó`
        break
      case "USER_DISCONNECTED":
        message = `${username} se desconectó`
        break
      default:
        message = `${username} realizó una acción: ${lastMessage.type}`
    }

    // Añadir a la lista de actividades
    setActivities((prev) => [
      {
        type: lastMessage.type,
        userId: lastMessage.userId || "",
        timestamp: lastMessage.timestamp || Date.now(),
        message,
      },
      ...prev.slice(0, 19), // Mantener solo las 20 actividades más recientes
    ])
  }, [lastMessage, connectedUsers])

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No hay actividad reciente</p>
        <p className="text-xs mt-1">Las acciones de los colaboradores aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {activities.map((activity, index) => {
        const user = connectedUsers.find((u) => u.userId === activity.userId)
        return (
          <div key={index} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
              style={{ backgroundColor: user?.color || "#3b82f6" }}
            >
              {user?.username.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
