"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SaveNotification() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleSaveRequest = () => {
      setIsSaving(true)
    }

    const handleSaveComplete = (event: Event) => {
      setIsSaving(false)
      toast({
        title: "Proyecto guardado",
        description: "El proyecto ha sido guardado correctamente en la base de datos.",
        action: <CheckCircle className="h-4 w-4 text-green-500" />,
      })
    }

    const handleSaveError = (event: CustomEvent) => {
      setIsSaving(false)
      toast({
        title: "Error al guardar",
        description: event.detail?.message || "No se pudo guardar el proyecto. Inténtalo de nuevo.",
        variant: "destructive",
        action: <AlertCircle className="h-4 w-4" />,
      })
    }

    // Escuchar los eventos
    window.addEventListener("requestProjectSave", handleSaveRequest)
    window.addEventListener("projectSaved", handleSaveComplete)
    window.addEventListener("projectSaveError", handleSaveError as EventListener)

    // Limpiar los listeners al desmontar
    return () => {
      window.removeEventListener("requestProjectSave", handleSaveRequest)
      window.removeEventListener("projectSaved", handleSaveComplete)
      window.removeEventListener("projectSaveError", handleSaveError as EventListener)
    }
  }, [toast])

  return null
}
