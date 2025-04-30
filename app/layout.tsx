import type React from "react"
import type { Metadata } from "next"
import { Oswald } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Constructor de UI Angular",
  description: "Diseña interfaces visualmente y exporta a Angular",
  generator: "Angular UI Builder",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={oswald.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
