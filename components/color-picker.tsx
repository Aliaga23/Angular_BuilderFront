"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value)
    onChange(e.target.value)
  }

  const presetColors = [
    "#ffffff",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#64748b",
    "#475569",
    "#334155",
    "#1e293b",
    "#0f172a",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    "#60a5fa",
    "#93c5fd",
    "#f43f5e",
    "#ec4899",
    "#8b5cf6",
    "#a855f7",
    "#22c55e",
    "#10b981",
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer">
          <span className="text-xs">{localColor}</span>
          <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: localColor }} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div>
            <Input type="color" value={localColor} onChange={handleColorChange} className="h-32 w-full p-1" />
          </div>
          <div className="flex flex-wrap gap-1">
            {presetColors.map((presetColor) => (
              <Button
                key={presetColor}
                type="button"
                variant="outline"
                className="h-6 w-6 p-0 rounded-sm"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  setLocalColor(presetColor)
                  onChange(presetColor)
                }}
              >
                {presetColor === localColor && <Check className="h-3 w-3 text-white" />}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={localColor} onChange={handleColorChange} className="flex-1 h-8 text-xs" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
