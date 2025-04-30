"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export default function ProjectIdHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un projectId en la URL
    const projectId = searchParams.get("projectId")

    if (projectId) {
      // Guardar el projectId en localStorage siempre que venga en la URL
      // Esto asegura que el usuario invitado use el mismo ID que el anfitrión
      localStorage.setItem("projectId", projectId)
      // Proyecto ID actualizado

      // Limpiar la URL para no mostrar el projectId
      const url = new URL(window.location.href)
      url.searchParams.delete("projectId")
      router.replace(url.pathname + url.search)
    } else {
      // Si no hay projectId en la URL, verificar si hay uno en localStorage
      const storedProjectId = localStorage.getItem("projectId")

      // Si no hay projectId en localStorage, generar uno nuevo
      if (!storedProjectId) {
        const newProjectId = uuidv4()
        localStorage.setItem("projectId", newProjectId)
        // Nuevo Proyecto ID generado
      }
    }
  }, [searchParams, router])

  return null
}
