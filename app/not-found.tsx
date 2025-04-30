"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redireccionar a la página principal después de un breve retraso
    const redirectTimer = setTimeout(() => {
      router.push("/")
    }, 100)

    return () => clearTimeout(redirectTimer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Redireccionando...</h1>
        <p className="text-gray-600">Te estamos llevando a la página principal</p>
      </div>
    </div>
  )
}
