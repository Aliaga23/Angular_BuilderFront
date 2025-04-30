"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface UserCursorProps {
  position: { x: number; y: number }
  username: string
  color: string
  zoom: number
}

// Aumentar el tamaño y mejorar la visibilidad del cursor
export default function UserCursor({ position, username, color, zoom }: UserCursorProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Aumentar el tiempo de visibilidad del cursor a 30 segundos
  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 30000) // Aumentado de 10000 a 30000 ms

    return () => clearTimeout(timer)
  }, [position])

  if (!isVisible) return null

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        left: position.x / (zoom / 100),
        top: position.y / (zoom / 100),
        zIndex: 9999,
      }}
    >
      {/* Cursor con animación de pulso más visible */}
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sombra para mejor visibilidad */}
          <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="black" opacity="0.5" transform="translate(1, 1)" />
          {/* Cursor principal con borde más grueso */}
          <path d="M5 3L19 12L12 13L9 20L5 3Z" fill={color} stroke="white" strokeWidth="2" className="animate-pulse" />
        </svg>

        {/* Nombre de usuario con mejor visibilidad */}
        <div
          className="absolute left-6 top-0 px-3 py-1.5 rounded text-sm text-white whitespace-nowrap shadow-lg"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 15px rgba(0,0,0,0.5)`,
            border: "2px solid white",
          }}
        >
          {username}
        </div>
      </div>
    </motion.div>
  )
}
