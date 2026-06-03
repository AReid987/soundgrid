"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PersonaType } from "@prisma/client"
import { FeatureAccess } from "@/lib/auth/permissions"

interface NavItem {
  label: string
  href: string
  icon: React.FC<{ className?: string }>
  requiredFeature?: (type: PersonaType) => boolean
}

interface AppNavProps {
  personaType: PersonaType
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Contracts",
    href: "/contracts",
    icon: DocumentIcon,
    requiredFeature: FeatureAccess.canCreateContracts,
  },
  {
    label: "Catalog",
    href: "/catalog",
    icon: MusicIcon,
    requiredFeature: FeatureAccess.canManageCatalog,
  },
  {
    label: "Sync",
    href: "/sync",
    icon: BriefcaseIcon,
    requiredFeature: FeatureAccess.canAccessSyncMarketplace,
  },
  {
    label: "Live",
    href: "/live",
    icon: CalendarIcon,
    requiredFeature: (type) => 
      FeatureAccess.canBookVenues(type) || FeatureAccess.canManageVenueBookings(type),
  },
]

export function AppNav({ personaType }: AppNavProps) {
  const pathname = usePathname()
  
  const visibleItems = navItems.filter(
    item => !item.requiredFeature || item.requiredFeature(personaType)
  )

  return (
    <nav className="hidden md:flex items-center gap-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive 
                ? "bg-primary/20 text-primary" 
                : "text-text-secondary hover:text-white hover:bg-surface-elevated"
              }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
