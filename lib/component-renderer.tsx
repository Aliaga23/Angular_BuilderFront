"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function renderComponent(component: any) {
  const { type, props, style, children } = component

  // Asegurarse de que las dimensiones de props se apliquen al estilo
  const componentStyle = {
    ...style,
    // Priorizar las dimensiones de props sobre las de style
    width: props.width ? `${props.width}px` : style.width,
    height: props.height ? `${props.height}px` : style.height,
  }

  switch (type) {
    case "button":
      return (
        <Button style={componentStyle} variant={props.variant || "default"}>
          {props.text || "Button"}
        </Button>
      )

    case "text":
      return <p style={componentStyle}>{props.text || "Text content"}</p>

    case "heading":
      const HeadingTag = (props.level || "h1") as keyof JSX.IntrinsicElements
      return <HeadingTag style={componentStyle}>{props.text || "Heading"}</HeadingTag>

    case "input":
      return (
        <div>
          {props.label && <Label htmlFor={props.id || "input"}>{props.label}</Label>}
          <Input
            id={props.id || "input"}
            type={props.type || "text"}
            placeholder={props.placeholder || ""}
            style={componentStyle}
          />
        </div>
      )

    case "textarea":
      return (
        <div>
          {props.label && <Label htmlFor={props.id || "textarea"}>{props.label}</Label>}
          <Textarea
            id={props.id || "textarea"}
            placeholder={props.placeholder || ""}
            rows={props.rows || 4}
            style={componentStyle}
          />
        </div>
      )

    case "select":
      return (
        <div>
          {props.label && <Label htmlFor={props.id || "select"}>{props.label}</Label>}
          <Select defaultValue={(props.options && props.options[0]?.value) || ""}>
            <SelectTrigger id={props.id || "select"} style={componentStyle}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {props.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              )) || <SelectItem value="placeholder">No options</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox id={props.id || "checkbox"} />
          <Label htmlFor={props.id || "checkbox"}>{props.label || "Checkbox"}</Label>
        </div>
      )

    case "radio":
      return (
        <div>
          <Label>{props.label || "Radio Group"}</Label>
          <RadioGroup defaultValue={props.value || (props.options && props.options[0]?.value)}>
            {props.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`radio-${option.value}`} />
                <Label htmlFor={`radio-${option.value}`}>{option.label}</Label>
              </div>
            )) || (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="placeholder" id="radio-placeholder" />
                <Label htmlFor="radio-placeholder">Option</Label>
              </div>
            )}
          </RadioGroup>
        </div>
      )

    case "datepicker":
      return (
        <div>
          {props.label && <Label>{props.label}</Label>}
          <Calendar mode="single" className="rounded-md border" />
        </div>
      )

    case "image":
      return (
        <img
          src={props.src || "/placeholder.svg?height=200&width=300"}
          alt={props.alt || "Image"}
          width={props.width || 300}
          height={props.height || 200}
          style={componentStyle}
        />
      )

    case "icon":
      const IconComponent = (props.name && LucideIcons[props.name as keyof typeof LucideIcons]) || LucideIcons.Square
      return <IconComponent size={props.size || 24} style={componentStyle} />

    case "container":
      return <div style={componentStyle}>{children?.map(renderComponent) || null}</div>

    case "list":
      const ListTag = (props.type || "ul") as "ul" | "ol"
      return (
        <ListTag style={componentStyle}>
          {props.items?.map((item: string, index: number) => <li key={index}>{item}</li>) || (
            <>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </>
          )}
        </ListTag>
      )

    case "link":
      return (
        <a href={props.href || "#"} style={componentStyle}>
          {props.label || "Link"}
        </a>
      )

    case "card":
      return (
        <Card style={componentStyle}>
          <CardHeader>
            <CardTitle>{props.title || "Card Title"}</CardTitle>
          </CardHeader>
          <CardContent>{props.content || "Card content goes here"}</CardContent>
        </Card>
      )

    case "slider":
      return (
        <div>
          {props.label && <Label>{props.label}</Label>}
          <Slider
            defaultValue={[props.value || 50]}
            max={props.max || 100}
            min={props.min || 0}
            step={props.step || 1}
            style={componentStyle}
          />
        </div>
      )

    case "tabs":
      return (
        <Tabs defaultValue={props.activeTab || "tab1"} style={componentStyle}>
          <TabsList>
            {props.tabs?.map((tab: any) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            )) || (
              <>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              </>
            )}
          </TabsList>
          {props.tabs?.map((tab: any) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.content}
            </TabsContent>
          )) || (
            <>
              <TabsContent value="tab1">Tab 1 content</TabsContent>
              <TabsContent value="tab2">Tab 2 content</TabsContent>
            </>
          )}
        </Tabs>
      )

    case "grid":
      return (
        <div
          style={{
            ...componentStyle,
            gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
            gap: `${props.gap || 16}px`,
          }}
        >
          {children?.map(renderComponent) || (
            <>
              <div style={{ padding: "16px", border: "1px dashed #ccc" }}>Grid Item 1</div>
              <div style={{ padding: "16px", border: "1px dashed #ccc" }}>Grid Item 2</div>
            </>
          )}
        </div>
      )

    case "navbar":
      return (
        <nav
          style={{
            ...componentStyle,
            // Asegurar que las dimensiones se apliquen correctamente
            width: props.width ? `${props.width}px` : componentStyle.width || "100%",
            height: props.height ? `${props.height}px` : componentStyle.height || "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: componentStyle.padding || "16px",
            backgroundColor: componentStyle.backgroundColor || "#f9f9f9",
          }}
        >
          <div className="font-bold">{props.title || "Website"}</div>
          <div className="flex gap-4">
            {props.links?.map((link: any, index: number) => (
              <a key={index} href={link.href || "#"} className="hover:underline">
                {link.label}
              </a>
            )) || (
              <>
                <a href="#" className="hover:underline">
                  Home
                </a>
                <a href="#" className="hover:underline">
                  About
                </a>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </>
            )}
          </div>
        </nav>
      )

    case "sidebar":
      return (
        <div style={componentStyle}>
          <ul className="space-y-2">
            {props.items?.map((item: any, index: number) => {
              const SidebarIcon =
                (item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]) || LucideIcons.Circle
              return (
                <li key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <SidebarIcon size={16} />
                  <span>{item.label}</span>
                </li>
              )
            }) || (
              <>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <LucideIcons.LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <LucideIcons.Settings size={16} />
                  <span>Settings</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <LucideIcons.User size={16} />
                  <span>Profile</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )

    case "table":
      return (
        <div style={componentStyle}>
          {props.caption && <div className="text-lg font-medium mb-2">{props.caption}</div>}
          <div className="border rounded-md overflow-hidden">
            <table className={`w-full ${props.bordered ? "border-collapse border border-border" : ""}`}>
              {props.showHeader !== false && (
                <thead className="bg-secondary">
                  <tr>
                    {props.columns?.map((column: any, index: number) => (
                      <th
                        key={index}
                        className="px-4 py-2 text-left font-medium text-sm"
                        style={{ width: column.width || "auto" }}
                      >
                        {column.header}
                      </th>
                    )) || (
                      <>
                        <th className="px-4 py-2 text-left font-medium text-sm">ID</th>
                        <th className="px-4 py-2 text-left font-medium text-sm">Nombre</th>
                        <th className="px-4 py-2 text-left font-medium text-sm">Descripción</th>
                      </>
                    )}
                  </tr>
                </thead>
              )}
              <tbody>
                {props.data?.map((row: any, rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className={`
                      ${props.striped && rowIndex % 2 === 1 ? "bg-secondary/50" : ""}
                      ${props.hoverable ? "hover:bg-secondary/70" : ""}
                      ${props.bordered ? "border-t border-border" : ""}
                    `}
                  >
                    {props.columns?.map((column: any, colIndex: number) => (
                      <td key={colIndex} className="px-4 py-2 text-sm">
                        {row[column.accessor] || ""}
                      </td>
                    )) || (
                      <>
                        <td className="px-4 py-2 text-sm">{row.id || ""}</td>
                        <td className="px-4 py-2 text-sm">{row.nombre || ""}</td>
                        <td className="px-4 py-2 text-sm">{row.descripcion || ""}</td>
                      </>
                    )}
                  </tr>
                )) || (
                  <>
                    <tr>
                      <td className="px-4 py-2 text-sm">1</td>
                      <td className="px-4 py-2 text-sm">Elemento 1</td>
                      <td className="px-4 py-2 text-sm">Descripción del elemento 1</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">2</td>
                      <td className="px-4 py-2 text-sm">Elemento 2</td>
                      <td className="px-4 py-2 text-sm">Descripción del elemento 2</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            {props.paginated && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
                <div className="text-sm text-muted-foreground">
                  Mostrando 1-{Math.min(props.pageSize || 10, props.data?.length || 0)} de {props.data?.length || 0}{" "}
                  resultados
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return <div>Unknown component type: {type}</div>
  }
}
