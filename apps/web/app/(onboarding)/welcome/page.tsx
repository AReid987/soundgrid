import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Welcome - SoundGrid",
  description: "You're all set!",
}

export default async function WelcomePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  // Check if user has at least one persona
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { personas: true }
  })

  if (!user?.personas || user.personas.length === 0) {
    redirect("/persona/select")
  }

  const firstPersona = user.personas[0]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            You're all set!
          </h1>
          <p className="text-text-secondary text-lg">
            Welcome to SoundGrid, <span className="text-white font-medium">{firstPersona.displayName}</span>!
            Your {firstPersona.type.toLowerCase()} profile is ready.
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border-subtle p-6 mb-8 text-left">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            What's next?
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-white font-medium">Explore your dashboard</p>
                <p className="text-text-secondary text-sm">
                  View your contracts, catalog, and activity
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-white font-medium">Complete verification</p>
                <p className="text-text-secondary text-sm">
                  Verify your identity to receive payments
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-white font-medium">Create your first contract</p>
                <p className="text-text-secondary text-sm">
                  Start with a producer agreement or split sheet
                </p>
              </div>
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="block w-full px-6 py-3 bg-primary text-white font-medium rounded-lg
                     hover:opacity-90 transition-opacity text-center"
        >
          Go to Dashboard
        </Link>

        <p className="mt-4 text-sm text-text-muted">
          You can add more personas or edit your profile anytime from settings
        </p>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
