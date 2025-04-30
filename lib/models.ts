// Page and component models
export interface PageSettings {
  backgroundColor: string
  theme: "light" | "dark"
}

export interface Component {
  id: string
  type: string
  parentId?: string
  props: Record<string, any>
  style: Record<string, any>
  children?: string[]
  position?: { x: number; y: number } // Only used in the editor
}

export interface Page {
  name: string
  route: string
  pageSettings: PageSettings
  components: Component[]
}

export interface AppConfig {
  appName: string
  pages: Page[]
}
