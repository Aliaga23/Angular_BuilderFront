"use client"

import type React from "react"

import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"

// Lazy load components
export const LazyExportPanel = lazy(() => import("./export-panel"))
export const LazyPropertiesPanel = lazy(() => import("./properties-panel"))
export const LazyCollaborationPanel = lazy(() => import("./collaboration-panel"))

// Loading fallback
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
    </div>
  )
}

// Wrapper component with Suspense
export function LazyComponent({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}
