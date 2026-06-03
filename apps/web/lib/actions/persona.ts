"use server"

import { z } from "zod"
import { prisma } from "@/lib/db/client"
import { PersonaType } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Schema for persona creation
const createPersonaSchema = z.object({
  type: z.nativeEnum(PersonaType),
  displayName: z.string().min(1, "Display name is required").max(100),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  genres: z.array(z.string()).optional(),
  // Type-specific fields
  stageName: z.string().max(100).optional(),
  venueName: z.string().max(100).optional(),
  capacity: z.number().int().positive().optional(),
  companyName: z.string().max(100).optional(),
})

export type CreatePersonaInput = z.infer<typeof createPersonaSchema>

export async function createPersona(
  userId: string,
  input: CreatePersonaInput
) {
  // Validate input
  const validated = createPersonaSchema.safeParse(input)
  
  if (!validated.success) {
    return {
      success: false,
      error: "Invalid input",
      issues: validated.error.issues,
    }
  }

  try {
    // Check if persona already exists for this user+type
    const existing = await prisma.persona.findUnique({
      where: {
        userId_type: {
          userId,
          type: input.type,
        },
      },
    })

    if (existing) {
      return {
        success: false,
        error: `You already have a ${input.type.toLowerCase()} persona`,
      }
    }

    // Create persona with type-specific fields
    const personaData: any = {
      userId,
      type: input.type,
      displayName: input.displayName,
      location: input.location,
      bio: input.bio,
      genres: input.genres || [],
    }

    // Add type-specific fields
    switch (input.type) {
      case "ARTIST":
      case "PRODUCER":
        personaData.stageName = input.stageName
        break
      case "VENUE":
        personaData.venueName = input.venueName
        personaData.capacity = input.capacity
        break
      case "SUPERVISOR":
      case "MANAGER":
        personaData.companyName = input.companyName
        break
    }

    const persona = await prisma.persona.create({
      data: personaData,
    })

    revalidatePath("/dashboard")

    return {
      success: true,
      persona: {
        id: persona.id,
        type: persona.type,
        displayName: persona.displayName,
      },
    }
  } catch (error) {
    console.error("Failed to create persona:", error)
    return {
      success: false,
      error: "Failed to create persona. Please try again.",
    }
  }
}

export async function getUserPersonas(userId: string) {
  try {
    const personas = await prisma.persona.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      personas,
    }
  } catch (error) {
    console.error("Failed to fetch personas:", error)
    return {
      success: false,
      error: "Failed to fetch personas",
      personas: [],
    }
  }
}

export async function setActivePersona(userId: string, personaId: string) {
  try {
    // Verify the persona belongs to the user
    const persona = await prisma.persona.findFirst({
      where: {
        id: personaId,
        userId,
      },
    })

    if (!persona) {
      return {
        success: false,
        error: "Persona not found",
      }
    }

    // In a real app, you'd store this in session or JWT
    // For now, we'll return success and let the client handle it
    return {
      success: true,
      persona: {
        id: persona.id,
        type: persona.type,
        displayName: persona.displayName,
      },
    }
  } catch (error) {
    console.error("Failed to set active persona:", error)
    return {
      success: false,
      error: "Failed to set active persona",
    }
  }
}
