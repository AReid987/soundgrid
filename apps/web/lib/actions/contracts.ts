"use server"

import { z } from "zod"
import { prisma } from "@/lib/db/client"
import { ContractType, ContractStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { contractAccessFilter, canAccessContract } from "@/lib/auth/data-isolation"

// Schema for contract creation
const createContractSchema = z.object({
  type: z.nativeEnum(ContractType),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  partyAId: z.string().min(1, "Party A is required"),
  partyBId: z.string().min(1, "Party B is required"),
  amount: z.number().int().min(0).optional().nullable(),
  currency: z.string().default("USD"),
  terms: z.record(z.string(), z.any()).optional().nullable(),
})

export type CreateContractInput = z.infer<typeof createContractSchema>

export async function createContract(
  userId: string,
  input: CreateContractInput
) {
  // Validate input
  const validated = createContractSchema.safeParse(input)
  
  if (!validated.success) {
    return {
      success: false,
      error: "Invalid input",
      issues: validated.error.issues,
    }
  }

  try {
    // Get user's personas to verify they can create this contract
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { personas: true },
    })

    if (!user || user.personas.length === 0) {
      return {
        success: false,
        error: "User must have a persona to create contracts",
      }
    }

    const userPersonaIds = user.personas.map(p => p.id)

    // Verify partyA is one of user's personas
    if (!userPersonaIds.includes(input.partyAId)) {
      return {
        success: false,
        error: "You can only create contracts as one of your personas",
      }
    }

    // Verify partyB exists and is not the same as partyA
    if (input.partyAId === input.partyBId) {
      return {
        success: false,
        error: "Parties cannot be the same",
      }
    }

    const partyB = await prisma.persona.findUnique({
      where: { id: input.partyBId },
    })

    if (!partyB) {
      return {
        success: false,
        error: "Counterparty not found",
      }
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        partyAId: input.partyAId,
        partyBId: input.partyBId,
        amount: input.amount,
        currency: input.currency,
        status: ContractStatus.DRAFT,
        // Store additional terms as JSON
        // Note: In production, you might want a separate terms table
      },
      include: {
        partyA: true,
        partyB: true,
      },
    })

    revalidatePath("/contracts")
    revalidatePath("/dashboard")

    return {
      success: true,
      contract: {
        id: contract.id,
        type: contract.type,
        title: contract.title,
        status: contract.status,
        partyA: {
          id: contract.partyA.id,
          displayName: contract.partyA.displayName,
        },
        partyB: {
          id: contract.partyB.id,
          displayName: contract.partyB.displayName,
        },
      },
    }
  } catch (error) {
    console.error("Failed to create contract:", error)
    return {
      success: false,
      error: "Failed to create contract. Please try again.",
    }
  }
}

export async function getUserContracts(userId: string) {
  try {
    // Get user's personas
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { personas: true },
    })

    if (!user || user.personas.length === 0) {
      return {
        success: true,
        contracts: [],
      }
    }

    const personaIds = user.personas.map(p => p.id)

    // Fetch contracts with data isolation
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { partyAId: { in: personaIds } },
          { partyBId: { in: personaIds } },
        ],
      },
      include: {
        partyA: true,
        partyB: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      contracts,
    }
  } catch (error) {
    console.error("Failed to fetch contracts:", error)
    return {
      success: false,
      error: "Failed to fetch contracts",
      contracts: [],
    }
  }
}

export async function getContract(userId: string, contractId: string) {
  try {
    // Check access
    const hasAccess = await canAccessContract(userId, contractId)
    
    if (!hasAccess) {
      return {
        success: false,
        error: "Access denied",
      }
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        partyA: true,
        partyB: true,
      },
    })

    if (!contract) {
      return {
        success: false,
        error: "Contract not found",
      }
    }

    return {
      success: true,
      contract,
    }
  } catch (error) {
    console.error("Failed to fetch contract:", error)
    return {
      success: false,
      error: "Failed to fetch contract",
    }
  }
}

export async function updateContractStatus(
  userId: string,
  contractId: string,
  status: ContractStatus
) {
  try {
    // Check access
    const hasAccess = await canAccessContract(userId, contractId)
    
    if (!hasAccess) {
      return {
        success: false,
        error: "Access denied",
      }
    }

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: { status },
    })

    revalidatePath("/contracts")
    revalidatePath(`/contracts/${contractId}`)

    return {
      success: true,
      contract,
    }
  } catch (error) {
    console.error("Failed to update contract:", error)
    return {
      success: false,
      error: "Failed to update contract",
    }
  }
}

export async function searchCounterparties(query: string, excludePersonaId: string) {
  try {
    const counterparties = await prisma.persona.findMany({
      where: {
        id: { not: excludePersonaId },
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { stageName: { contains: query, mode: "insensitive" } },
          { venueName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        displayName: true,
        type: true,
        avatarUrl: true,
      },
    })

    return {
      success: true,
      counterparties,
    }
  } catch (error) {
    console.error("Failed to search counterparties:", error)
    return {
      success: false,
      error: "Failed to search",
      counterparties: [],
    }
  }
}
