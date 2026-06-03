import { PersonaType } from "@prisma/client"
import Link from "next/link"

interface DashboardProps {
  displayName: string
}

// Artist Dashboard
export function ArtistDashboard({ displayName }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          href="/contracts/new"
          title="New Contract"
          description="Create a producer agreement or split sheet"
          icon="document"
        />
        <QuickActionCard
          href="/catalog/upload"
          title="Upload Track"
          description="Add new music to your catalog"
          icon="music"
        />
        <QuickActionCard
          href="/sync/browse"
          title="Browse Briefs"
          description="Find sync opportunities"
          icon="briefcase"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContracts />
        <CatalogPreview />
      </div>
    </div>
  )
}

// Producer Dashboard
export function ProducerDashboard({ displayName }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          href="/contracts/new"
          title="New Agreement"
          description="Create a producer or work-for-hire contract"
          icon="document"
        />
        <QuickActionCard
          href="/catalog/upload"
          title="Upload Beat"
          description="Add beats to your catalog"
          icon="music"
        />
        <QuickActionCard
          href="/contracts/splits"
          title="Split Sheets"
          description="Manage royalty splits"
          icon="chart"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContracts />
        <CatalogPreview />
      </div>
    </div>
  )
}

// Supervisor Dashboard
export function SupervisorDashboard({ displayName }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          href="/sync/briefs/new"
          title="Post Brief"
          description="Create a new sync licensing brief"
          icon="briefcase"
        />
        <QuickActionCard
          href="/sync/catalog"
          title="Browse Catalog"
          description="Search sync-ready tracks"
          icon="music"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ActiveBriefs />
      </div>
    </div>
  )
}

// Venue Dashboard
export function VenueDashboard({ displayName }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          href="/live/bookings"
          title="Bookings"
          description="Manage upcoming shows"
          icon="calendar"
        />
        <QuickActionCard
          href="/live/availability"
          title="Availability"
          description="Update your calendar"
          icon="clock"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <UpcomingShows />
      </div>
    </div>
  )
}

// Manager Dashboard
export function ManagerDashboard({ displayName }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          href="/roster"
          title="Roster"
          description="Manage your artists"
          icon="users"
        />
        <QuickActionCard
          href="/contracts"
          title="Contracts"
          description="Review pending deals"
          icon="document"
        />
        <QuickActionCard
          href="/reports"
          title="Reports"
          description="View earnings and activity"
          icon="chart"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RosterOverview />
        <RecentActivity />
      </div>
    </div>
  )
}

// Helper components
function QuickActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-surface rounded-lg border border-border-subtle hover:border-primary transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-surface-elevated text-primary group-hover:bg-primary/20">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-text-secondary text-sm">{description}</p>
        </div>
      </div>
    </Link>
  )
}

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    document: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    music: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    briefcase: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  }
  
  return <>{icons[name] || null}</>
}

// Placeholder components
function RecentContracts() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Contracts</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No contracts yet</p>
        <Link href="/contracts" className="text-primary text-sm hover:underline mt-2 inline-block">
          View all contracts
        </Link>
      </div>
    </div>
  )
}

function CatalogPreview() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Catalog</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No tracks in catalog</p>
        <Link href="/catalog" className="text-primary text-sm hover:underline mt-2 inline-block">
          Browse catalog
        </Link>
      </div>
    </div>
  )
}

function ActiveBriefs() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Active Briefs</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No active briefs</p>
        <Link href="/sync/briefs" className="text-primary text-sm hover:underline mt-2 inline-block">
          Manage briefs
        </Link>
      </div>
    </div>
  )
}

function UpcomingShows() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Shows</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No upcoming shows</p>
        <Link href="/live/bookings" className="text-primary text-sm hover:underline mt-2 inline-block">
          Manage bookings
        </Link>
      </div>
    </div>
  )
}

function RosterOverview() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Roster</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No artists in roster</p>
        <Link href="/roster" className="text-primary text-sm hover:underline mt-2 inline-block">
          Manage roster
        </Link>
      </div>
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="text-center py-8">
        <p className="text-text-muted">No recent activity</p>
      </div>
    </div>
  )
}
