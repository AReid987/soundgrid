import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import Link from "next/link"
import { AppNav } from "@/components/navigation/app-nav"
import {
  ArtistDashboard,
  ProducerDashboard,
  SupervisorDashboard,
  VenueDashboard,
  ManagerDashboard,
} from "@/components/dashboard/role-dashboards"

export const metadata: Metadata = {
  title: "Dashboard - SoundGrid",
  description: "Your SoundGrid dashboard",
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  // Fetch user's personas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { personas: true }
  })

  // Redirect to onboarding if no personas
  if (!user?.personas || user.personas.length === 0) {
    redirect("/persona/select")
  }

  const activePersona = user.personas[0]

  // Render role-specific dashboard
  const renderRoleDashboard = () => {
    const props = { displayName: activePersona.displayName }
    
    switch (activePersona.type) {
      case "ARTIST":
        return <ArtistDashboard {...props} />
      case "PRODUCER":
        return <ProducerDashboard {...props} />
      case "SUPERVISOR":
        return <SupervisorDashboard {...props} />
      case "VENUE":
        return <VenueDashboard {...props} />
      case "MANAGER":
        return <ManagerDashboard {...props} />
      default:
        return <ArtistDashboard {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              SoundGrid
            </Link>
            <AppNav personaType={activePersona.type} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary text-sm">
              {activePersona.displayName}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button 
                type="submit"
                className="text-sm text-text-muted hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {activePersona.displayName}!
          </h2>
          <p className="text-text-secondary">
            {getRoleSubtitle(activePersona.type)}
          </p>
        </div>

        {/* Identity Verification Banner */}
        {!user.identityVerified && (
          <div className="bg-surface rounded-lg border border-border-subtle p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Complete identity verification
                </h3>
                <p className="text-text-secondary">
                  Verify your identity to receive payments and unlock all features.
                </p>
              </div>
              <Link
                href="/verify/identity"
                className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Verify Now
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Active Contracts" value="0" />
          <StatCard title="In Escrow" value="$0" />
          <StatCard title="Catalog Tracks" value="0" />
          <StatCard title="Pending Actions" value="0" />
        </div>

        {/* Role-Specific Dashboard */}
        {renderRoleDashboard()}
      </main>
    </div>
  )
}

function getRoleSubtitle(type: string): string {
  const subtitles: Record<string, string> = {
    ARTIST: "Manage your music, contracts, and sync opportunities.",
    PRODUCER: "Track your beats, agreements, and royalty splits.",
    SUPERVISOR: "Find the perfect tracks for your projects.",
    VENUE: "Manage bookings and upcoming shows.",
    MANAGER: "Oversee your roster and business operations.",
  }
  return subtitles[type] || "Manage your contracts, catalog, and bookings."
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <p className="text-text-secondary text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
