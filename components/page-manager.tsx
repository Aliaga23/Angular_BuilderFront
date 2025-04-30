"use client"

import { useState } from "react"
import { usePageContext } from "@/context/page-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit } from "lucide-react"
import { ColorPicker } from "./color-picker"

export default function PageManager() {
  const { pages, currentPageIndex, setCurrentPageIndex, addPage, removePage, updatePageSettings } = usePageContext()
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [newPageRoute, setNewPageRoute] = useState("")
  const [newPageBgColor, setNewPageBgColor] = useState("#ffffff")
  const [newPageTheme, setNewPageTheme] = useState<"light" | "dark">("light")

  const handleAddPage = () => {
    if (!newPageName.trim()) return

    addPage({
      name: newPageName.trim(),
      route: newPageRoute.trim() || newPageName.toLowerCase().replace(/\s+/g, "-"),
      pageSettings: {
        backgroundColor: newPageBgColor,
        theme: newPageTheme,
      },
    })

    // Reset form
    setNewPageName("")
    setNewPageRoute("")
    setNewPageBgColor("#ffffff")
    setNewPageTheme("light")
    setIsAddPageDialogOpen(false)

    // Switch to the new page
    setCurrentPageIndex(pages.length)
  }

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return // Don't remove the last page
    removePage(index)
  }

  const handleChangeBackgroundColor = (color: string) => {
    updatePageSettings(currentPageIndex, {
      ...pages[currentPageIndex].pageSettings,
      backgroundColor: color,
    })
  }

  const handleChangeTheme = (theme: "light" | "dark") => {
    updatePageSettings(currentPageIndex, {
      ...pages[currentPageIndex].pageSettings,
      theme,
    })
  }

  return (
    <div className="border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-medium">Páginas</h3>
        <Dialog open={isAddPageDialogOpen} onOpenChange={setIsAddPageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir nueva página</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="page-name">Nombre de la página</Label>
                <Input
                  id="page-name"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Ej: Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-route">Ruta (opcional)</Label>
                <Input
                  id="page-route"
                  value={newPageRoute}
                  onChange={(e) => setNewPageRoute(e.target.value)}
                  placeholder="Ej: dashboard"
                />
                <p className="text-xs text-muted-foreground">
                  Si se deja en blanco, se generará automáticamente a partir del nombre.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Color de fondo</Label>
                <ColorPicker color={newPageBgColor} onChange={setNewPageBgColor} />
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Tabs
                  value={newPageTheme}
                  onValueChange={(value) => setNewPageTheme(value as "light" | "dark")}
                  className="w-full"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="light" className="flex-1">
                      Claro
                    </TabsTrigger>
                    <TabsTrigger value="dark" className="flex-1">
                      Oscuro
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Button className="w-full mt-4" onClick={handleAddPage}>
                Añadir página
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-2 pb-2 overflow-x-auto">
        <Tabs
          value={currentPageIndex.toString()}
          onValueChange={(value) => setCurrentPageIndex(Number.parseInt(value))}
          className="w-full"
        >
          <TabsList className="w-full h-auto p-1 bg-muted/50 flex-wrap">
            {pages.map((page, index) => (
              <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-1 h-8 px-3 text-xs">
                <span>{page.name}</span>
                {pages.length > 1 && (
                  <div
                    role="button"
                    className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-destructive inline-flex items-center justify-center rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePage(index)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Current page settings */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">Configuración de página</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Color de fondo</Label>
            <ColorPicker
              color={pages[currentPageIndex]?.pageSettings.backgroundColor || "#ffffff"}
              onChange={handleChangeBackgroundColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
