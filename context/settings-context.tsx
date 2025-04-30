"use client"

import { createContext, useContext, type ReactNode } from "react"

interface SettingsContextType {
  getPerformanceSettings: () => any
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const getPerformanceSettings = () => {
    if (typeof window === "undefined") return { lowPerformanceMode: false }

    try {
      const savedSettings = localStorage.getItem("performance_settings")
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    } catch (e) {
      console.error("Error loading performance settings:", e)
    }

    return { lowPerformanceMode: false }
  }

  return (
    <SettingsContext.Provider
      value={{
        getPerformanceSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
