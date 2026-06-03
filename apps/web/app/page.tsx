import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            SoundGrid
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            The commercial operating layer for independent music professionals. 
            Execute enforceable, escrow-backed agreements in under 10 minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signin"
              className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Digital Handshake"
            description="Legally binding contracts with integrated e-signatures and automatic versioning."
          />
          <FeatureCard
            title="Financial Trust"
            description="Escrow-backed payments with milestone-based releases and split-pay logic."
          />
          <FeatureCard
            title="Asset Control"
            description="AI-validated catalog management with ISRC/ISWC distribution gates."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}
