import { prisma } from "@/lib/db/client"

export async function requireVerification(userId: string): Promise<{
  verified: boolean
  error?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { identityVerified: true },
  })

  if (!user) {
    return { verified: false, error: "User not found" }
  }

  if (!user.identityVerified) {
    return {
      verified: false,
      error: "Identity verification required. Please verify your identity first.",
    }
  }

  return { verified: true }
}

export async function isVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { identityVerified: true },
  })

  return user?.identityVerified ?? false
}
