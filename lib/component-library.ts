import {
  Type,
  TextIcon,
  Square,
  FormInput,
  TextIcon as Textarea,
  ListChecks,
  CheckSquare,
  CircleDot,
  ImageIcon,
  Box,
  List,
  LinkIcon,
  CreditCard,
  Sliders,
  NotebookTabsIcon as TabsIcon,
  LayoutGrid,
  Calendar,
  LayoutDashboard,
  Menu,
} from "lucide-react"

export const componentLibrary = {
  basic: [
    {
      type: "button",
      name: "Button",
      icon: Square,
      defaultProps: {
        text: "Button",
        variant: "default",
        name: "Button", // Añadir nombre por defecto
      },
      defaultStyle: {
        padding: "8px 16px",
        borderRadius: "4px",
        backgroundColor: "#f9f9f9",
        color: "#000000",
      },
    },
    {
      type: "text",
      name: "Text",
      icon: TextIcon,
      defaultProps: {
        text: "Text content",
        name: "Text",
      },
      defaultStyle: {
        fontSize: "16px",
        color: "#000000",
      },
    },
    {
      type: "heading",
      name: "Heading",
      icon: Type,
      defaultProps: {
        text: "Heading",
        level: "h1",
        name: "Heading",
      },
      defaultStyle: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#000000",
        marginBottom: "16px",
      },
    },
    {
      type: "image",
      name: "Image",
      icon: ImageIcon,
      defaultProps: {
        src: "/placeholder.svg?height=200&width=300",
        alt: "Image",
        width: 300,
        height: 200,
        name: "Image",
      },
      defaultStyle: {
        borderRadius: "4px",
      },
    },
    {
      type: "icon",
      name: "Icon",
      icon: Square,
      defaultProps: {
        name: "heart",
        size: 24,
        componentName: "Icon",
      },
      defaultStyle: {
        color: "#000000",
      },
    },
    {
      type: "link",
      name: "Link",
      icon: LinkIcon,
      defaultProps: {
        href: "#",
        label: "Link",
        name: "Link",
      },
      defaultStyle: {
        color: "#0000ff",
        textDecoration: "underline",
      },
    },
  ],
  form: [
    {
      type: "input",
      name: "Input",
      icon: FormInput,
      defaultProps: {
        placeholder: "Enter text...",
        type: "text",
        label: "Input Label",
        name: "Input",
      },
      defaultStyle: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
      },
    },
    {
      type: "textarea",
      name: "Textarea",
      icon: Textarea,
      defaultProps: {
        placeholder: "Enter text...",
        rows: 4,
        label: "Textarea Label",
        name: "Textarea",
      },
      defaultStyle: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
      },
    },
    {
      type: "select",
      name: "Select",
      icon: ListChecks,
      defaultProps: {
        label: "Select Label",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ],
        name: "Select",
      },
      defaultStyle: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
      },
    },
    {
      type: "checkbox",
      name: "Checkbox",
      icon: CheckSquare,
      defaultProps: {
        label: "Checkbox Label",
        checked: false,
        name: "Checkbox",
      },
      defaultStyle: {},
    },
    {
      type: "radio",
      name: "Radio",
      icon: CircleDot,
      defaultProps: {
        label: "Radio Label",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        value: "option1",
        name: "Radio",
      },
      defaultStyle: {},
    },
    {
      type: "datepicker",
      name: "Date Picker",
      icon: Calendar,
      defaultProps: {
        label: "Date",
        placeholder: "Select a date",
        name: "Date Picker",
      },
      defaultStyle: {
        width: "100%",
      },
    },
  ],
  layout: [
    {
      type: "container",
      name: "Container",
      icon: Box,
      defaultProps: {
        width: 300,
        height: 200,
        name: "Container",
      },
      defaultStyle: {
        width: "300px",
        height: "200px",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f9f9f9",
      },
      defaultChildren: [],
    },
    {
      type: "list",
      name: "List",
      icon: List,
      defaultProps: {
        items: ["Item 1", "Item 2", "Item 3"],
        type: "ul",
        name: "List",
      },
      defaultStyle: {
        paddingLeft: "20px",
      },
    },
    {
      type: "card",
      name: "Card",
      icon: CreditCard,
      defaultProps: {
        title: "Card Title",
        content: "Card content goes here",
        name: "Card",
      },
      defaultStyle: {
        width: "300px",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: "#ffffff",
      },
    },
    {
      type: "slider",
      name: "Slider",
      icon: Sliders,
      defaultProps: {
        min: 0,
        max: 100,
        value: 50,
        name: "Slider",
      },
      defaultStyle: {
        width: "100%",
      },
    },
    {
      type: "tabs",
      name: "Tabs",
      icon: TabsIcon,
      defaultProps: {
        tabs: [
          { id: "tab1", label: "Tab 1", content: "Tab 1 content" },
          { id: "tab2", label: "Tab 2", content: "Tab 2 content" },
        ],
        activeTab: "tab1",
        name: "Tabs",
      },
      defaultStyle: {
        width: "100%",
      },
    },
    {
      type: "grid",
      name: "Grid",
      icon: LayoutGrid,
      defaultProps: {
        columns: 2,
        gap: 16,
        name: "Grid",
      },
      defaultStyle: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        width: "100%",
        minHeight: "200px",
        border: "1px dashed #ccc",
        padding: "16px",
      },
      defaultChildren: [],
    },
    {
      type: "table",
      name: "Tabla",
      icon: List,
      defaultProps: {
        caption: "Tabla de datos",
        showHeader: true,
        striped: false,
        hoverable: true,
        bordered: false,
        paginated: false,
        pageSize: 10,
        pageSizeOptions: [5, 10, 20, 50],
        columns: [
          { header: "ID", accessor: "id", width: "80px" },
          { header: "Nombre", accessor: "nombre" },
          { header: "Descripción", accessor: "descripcion" },
        ],
        data: [
          { id: 1, nombre: "Elemento 1", descripcion: "Descripción del elemento 1" },
          { id: 2, nombre: "Elemento 2", descripcion: "Descripción del elemento 2" },
          { id: 3, nombre: "Elemento 3", descripcion: "Descripción del elemento 3" },
        ],
        name: "Tabla",
      },
      defaultStyle: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
      },
    },
  ],
  nav: [
    {
      type: "navbar",
      name: "Navbar",
      icon: Menu,
      defaultProps: {
        title: "Website",
        links: [
          { label: "Home", href: "#" },
          { label: "About", href: "#" },
          { label: "Contact", href: "#" },
        ],
        name: "Navbar",
      },
      defaultStyle: {
        width: "100%", // Esto será reemplazado por el valor en píxeles durante la normalización
        padding: "16px",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
    {
      type: "sidebar",
      name: "Sidebar",
      icon: LayoutDashboard,
      defaultProps: {
        items: [
          { label: "Dashboard", icon: "layout-dashboard" },
          { label: "Settings", icon: "settings" },
          { label: "Profile", icon: "user" },
        ],
        name: "Sidebar",
      },
      defaultStyle: {
        width: "250px",
        height: "400px",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        borderRight: "1px solid #ccc",
      },
    },
  ],
}
