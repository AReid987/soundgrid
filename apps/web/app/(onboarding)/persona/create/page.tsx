import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { PersonaType } from "@prisma/client"
import { PersonaForm } from "./persona-form"

export const metadata: Metadata = {
  title: "Create Your Persona - SoundGrid",
  description: "Set up your professional profile",
}

const validTypes = ["artist", "producer", "supervisor", "venue", "manager"]

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function PersonaCreatePage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  // Validate persona type
  const typeParam = params.type?.toLowerCase()
  if (!typeParam || !validTypes.includes(typeParam)) {
    redirect("/persona/select")
  }

  const personaType = typeParam.toUpperCase() as PersonaType

  // Check if user already has this persona type
  const existing = await prisma.persona.findUnique({
    where: {
      userId_type: {
        userId: session.user.id,
        type: personaType,
      },
    },
  })

  if (existing) {
    redirect("/dashboard")
  }

  const personaTitles: Record<PersonaType, string> = {
    ARTIST: "Artist",
    PRODUCER: "Producer",
    SUPERVISOR: "Music Supervisor",
    VENUE: "Venue",
    MANAGER: "Manager",
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your {personaTitles[personaType]} Profile
          </h1>
          <p className="text-text-secondary">
            Tell us a bit about yourself. This information helps other professionals 
            find and connect with you.
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border-subtle p-6">
          <PersonaForm 
            userId={session.user.id} 
            type={personaType}
          />
        </div>
      </div>
    </div>
  )
}
