"use client"

import { useComponentContext } from "@/context/component-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, PanelLeft, Palette, Type, Box, Layers } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useCollaboration } from "@/context/collaboration-context"
import { useEffect } from "react"

interface PropertiesPanelProps {
  componentId: string
  onClose: () => void
  isMobile?: boolean
}

export default function PropertiesPanel({ componentId, onClose, isMobile = false }: PropertiesPanelProps) {
  const { getComponent, updateComponent } = useComponentContext()
  const component = getComponent(componentId)
  const { connectedUsers, userId, setActiveComponent } = useCollaboration()

  // Encontrar usuarios que están editando este componente
  const editingUsers = componentId
    ? connectedUsers.filter((user) => user.userId !== userId && user.currentComponent === componentId)
    : []

  useEffect(() => {
    if (componentId) {
      setActiveComponent(componentId)
    } else {
      setActiveComponent(null)
    }
  }, [componentId, setActiveComponent])

  if (!component) return null

  const updateProp = (key: string, value: any) => {
    updateComponent(componentId, {
      ...component,
      props: {
        ...component.props,
        [key]: value,
      },
    })
  }

  const updateStyle = (key: string, value: any) => {
    updateComponent(componentId, {
      ...component,
      style: {
        ...component.style,
        [key]: value,
      },
    })
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1 rounded-full">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium text-sm uppercase tracking-wide truncate">
            {isMobile ? "Propiedades" : `Propiedades: ${component.type}`}
          </h3>
        </div>
        {editingUsers.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              {editingUsers.length === 1
                ? `${editingUsers[0].username} también está editando este componente`
                : `${editingUsers.length} usuarios también están editando este componente`}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="propiedades" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className={`w-full h-9 bg-card ${isMobile ? "px-1" : ""}`}>
          <TabsTrigger value="propiedades" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <PanelLeft className="h-4 w-4" />
            <span className={isMobile ? "hidden sm:inline" : ""}>Propiedades</span>
          </TabsTrigger>
          <TabsTrigger value="estilo" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span className={isMobile ? "hidden sm:inline" : ""}>Estilo</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto overflow-x-auto h-full">
          <TabsContent value="propiedades" className="p-2 sm:p-3 space-y-4 mt-0 min-w-[280px] pb-20">
            <ContentProperties component={component} updateProp={updateProp} />
          </TabsContent>

          <TabsContent value="estilo" className="p-2 sm:p-3 mt-0 min-w-[280px] pb-20">
            <StyleProperties component={component} updateStyle={updateStyle} updateProp={updateProp} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function ContentProperties({
  component,
  updateProp,
}: { component: any; updateProp: (key: string, value: any) => void }) {
  const updateComponentProps = (key: string, value: any) => {
    updateProp(key, value)
  }

  const renderBasicProperties = () => (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium">Nombre del Componente</label>
        <input
          type="text"
          value={component.props.name || ""}
          onChange={(e) => updateComponentProps("name", e.target.value)}
          className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
        />
      </div>
    </>
  )

  switch (component.type) {
    case "button":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-xs">
                    Texto del Botón
                  </Label>
                  <Input
                    id="text"
                    value={component.props.text || ""}
                    onChange={(e) => updateProp("text", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant" className="text-xs">
                    Variante
                  </Label>
                  <Select
                    value={component.props.variant || "default"}
                    onValueChange={(value) => updateProp("variant", value)}
                  >
                    <SelectTrigger id="variant" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar variante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="destructive">Destructive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-xs">
                    Tamaño
                  </Label>
                  <Select
                    value={component.props.size || "default"}
                    onValueChange={(value) => updateProp("size", value)}
                  >
                    <SelectTrigger id="size" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="icon">Icon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-xs">
                    Tema
                  </Label>
                  <Select
                    value={component.props.theme || "light"}
                    onValueChange={(value) => updateProp("theme", value)}
                  >
                    <SelectTrigger id="theme" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "text":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-xs">
                    Contenido de Texto
                  </Label>
                  <textarea
                    id="text"
                    value={component.props.text || ""}
                    onChange={(e) => updateProp("text", e.target.value)}
                    className="w-full h-24 px-2 py-2 text-sm rounded-md border border-border bg-background"
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "heading":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-xs">
                    Texto del Encabezado
                  </Label>
                  <Input
                    id="text"
                    value={component.props.text || ""}
                    onChange={(e) => updateProp("text", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-xs">
                    Nivel
                  </Label>
                  <Select value={component.props.level || "h1"} onValueChange={(value) => updateProp("level", value)}>
                    <SelectTrigger id="level" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">H1</SelectItem>
                      <SelectItem value="h2">H2</SelectItem>
                      <SelectItem value="h3">H3</SelectItem>
                      <SelectItem value="h4">H4</SelectItem>
                      <SelectItem value="h5">H5</SelectItem>
                      <SelectItem value="h6">H6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "image":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="src" className="text-xs">
                    URL de la Imagen
                  </Label>
                  <Input
                    id="src"
                    value={component.props.src || ""}
                    onChange={(e) => updateProp("src", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt" className="text-xs">
                    Texto Alternativo
                  </Label>
                  <Input
                    id="alt"
                    value={component.props.alt || ""}
                    onChange={(e) => updateProp("alt", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-xs">
                      Ancho (px)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={component.props.width || 300}
                      onChange={(e) => updateProp("width", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-xs">
                      Alto (px)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={component.props.height || 200}
                      onChange={(e) => updateProp("height", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "link":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs">
                    Texto del Enlace
                  </Label>
                  <Input
                    id="label"
                    value={component.props.label || ""}
                    onChange={(e) => updateProp("label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="href" className="text-xs">
                    URL
                  </Label>
                  <Input
                    id="href"
                    value={component.props.href || ""}
                    onChange={(e) => updateProp("href", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="openInNewTab" className="text-xs">
                    Abrir en Nueva Pestaña
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="openInNewTab"
                      type="checkbox"
                      checked={component.props.target === "_blank"}
                      onChange={(e) => updateProp("target", e.target.checked ? "_blank" : "")}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "input":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs">
                    Etiqueta
                  </Label>
                  <Input
                    id="label"
                    value={component.props.label || ""}
                    onChange={(e) => updateProp("label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder" className="text-xs">
                    Placeholder
                  </Label>
                  <Input
                    id="placeholder"
                    value={component.props.placeholder || ""}
                    onChange={(e) => updateProp("placeholder", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs">
                    Tipo
                  </Label>
                  <Select value={component.props.type || "text"} onValueChange={(value) => updateProp("type", value)}>
                    <SelectTrigger id="type" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="password">Contraseña</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="tel">Teléfono</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="required" className="text-xs">
                    Requerido
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="required"
                      type="checkbox"
                      checked={component.props.required || false}
                      onChange={(e) => updateProp("required", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "textarea":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs">
                    Etiqueta
                  </Label>
                  <Input
                    id="label"
                    value={component.props.label || ""}
                    onChange={(e) => updateProp("label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder" className="text-xs">
                    Placeholder
                  </Label>
                  <Input
                    id="placeholder"
                    value={component.props.placeholder || ""}
                    onChange={(e) => updateProp("placeholder", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rows" className="text-xs">
                    Filas
                  </Label>
                  <Input
                    id="rows"
                    type="number"
                    value={component.props.rows || 4}
                    onChange={(e) => updateProp("rows", Number.parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="required" className="text-xs">
                    Requerido
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="required"
                      type="checkbox"
                      checked={component.props.required || false}
                      onChange={(e) => updateProp("required", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "container":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-xs">
                      Ancho (px)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={component.props.width || 300}
                      onChange={(e) => updateProp("width", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-xs">
                      Alto (px)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={component.props.height || 200}
                      onChange={(e) => updateProp("height", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "list":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs">
                    Tipo de Lista
                  </Label>
                  <Select value={component.props.type || "ul"} onValueChange={(value) => updateProp("type", value)}>
                    <SelectTrigger id="type" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ul">Lista no ordenada</SelectItem>
                      <SelectItem value="ol">Lista ordenada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Elementos</label>
                    <button
                      onClick={() => {
                        const items = [...(component.props.items || []), `Nuevo elemento ${Date.now()}`]
                        updateProp("items", items)
                      }}
                      className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                    >
                      + Añadir
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.isArray(component.props.items) &&
                      component.props.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const items = [...component.props.items]
                              items[index] = e.target.value
                              updateProp("items", items)
                            }}
                            className="flex-1 h-7 px-2 text-xs rounded-md border border-border bg-background"
                            placeholder="Elemento"
                          />
                          <button
                            onClick={() => {
                              const items = [...component.props.items]
                              items.splice(index, 1)
                              updateProp("items", items)
                            }}
                            className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded-md"
                          >
                            X
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "card":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={component.props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-xs">
                    Contenido
                  </Label>
                  <textarea
                    id="content"
                    value={component.props.content || ""}
                    onChange={(e) => updateProp("content", e.target.value)}
                    className="w-full h-24 px-2 py-2 text-sm rounded-md border border-border bg-background"
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "slider":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="min" className="text-xs">
                      Valor Mínimo
                    </Label>
                    <Input
                      id="min"
                      type="number"
                      value={component.props.min || 0}
                      onChange={(e) => updateProp("min", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max" className="text-xs">
                      Valor Máximo
                    </Label>
                    <Input
                      id="max"
                      type="number"
                      value={component.props.max || 100}
                      onChange={(e) => updateProp("max", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-xs">
                    Valor Actual
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={component.props.value || 50}
                    onChange={(e) => updateProp("value", Number.parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step" className="text-xs">
                    Paso
                  </Label>
                  <Input
                    id="step"
                    type="number"
                    value={component.props.step || 1}
                    onChange={(e) => updateProp("step", Number.parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "grid":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="columns" className="text-xs">
                    Columnas
                  </Label>
                  <Input
                    id="columns"
                    type="number"
                    value={component.props.columns || 2}
                    onChange={(e) => updateProp("columns", Number.parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gap" className="text-xs">
                    Espacio entre elementos (px)
                  </Label>
                  <Input
                    id="gap"
                    type="number"
                    value={component.props.gap || 16}
                    onChange={(e) => updateProp("gap", Number.parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "navbar":
      return (
        <Accordion type="multiple" defaultValue={["general", "layout", "logo", "links"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={component.props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="layout" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Box className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Layout</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-xs">
                    Posición
                  </Label>
                  <Select
                    value={component.props.position || "static"}
                    onValueChange={(value) => updateProp("position", value)}
                  >
                    <SelectTrigger id="position" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar posición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Normal</SelectItem>
                      <SelectItem value="fixed">Fija</SelectItem>
                      <SelectItem value="sticky">Pegajosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="shadow" className="text-xs">
                    Sombra
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="shadow"
                      type="checkbox"
                      checked={component.props.shadow !== false}
                      onChange={(e) => updateProp("shadow", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="logo" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Logo</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo" className="text-xs">
                    Mostrar Logo
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="showLogo"
                      type="checkbox"
                      checked={component.props.showLogo !== false}
                      onChange={(e) => updateProp("showLogo", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                {component.props.showLogo !== false && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="logoSrc" className="text-xs">
                        URL del Logo
                      </Label>
                      <Input
                        id="logoSrc"
                        value={component.props.logoSrc || ""}
                        onChange={(e) => updateProp("logoSrc", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoAlt" className="text-xs">
                        Texto Alternativo
                      </Label>
                      <Input
                        id="logoAlt"
                        value={component.props.logoAlt || ""}
                        onChange={(e) => updateProp("logoAlt", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="logoWidth" className="text-xs">
                          Ancho (px)
                        </Label>
                        <Input
                          id="logoWidth"
                          type="number"
                          value={component.props.logoWidth || 40}
                          onChange={(e) => updateProp("logoWidth", Number.parseInt(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoHeight" className="text-xs">
                          Alto (px)
                        </Label>
                        <Input
                          id="logoHeight"
                          type="number"
                          value={component.props.logoHeight || 40}
                          onChange={(e) => updateProp("logoHeight", Number.parseInt(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="links" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Enlaces</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                {(component.props.links || []).map((link: any, index: number) => (
                  <div key={index} className="space-y-2 border border-border p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Enlace {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => {
                          const newLinks = [...(component.props.links || [])]
                          newLinks.splice(index, 1)
                          updateProp("links", newLinks)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`link-label-${index}`} className="text-xs">
                          Etiqueta
                        </Label>
                        <Input
                          id={`link-label-${index}`}
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...(component.props.links || [])]
                            newLinks[index] = { ...link, label: e.target.value }
                            updateProp("links", newLinks)
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`link-href-${index}`} className="text-xs">
                          URL
                        </Label>
                        <Input
                          id={`link-href-${index}`}
                          value={link.href}
                          onChange={(e) => {
                            const newLinks = [...(component.props.links || [])]
                            newLinks[index] = { ...link, href: e.target.value }
                            updateProp("links", newLinks)
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const newLinks = [...(component.props.links || []), { label: "Nuevo enlace", href: "#" }]
                    updateProp("links", newLinks)
                  }}
                >
                  Añadir enlace
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "sidebar":
      return (
        <Accordion type="multiple" defaultValue={["general", "items"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="items" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Elementos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                {(component.props.items || []).map((item: any, index: number) => (
                  <div key={index} className="space-y-2 border border-border p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Elemento {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => {
                          const newItems = [...(component.props.items || [])]
                          newItems.splice(index, 1)
                          updateProp("items", newItems)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`item-label-${index}`} className="text-xs">
                          Etiqueta
                        </Label>
                        <Input
                          id={`item-label-${index}`}
                          value={item.label}
                          onChange={(e) => {
                            const newItems = [...(component.props.items || [])]
                            newItems[index] = { ...item, label: e.target.value }
                            updateProp("items", newItems)
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`item-icon-${index}`} className="text-xs">
                          Icono
                        </Label>
                        <Input
                          id={`item-icon-${index}`}
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...(component.props.items || [])]
                            newItems[index] = { ...item, icon: e.target.value }
                            updateProp("items", newItems)
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const newItems = [...(component.props.items || []), { label: "Nuevo elemento", icon: "settings" }]
                    updateProp("items", newItems)
                  }}
                >
                  Añadir elemento
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "select":
      return (
        <>
          {renderBasicProperties()}
          <div className="space-y-4 mt-4">
            <h3 className="font-medium text-sm">Propiedades del Select</h3>

            <div className="space-y-2">
              <label className="text-xs font-medium">Placeholder</label>
              <input
                type="text"
                value={component.props.placeholder || ""}
                onChange={(e) => updateComponentProps("placeholder", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Valor por defecto</label>
              <input
                type="text"
                value={component.props.defaultValue || ""}
                onChange={(e) => updateComponentProps("defaultValue", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-multiple"
                checked={component.props.multiple || false}
                onChange={(e) => updateComponentProps("multiple", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="select-multiple" className="text-xs">
                Selección múltiple
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-required"
                checked={component.props.required || false}
                onChange={(e) => updateComponentProps("required", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="select-required" className="text-xs">
                Requerido
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-disabled"
                checked={component.props.disabled || false}
                onChange={(e) => updateComponentProps("disabled", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="select-disabled" className="text-xs">
                Deshabilitado
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Tamaño</label>
              <select
                value={component.props.size || "default"}
                onChange={(e) => updateComponentProps("size", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              >
                <option value="default">Default</option>
                <option value="sm">Pequeño</option>
                <option value="lg">Grande</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Opciones</label>
                <button
                  onClick={() => {
                    const options = [
                      ...(component.props.options || []),
                      { value: `option-${Date.now()}`, label: "Nueva opción" },
                    ]
                    updateComponentProps("options", options)
                  }}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                >
                  + Añadir
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Array.isArray(component.props.options) &&
                  component.props.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const options = [...component.props.options]
                          options[index].label = e.target.value
                          updateComponentProps("options", options)
                        }}
                        className="flex-1 h-7 px-2 text-xs rounded-md border border-border bg-background"
                        placeholder="Etiqueta"
                      />
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => {
                          const options = [...component.props.options]
                          options[index].value = e.target.value
                          updateComponentProps("options", options)
                        }}
                        className="flex-1 h-7 px-2 text-xs rounded-md border border-border bg-background"
                        placeholder="Valor"
                      />
                      <button
                        onClick={() => {
                          const options = [...component.props.options]
                          options.splice(index, 1)
                          updateComponentProps("options", options)
                        }}
                        className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded-md"
                      >
                        X
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )

    case "checklist":
      return (
        <>
          {renderBasicProperties()}
          <div className="space-y-4 mt-4">
            <h3 className="font-medium text-sm">Propiedades de la Lista de Verificación</h3>

            <div className="space-y-2">
              <label className="text-xs font-medium">Etiqueta</label>
              <input
                type="text"
                value={component.props.label || ""}
                onChange={(e) => updateComponentProps("label", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Nombre</label>
              <input
                type="text"
                value={component.props.name || ""}
                onChange={(e) => updateComponentProps("name", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Orientación</label>
              <select
                value={component.props.orientation || "vertical"}
                onChange={(e) => updateComponentProps("orientation", e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="checklist-required"
                checked={component.props.required || false}
                onChange={(e) => updateComponentProps("required", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="checklist-required" className="text-xs">
                Requerido
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="checklist-disabled"
                checked={component.props.disabled || false}
                onChange={(e) => updateComponentProps("disabled", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="checklist-disabled" className="text-xs">
                Deshabilitado
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Elementos</label>
                <button
                  onClick={() => {
                    const items = [
                      ...(component.props.items || []),
                      { id: `item-${Date.now()}`, label: "Nuevo elemento", checked: false },
                    ]
                    updateComponentProps("items", items)
                  }}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                >
                  + Añadir
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Array.isArray(component.props.items) &&
                  component.props.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const items = [...component.props.items]
                          items[index].label = e.target.value
                          updateComponentProps("items", items)
                        }}
                        className="flex-1 h-7 px-2 text-xs rounded-md border border-border bg-background"
                        placeholder="Etiqueta"
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.checked || false}
                          onChange={(e) => {
                            const items = [...component.props.items]
                            items[index].checked = e.target.checked
                            updateComponentProps("items", items)
                          }}
                          className="h-4 w-4 mr-1"
                        />
                        <span className="text-xs">Marcado</span>
                      </div>
                      <button
                        onClick={() => {
                          const items = [...component.props.items]
                          items.splice(index, 1)
                          updateComponentProps("items", items)
                        }}
                        className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded-md"
                      >
                        X
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )

    case "checkbox":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs">
                    Etiqueta
                  </Label>
                  <Input
                    id="label"
                    value={component.props.label || ""}
                    onChange={(e) => updateProp("label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="checked" className="text-xs">
                    Marcado por defecto
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="checked"
                      type="checkbox"
                      checked={component.props.checked || false}
                      onChange={(e) => updateProp("checked", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="required" className="text-xs">
                    Requerido
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="required"
                      type="checkbox"
                      checked={component.props.required || false}
                      onChange={(e) => updateProp("required", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="disabled" className="text-xs">
                    Deshabilitado
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="disabled"
                      type="checkbox"
                      checked={component.props.disabled || false}
                      onChange={(e) => updateProp("disabled", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "datepicker":
      return (
        <Accordion type="multiple" defaultValue={["general"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs">
                    Etiqueta
                  </Label>
                  <Input
                    id="label"
                    value={component.props.label || ""}
                    onChange={(e) => updateProp("label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder" className="text-xs">
                    Placeholder
                  </Label>
                  <Input
                    id="placeholder"
                    value={component.props.placeholder || "Seleccionar fecha..."}
                    onChange={(e) => updateProp("placeholder", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="text-xs">
                    Formato de Fecha
                  </Label>
                  <Select
                    value={component.props.dateFormat || "dd/MM/yyyy"}
                    onValueChange={(value) => updateProp("dateFormat", value)}
                  >
                    <SelectTrigger id="dateFormat" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                      <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                      <SelectItem value="dd.MM.yyyy">DD.MM.AAAA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="required" className="text-xs">
                    Requerido
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="required"
                      type="checkbox"
                      checked={component.props.required || false}
                      onChange={(e) => updateProp("required", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="disabled" className="text-xs">
                    Deshabilitado
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="disabled"
                      type="checkbox"
                      checked={component.props.disabled || false}
                      onChange={(e) => updateProp("disabled", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minDate" className="text-xs">
                    Fecha Mínima (AAAA-MM-DD)
                  </Label>
                  <Input
                    id="minDate"
                    value={component.props.minDate || ""}
                    onChange={(e) => updateProp("minDate", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Ej: 2023-01-01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDate" className="text-xs">
                    Fecha Máxima (AAAA-MM-DD)
                  </Label>
                  <Input
                    id="maxDate"
                    value={component.props.maxDate || ""}
                    onChange={(e) => updateProp("maxDate", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Ej: 2023-12-31"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "table":
      return (
        <Accordion type="multiple" defaultValue={["general", "columns", "data"]}>
          <AccordionItem value="general" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">General</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre del Componente
                  </Label>
                  <Input
                    id="name"
                    value={component.props.name || ""}
                    onChange={(e) => updateProp("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-xs">
                    Título de la Tabla
                  </Label>
                  <Input
                    id="caption"
                    value={component.props.caption || ""}
                    onChange={(e) => updateProp("caption", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="striped" className="text-xs">
                    Filas Alternadas
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="striped"
                      type="checkbox"
                      checked={component.props.striped || false}
                      onChange={(e) => updateProp("striped", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bordered" className="text-xs">
                    Bordes
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="bordered"
                      type="checkbox"
                      checked={component.props.bordered || false}
                      onChange={(e) => updateProp("bordered", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hoverable" className="text-xs">
                    Efecto Hover
                  </Label>
                  <div className="flex h-4 items-center">
                    <input
                      id="hoverable"
                      type="checkbox"
                      checked={component.props.hoverable || false}
                      onChange={(e) => updateProp("hoverable", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="columns" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Columnas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Columnas</label>
                  <button
                    onClick={() => {
                      const columns = [
                        ...(component.props.columns || []),
                        { id: `col-${Date.now()}`, header: "Nueva Columna", accessor: `field${Date.now()}` },
                      ]
                      updateProp("columns", columns)
                    }}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                  >
                    + Añadir
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Array.isArray(component.props.columns) &&
                    component.props.columns.map((column, index) => (
                      <div key={index} className="space-y-2 border border-border p-2 rounded-md">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs">Columna {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => {
                              const columns = [...component.props.columns]
                              columns.splice(index, 1)
                              updateProp("columns", columns)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`column-header-${index}`} className="text-xs">
                              Encabezado
                            </Label>
                            <Input
                              id={`column-header-${index}`}
                              value={column.header}
                              onChange={(e) => {
                                const columns = [...component.props.columns]
                                columns[index] = { ...column, header: e.target.value }
                                updateProp("columns", columns)
                              }}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`column-accessor-${index}`} className="text-xs">
                              Campo
                            </Label>
                            <Input
                              id={`column-accessor-${index}`}
                              value={column.accessor}
                              onChange={(e) => {
                                const columns = [...component.props.columns]
                                columns[index] = { ...column, accessor: e.target.value }
                                updateProp("columns", columns)
                              }}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Datos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Filas</label>
                  <button
                    onClick={() => {
                      const newRow = {}
                      if (Array.isArray(component.props.columns)) {
                        component.props.columns.forEach((col) => {
                          newRow[col.accessor] = `Valor ${Date.now()}`
                        })
                      }
                      const data = [...(component.props.data || []), newRow]
                      updateProp("data", data)
                    }}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                  >
                    + Añadir Fila
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.isArray(component.props.data) &&
                    component.props.data.map((row, rowIndex) => (
                      <div key={rowIndex} className="space-y-2 border border-border p-2 rounded-md">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs">Fila {rowIndex + 1}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => {
                              const data = [...component.props.data]
                              data.splice(rowIndex, 1)
                              updateProp("data", data)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {Array.isArray(component.props.columns) &&
                            component.props.columns.map((column, colIndex) => (
                              <div key={colIndex} className="space-y-1">
                                <Label htmlFor={`row-${rowIndex}-col-${colIndex}`} className="text-xs">
                                  {column.header}
                                </Label>
                                <Input
                                  id={`row-${rowIndex}-col-${colIndex}`}
                                  value={row[column.accessor] || ""}
                                  onChange={(e) => {
                                    const data = [...component.props.data]
                                    data[rowIndex] = { ...data[rowIndex], [column.accessor]: e.target.value }
                                    updateProp("data", data)
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    // Resto de casos para otros componentes...
    default:
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-sm">Selecciona un componente para editar sus propiedades</p>
        </div>
      )
  }
}

function StyleProperties({
  component,
  updateStyle,
  updateProp,
}: {
  component: any
  updateStyle: (key: string, value: any) => void
  updateProp: (key: string, value: any) => void
}) {
  return (
    <Accordion type="multiple" defaultValue={["dimensions", "typography", "background"]}>
      <AccordionItem value="dimensions" className="border border-border rounded-md mb-2">
        <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
          <div className="flex items-center">
            <Box className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Dimensiones</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2 px-3 pb-5">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Ancho (px)</Label>
                <Input
                  type="number"
                  value={
                    component.props.width || (component.style.width ? Number.parseInt(component.style.width) : 300)
                  }
                  onChange={(e) => {
                    const width = Number.parseInt(e.target.value)
                    updateProp("width", width)
                    // También actualizar el estilo para la vista previa
                    updateStyle("width", `${width}px`)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Alto (px)</Label>
                <Input
                  type="number"
                  value={
                    component.props.height || (component.style.height ? Number.parseInt(component.style.height) : 200)
                  }
                  onChange={(e) => {
                    const height = Number.parseInt(e.target.value)
                    updateProp("height", height)
                    // También actualizar el estilo para la vista previa
                    updateStyle("height", `${height}px`)
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="typography" className="border border-border rounded-md mb-2">
        <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
          <div className="flex items-center">
            <Type className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Tipografía</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2 px-3 pb-5">
            <div className="space-y-2">
              <Label className="text-xs">Color de Texto</Label>
              <ColorPicker
                color={component.style.color || "#ffffff"}
                onChange={(color) => updateStyle("color", color)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tamaño de Fuente (px)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[Number.parseInt(component.style.fontSize) || 16]}
                  min={8}
                  max={72}
                  step={1}
                  onValueChange={(value) => updateStyle("fontSize", `${value[0]}px`)}
                  className="flex-1"
                />
                <span className="w-12 text-center bg-secondary p-1 rounded-md text-sm">
                  {Number.parseInt(component.style.fontSize) || 16}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Peso de Fuente</Label>
              <Select
                value={component.style.fontWeight || "normal"}
                onValueChange={(value) => updateStyle("fontWeight", value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar peso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Lighter</SelectItem>
                  <SelectItem value="bolder">Bolder</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="300">300</SelectItem>
                  <SelectItem value="400">400</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="600">600</SelectItem>
                  <SelectItem value="700">700</SelectItem>
                  <SelectItem value="800">800</SelectItem>
                  <SelectItem value="900">900</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alineación de Texto</Label>
              <Select
                value={component.style.textAlign || "left"}
                onValueChange={(value) => updateStyle("textAlign", value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar alineación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                  <SelectItem value="justify">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="background" className="border border-border rounded-md mb-2">
        <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
          <div className="flex items-center">
            <Palette className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Fondo</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2 px-3 pb-5">
            <div className="space-y-2">
              <Label className="text-xs">Color de Fondo</Label>
              <ColorPicker
                color={component.style.backgroundColor || "transparent"}
                onChange={(color) => updateStyle("backgroundColor", color)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Opacidad</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[Number.parseFloat(component.style.opacity) || 1]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => updateStyle("opacity", value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center bg-secondary p-1 rounded-md text-sm">
                  {Math.round((Number.parseFloat(component.style.opacity) || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
