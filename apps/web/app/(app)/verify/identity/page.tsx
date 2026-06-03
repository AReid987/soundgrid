import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { IdentityVerification } from "./identity-verification"

export const metadata: Metadata = {
  title: "Identity Verification - SoundGrid",
  description: "Verify your identity to receive payments",
}

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function IdentityVerifyPage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  // Check if already verified
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      identityVerified: true,
      identityVerifiedAt: true,
      identitySessionId: true,
    },
  })

  if (!user) {
    redirect("/signin")
  }

  // Show success state if redirected from Stripe
  const showSuccess = params.success === "true"
  const showCanceled = params.canceled === "true"

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Identity Verification
          </h1>
          <p className="text-text-secondary">
            Verify your identity to unlock payouts and secure contracts on SoundGrid.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-success text-center">
              Verification submitted! We're reviewing your documents.
            </p>
          </div>
        )}

        {showCanceled && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error text-center">
              Verification was canceled. You can try again when you're ready.
            </p>
          </div>
        )}

        <IdentityVerification 
          userId={user.id}
          isVerified={user.identityVerified}
          verifiedAt={user.identityVerifiedAt}
          hasSession={!!user.identitySessionId}
        />
      </div>
    </div>
  )
}
