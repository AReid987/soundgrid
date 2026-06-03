import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { PersonaSelector } from "./persona-selector"

export const metadata: Metadata = {
  title: "Select Your Persona - SoundGrid",
  description: "Choose your professional persona",
}

export default async function PersonaSelectPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  // Check if user already has personas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { personas: true }
  })

  if (user?.personas && user.personas.length > 0) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to SoundGrid!
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Select your professional persona to get started. This helps us tailor 
            your experience and connect you with the right opportunities.
          </p>
        </div>

        <PersonaSelector />

        <p className="text-center text-text-muted text-sm mt-8">
          You can add more personas later from your profile settings
        </p>
      </div>
    </div>
  )
}
