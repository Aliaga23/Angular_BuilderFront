import type { Metadata } from "next"
import ClientOnly from "@/components/client-only"
import VisualBuilder from "@/components/visual-builder"

export const metadata: Metadata = {
  title: "Visual Interface Builder",
  description: "Design interfaces visually and export to Angular",
}

export default function BuilderPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <ClientOnly>
        <VisualBuilder projectId={params.id} />
      </ClientOnly>
    </main>
  )
}
