import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que existen en la aplicación
const validRoutes = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/profile",
  "/builder",
  "/crud-generator",
  "/ui-generator",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas dinámicas como /builder/[id]
  if (pathname.startsWith("/builder/")) {
    return NextResponse.next()
  }

  // Verificar si la ruta existe
  const routeExists = validRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Si la ruta no existe, redirigir a la página principal
  if (!routeExists && !pathname.includes("_next") && !pathname.includes("favicon.ico")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
