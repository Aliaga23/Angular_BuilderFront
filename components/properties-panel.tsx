"use client"

import { Textarea } from "@/components/ui/textarea"

import { useComponentContext } from "@/context/component-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Sliders, PanelLeft, Code, Palette, Type, Box, Layers, MousePointer } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
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
          <TabsTrigger value="eventos" className="flex-1 text-xs h-9 rounded-none flex items-center gap-1">
            <MousePointer className="h-4 w-4" />
            <span className={isMobile ? "hidden sm:inline" : ""}>Eventos</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto overflow-x-auto h-full">
          <TabsContent value="propiedades" className="p-2 sm:p-3 space-y-4 mt-0 min-w-[280px] pb-20">
            <ContentProperties component={component} updateProp={updateProp} />
          </TabsContent>

          <TabsContent value="estilo" className="p-2 sm:p-3 mt-0 min-w-[280px] pb-20">
            <StyleProperties component={component} updateStyle={updateStyle} updateProp={updateProp} />
          </TabsContent>

          <TabsContent value="eventos" className="p-2 sm:p-3 space-y-4 mt-0 min-w-[280px] pb-20">
            <EventProperties component={component} updateProp={updateProp} />
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
  switch (component.type) {
    case "button":
      return (
        <Accordion type="multiple" defaultValue={["general", "advanced"]}>
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
          <AccordionItem value="advanced" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Avanzado</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="disabled" className="text-xs">
                    Deshabilitado
                  </Label>
                  <Switch
                    id="disabled"
                    checked={component.props.disabled || false}
                    onCheckedChange={(checked) => updateProp("disabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-xs">
                    ID
                  </Label>
                  <Input
                    id="id"
                    value={component.props.id || ""}
                    onChange={(e) => updateProp("id", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Nombre
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
        </Accordion>
      )

    case "text":
      return (
        <Accordion type="multiple" defaultValue={["content"]}>
          <AccordionItem value="content" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Contenido</span>
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
                    Texto
                  </Label>
                  <Input
                    id="text"
                    value={component.props.text || ""}
                    onChange={(e) => updateProp("text", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="as" className="text-xs">
                    Elemento HTML
                  </Label>
                  <Select value={component.props.as || "p"} onValueChange={(value) => updateProp("as", value)}>
                    <SelectTrigger id="as" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar elemento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p">Párrafo (p)</SelectItem>
                      <SelectItem value="span">Span</SelectItem>
                      <SelectItem value="div">Div</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="em">Emphasis (em)</SelectItem>
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

    case "heading":
      return (
        <Accordion type="multiple" defaultValue={["content"]}>
          <AccordionItem value="content" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Contenido</span>
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
                    Nivel del Encabezado
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

    case "input":
      return (
        <Accordion type="multiple" defaultValue={["general", "validation"]}>
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
                    Tipo de Input
                  </Label>
                  <Select value={component.props.type || "text"} onValueChange={(value) => updateProp("type", value)}>
                    <SelectTrigger id="type" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="password">Contraseña</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="tel">Teléfono</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="time">Hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultValue" className="text-xs">
                    Valor por defecto
                  </Label>
                  <Input
                    id="defaultValue"
                    value={component.props.defaultValue || ""}
                    onChange={(e) => updateProp("defaultValue", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-xs">
                    Tamaño
                  </Label>
                  <Select value={component.props.size || "md"} onValueChange={(value) => updateProp("size", value)}>
                    <SelectTrigger id="size" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
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
          <AccordionItem value="validation" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Validación</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="required" className="text-xs">
                    Requerido
                  </Label>
                  <Switch
                    id="required"
                    checked={component.props.required || false}
                    onCheckedChange={(checked) => updateProp("required", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="disabled" className="text-xs">
                    Deshabilitado
                  </Label>
                  <Switch
                    id="disabled"
                    checked={component.props.disabled || false}
                    onCheckedChange={(checked) => updateProp("disabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLength" className="text-xs">
                    Longitud mínima
                  </Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={component.props.minLength || ""}
                    onChange={(e) => updateProp("minLength", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength" className="text-xs">
                    Longitud máxima
                  </Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={component.props.maxLength || ""}
                    onChange={(e) => updateProp("maxLength", e.target.value)}
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
        <Accordion type="multiple" defaultValue={["general", "links"]}>
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
                      <SelectItem value="transparent">Transparente</SelectItem>
                      <SelectItem value="sticky">Fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="align" className="text-xs">
                    Alineación
                  </Label>
                  <Select
                    value={component.props.align || "space-between"}
                    onValueChange={(value) => updateProp("align", value)}
                  >
                    <SelectTrigger id="align" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar alineación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Derecha</SelectItem>
                      <SelectItem value="space-between">Espacio entre</SelectItem>
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-xs">
                      Ancho (px)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={component.props.width || 1200}
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
                      value={component.props.height || 60}
                      onChange={(e) => updateProp("height", Number.parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo" className="text-xs">
                    Mostrar logo
                  </Label>
                  <Switch
                    id="showLogo"
                    checked={component.props.showLogo !== false}
                    onCheckedChange={(checked) => updateProp("showLogo", checked)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="links" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Sliders className="h-4 w-4 mr-2 text-primary" />
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

    case "container":
      return (
        <Accordion type="multiple" defaultValue={["dimensions", "layout"]}>
          <AccordionItem value="dimensions" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Box className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Dimensiones</span>
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
          <AccordionItem value="layout" className="border border-border rounded-md mb-2">
            <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
              <div className="flex items-center">
                <Sliders className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Layout</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="align" className="text-xs">
                    Alineación
                  </Label>
                  <Select value={component.props.align || "left"} onValueChange={(value) => updateProp("align", value)}>
                    <SelectTrigger id="align" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar alineación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Derecha</SelectItem>
                      <SelectItem value="space-between">Espacio entre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direction" className="text-xs">
                    Dirección
                  </Label>
                  <Select
                    value={component.props.direction || "row"}
                    onValueChange={(value) => updateProp("direction", value)}
                  >
                    <SelectTrigger id="direction" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar dirección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row">Horizontal</SelectItem>
                      <SelectItem value="column">Vertical</SelectItem>
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
    <Accordion type="multiple" defaultValue={["dimensions", "typography", "spacing", "background", "border"]}>
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

      <AccordionItem value="spacing" className="border border-border rounded-md mb-2">
        <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
          <div className="flex items-center">
            <Sliders className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Espaciado</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2 px-3 pb-5">
            <div className="space-y-2">
              <Label className="text-xs">Padding (px)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Superior</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.paddingTop) || 0}
                    onChange={(e) => updateStyle("paddingTop", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Derecha</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.paddingRight) || 0}
                    onChange={(e) => updateStyle("paddingRight", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Inferior</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.paddingBottom) || 0}
                    onChange={(e) => updateStyle("paddingBottom", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Izquierda</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.paddingLeft) || 0}
                    onChange={(e) => updateStyle("paddingLeft", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Margen (px)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Superior</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.marginTop) || 0}
                    onChange={(e) => updateStyle("marginTop", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Derecha</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.marginRight) || 0}
                    onChange={(e) => updateStyle("marginRight", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Inferior</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.marginBottom) || 0}
                    onChange={(e) => updateStyle("marginBottom", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Izquierda</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.marginLeft) || 0}
                    onChange={(e) => updateStyle("marginLeft", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
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

      <AccordionItem value="border" className="border border-border rounded-md mb-2">
        <AccordionTrigger className="px-3 py-2 hover:bg-primary/5">
          <div className="flex items-center">
            <Box className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Borde</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2 px-3 pb-5">
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Ancho (px)</Label>
                  <Input
                    type="number"
                    value={Number.parseInt(component.style.borderWidth) || 0}
                    onChange={(e) => updateStyle("borderWidth", `${e.target.value}px`)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Estilo</Label>
                  <Select
                    value={component.style.borderStyle || "solid"}
                    onValueChange={(value) => updateStyle("borderStyle", value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Sólido</SelectItem>
                      <SelectItem value="dashed">Discontinuo</SelectItem>
                      <SelectItem value="dotted">Punteado</SelectItem>
                      <SelectItem value="none">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <ColorPicker
                    color={component.style.borderColor || "#ffffff"}
                    onChange={(color) => updateStyle("borderColor", color)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Radio del Borde (px)</Label>
              <Input
                type="number"
                value={Number.parseInt(component.style.borderRadius) || 0}
                onChange={(e) => updateStyle("borderRadius", `${e.target.value}px`)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Sombra</Label>
              <Select
                value={component.style.boxShadow || "none"}
                onValueChange={(value) => updateStyle("boxShadow", value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar sombra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  <SelectItem value="0 1px 3px rgba(0,0,0,0.12)">Ligera</SelectItem>
                  <SelectItem value="0 4px 6px rgba(0,0,0,0.1)">Media</SelectItem>
                  <SelectItem value="0 10px 15px rgba(0,0,0,0.1)">Fuerte</SelectItem>
                  <SelectItem value="0 20px 25px rgba(0,0,0,0.15)">Muy fuerte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function EventProperties({ component, updateProp }: { component: any; updateProp: (key: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-border rounded-md">
        <h3 className="text-sm font-medium mb-2">Eventos disponibles</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="onClick" className="text-xs">
              onClick
            </Label>
            <Input
              id="onClick"
              value={component.props.onClick || ""}
              onChange={(e) => updateProp("onClick", e.target.value)}
              placeholder="console.log('Clicked')"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onChange" className="text-xs">
              onChange
            </Label>
            <Input
              id="onChange"
              value={component.props.onChange || ""}
              onChange={(e) => updateProp("onChange", e.target.value)}
              placeholder="console.log('Changed')"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onFocus" className="text-xs">
              onFocus
            </Label>
            <Input
              id="onFocus"
              value={component.props.onFocus || ""}
              onChange={(e) => updateProp("onFocus", e.target.value)}
              placeholder="console.log('Focused')"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onBlur" className="text-xs">
              onBlur
            </Label>
            <Input
              id="onBlur"
              value={component.props.onBlur || ""}
              onChange={(e) => updateProp("onBlur", e.target.value)}
              placeholder="console.log('Blurred')"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>
      </div>
      <div className="p-4 border border-border rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Código personalizado</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Añade código JavaScript personalizado para este componente</p>
        <div className="space-y-2">
          <Label htmlFor="customCode" className="text-xs">
            Código JavaScript
          </Label>
          <Textarea
            id="customCode"
            value={component.props.customCode || ""}
            onChange={(e) => updateProp("customCode", e.target.value)}
            placeholder="// Tu código JavaScript aquí"
            className="h-24 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  )
}
