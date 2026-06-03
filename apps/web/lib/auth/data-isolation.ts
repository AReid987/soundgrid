import { prisma } from "@/lib/db/client"
import { PersonaType, Prisma } from "@prisma/client"

/**
 * Data Isolation Utilities
 * 
 * These functions ensure users can only access data they own
 * or have been explicitly granted access to.
 */

// Contract isolation - users can only see contracts they're party to
export async function getAccessibleContractIds(
  personaIds: string[]
): Promise<string[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      OR: [
        { partyAId: { in: personaIds } },
        { partyBId: { in: personaIds } },
      ],
    },
    select: { id: true },
  })
  
  return contracts.map(c => c.id)
}

export function contractAccessFilter(
  personaIds: string[]
): Prisma.ContractWhereInput {
  return {
    OR: [
      { partyAId: { in: personaIds } },
      { partyBId: { in: personaIds } },
    ],
  }
}

// Catalog isolation - users can only see their own catalog
export async function getAccessibleCatalogIds(
  personaIds: string[]
): Promise<string[]> {
  const items = await prisma.catalogItem.findMany({
    where: {
      personaId: { in: personaIds },
    },
    select: { id: true },
  })
  
  return items.map(i => i.id)
}

export function catalogAccessFilter(
  personaIds: string[]
): Prisma.CatalogItemWhereInput {
  return {
    personaId: { in: personaIds },
  }
}

// Organization isolation
export async function getUserOrganizationIds(
  userId: string
): Promise<string[]> {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  
  return memberships.map(m => m.organizationId)
}

// Check if user is a member of an organization
export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  })
  
  return !!membership
}

// Check if user has specific organization role
export async function hasOrganizationRole(
  userId: string,
  organizationId: string,
  roles: string[]
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  })
  
  return membership ? roles.includes(membership.role) : false
}

// Get user's permissions within an organization
export async function getOrganizationPermissions(
  userId: string,
  organizationId: string
): Promise<{
  role: string | null
  canCreateContracts: boolean
  canSignContracts: boolean
  canManageCatalog: boolean
  canManagePayouts: boolean
}> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  })
  
  if (!membership) {
    return {
      role: null,
      canCreateContracts: false,
      canSignContracts: false,
      canManageCatalog: false,
      canManagePayouts: false,
    }
  }
  
  return {
    role: membership.role,
    canCreateContracts: membership.canCreateContracts,
    canSignContracts: membership.canSignContracts,
    canManageCatalog: membership.canManageCatalog,
    canManagePayouts: membership.canManagePayouts,
  }
}

// Comprehensive access check for contracts
export async function canAccessContract(
  userId: string,
  contractId: string
): Promise<boolean> {
  // Get user's personas
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { personas: true },
  })
  
  if (!user || user.personas.length === 0) {
    return false
  }
  
  const personaIds = user.personas.map(p => p.id)
  
  // Check if user is party to the contract
  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      OR: [
        { partyAId: { in: personaIds } },
        { partyBId: { in: personaIds } },
      ],
    },
  })
  
  return !!contract
}

// Comprehensive access check for catalog items
export async function canAccessCatalogItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  // Get user's personas
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { personas: true },
  })
  
  if (!user || user.personas.length === 0) {
    return false
  }
  
  const personaIds = user.personas.map(p => p.id)
  
  // Check if item belongs to one of user's personas
  const item = await prisma.catalogItem.findFirst({
    where: {
      id: itemId,
      personaId: { in: personaIds },
    },
  })
  
  return !!item
}

// Get user's accessible data summary
export async function getUserAccessSummary(userId: string): Promise<{
  personaIds: string[]
  personaTypes: PersonaType[]
  organizationIds: string[]
  accessibleContractIds: string[]
  accessibleCatalogIds: string[]
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { personas: true },
  })
  
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  
  const personaIds = user?.personas.map(p => p.id) || []
  const personaTypes = user?.personas.map(p => p.type) || []
  const organizationIds = memberships.map(m => m.organizationId)
  
  const [accessibleContractIds, accessibleCatalogIds] = await Promise.all([
    getAccessibleContractIds(personaIds),
    getAccessibleCatalogIds(personaIds),
  ])
  
  return {
    personaIds,
    personaTypes,
    organizationIds,
    accessibleContractIds,
    accessibleCatalogIds,
  }
}
