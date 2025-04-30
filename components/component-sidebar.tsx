"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { componentLibrary } from "@/lib/component-library"

export default function ComponentSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryTab, setCategoryTab] = useState("todos")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const filteredComponents = Object.entries(componentLibrary).reduce(
    (acc, [category, components]) => {
      // Si la categoría seleccionada es "todos", incluir todas las categorías
      // Si no, solo incluir la categoría seleccionada
      if (categoryTab !== "todos" && category !== categoryTab) {
        return acc
      }

      // Filtrar por búsqueda
      const filtered = components.filter((component) =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (filtered.length > 0) {
        acc[category] = filtered
      }

      return acc
    },
    {} as Record<string, (typeof componentLibrary)[keyof typeof componentLibrary]>,
  )

  return (
    <div className="w-full flex flex-col bg-card">
      <div className="p-3 border-b border-border">
        <h2 className="font-medium mb-3 text-sm uppercase tracking-wide">Componentes</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar componentes..."
            className="pl-8 bg-background h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border-b border-border"></div>

      <div className="flex flex-wrap border-b border-border overflow-x-auto">
        <Tabs value={categoryTab} onValueChange={setCategoryTab} className="w-full">
          <TabsList className="w-full bg-card grid grid-cols-2 gap-1 p-1 h-auto">
            <TabsTrigger value="todos" className="text-xs h-9 rounded-none">
              Todos
            </TabsTrigger>
            <TabsTrigger value="basic" className="text-xs h-9 rounded-none">
              Básicos
            </TabsTrigger>
            <TabsTrigger value="form" className="text-xs h-9 rounded-none">
              Formulario
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs h-9 rounded-none">
              Layout
            </TabsTrigger>
            <TabsTrigger value="nav" className="text-xs h-9 rounded-none">
              Navegación
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1">
        <div className="p-2 text-xs text-muted-foreground">
          {Object.keys(filteredComponents).length > 0
            ? "Arrastra componentes al lienzo o haz clic para añadir"
            : "No se encontraron componentes"}
        </div>
        <div className="grid grid-cols-1 gap-2 p-2">
          {Object.entries(filteredComponents).map(([category, components]) => (
            <div key={category} className="space-y-2 mb-4">
              <div
                className="text-xs font-medium text-muted-foreground px-1 py-1 mt-2 first:mt-0 flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                {expandedCategories[category] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>

              {/* Componentes en una columna con tamaño original */}
              <div className={`grid grid-cols-1 gap-2 ${expandedCategories[category] === false ? "hidden" : ""}`}>
                {components.map((component) => (
                  <DraggableComponent key={component.type} component={component} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DraggableComponent({ component }: { component: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { ...component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`p-2.5 border border-border rounded-md bg-background hover:border-primary transition-colors ${
        isDragging ? "opacity-50" : ""
      } cursor-grab active:cursor-grabbing touch-manipulation`}
    >
      <div className="flex items-center gap-2">
        {component.icon && <component.icon className="h-4 w-4 text-primary flex-shrink-0" />}
        <span className="font-medium text-sm truncate">{component.name}</span>
      </div>
    </div>
  )
}
