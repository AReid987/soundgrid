"use server"

import { stripe } from "@/lib/stripe/client"
import { prisma } from "@/lib/db/client"

export async function createVerificationSession(userId: string) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Check if already verified
    if (user.identityVerified) {
      return { success: false, error: "User is already verified" }
    }

    // Create verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        userId: userId,
      },
      options: {
        document: {
          allowed_types: ["driving_license", "id_card", "passport"],
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
      return_url: `${process.env.NEXTAUTH_URL}/verify/identity?success=true`,
    })

    // Store session ID on user
    await prisma.user.update({
      where: { id: userId },
      data: {
        identitySessionId: verificationSession.id,
      },
    })

    return {
      success: true,
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
    }
  } catch (error) {
    console.error("Failed to create verification session:", error)
    return {
      success: false,
      error: "Failed to create verification session",
    }
  }
}

export async function getVerificationStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        identityVerified: true,
        identityVerifiedAt: true,
        identitySessionId: true,
      },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // If not verified but has a session, check Stripe for updates
    if (!user.identityVerified && user.identitySessionId) {
      try {
        const session = await stripe.identity.verificationSessions.retrieve(
          user.identitySessionId
        )

        // If verified in Stripe but not in DB, update it
        if (session.status === "verified" && !user.identityVerified) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              identityVerified: true,
              identityVerifiedAt: new Date(),
            },
          })

          return {
            success: true,
            status: "verified",
            verified: true,
            verifiedAt: new Date(),
          }
        }

        return {
          success: true,
          status: session.status,
          verified: false,
        }
      } catch (stripeError) {
        // Session may have expired or been deleted
        return {
          success: true,
          status: "none",
          verified: user.identityVerified,
        }
      }
    }

    return {
      success: true,
      status: user.identityVerified ? "verified" : "none",
      verified: user.identityVerified,
      verifiedAt: user.identityVerifiedAt,
    }
  } catch (error) {
    console.error("Failed to get verification status:", error)
    return {
      success: false,
      error: "Failed to get verification status",
    }
  }
}

export async function handleVerificationWebhook(
  event: Stripe.Event
) {
  try {
    switch (event.type) {
      case "identity.verification_session.verified": {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              identityVerified: true,
              identityVerifiedAt: new Date(),
            },
          })
          console.log(`User ${userId} identity verified`)
        }
        break
      }

      case "identity.verification_session.canceled":
      case "identity.verification_session.requires_input": {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (userId) {
          // Store the current status but don't mark as verified
          await prisma.user.update({
            where: { id: userId },
            data: {
              identityVerified: false,
            },
          })
          console.log(`User ${userId} identity verification ${event.type}`)
        }
        break
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to handle verification webhook:", error)
    return { success: false, error: "Failed to process webhook" }
  }
}

// Import Stripe types
import Stripe from "stripe"
