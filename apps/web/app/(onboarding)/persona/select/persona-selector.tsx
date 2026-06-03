"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PersonaType } from "@prisma/client"

const personas = [
  {
    type: "ARTIST" as PersonaType,
    title: "Artist",
    description: "Musicians, vocalists, and performers creating original music",
    icon: MicrophoneIcon,
    features: ["Release music", "Book shows", "Manage contracts", "Track royalties"],
  },
  {
    type: "PRODUCER" as PersonaType,
    title: "Producer",
    description: "Beat makers, engineers, and creative collaborators",
    icon: HeadphonesIcon,
    features: ["Share beats", "Collaborate", "Producer agreements", "Split sheets"],
  },
  {
    type: "SUPERVISOR" as PersonaType,
    title: "Music Supervisor",
    description: "Find and license music for film, TV, and ads",
    icon: FilmIcon,
    features: ["Post briefs", "Browse catalog", "License tracks", "Manage projects"],
  },
  {
    type: "VENUE" as PersonaType,
    title: "Venue",
    description: "Clubs, theaters, and event spaces hosting live music",
    icon: BuildingIcon,
    features: ["List venue", "Book artists", "Performance contracts", "Calendar"],
  },
  {
    type: "MANAGER" as PersonaType,
    title: "Manager",
    description: "Represent artists and handle business operations",
    icon: BriefcaseIcon,
    features: ["Manage roster", "Negotiate deals", "Contract oversight", "Reporting"],
  },
]

export function PersonaSelector() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PersonaType | null>(null)

  const handleSelect = (type: PersonaType) => {
    setSelectedType(type)
  }

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/persona/create?type=${selectedType.toLowerCase()}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <button
            key={persona.type}
            onClick={() => handleSelect(persona.type)}
            className={`text-left p-6 rounded-lg border transition-all duration-200
              ${selectedType === persona.type
                ? "bg-surface-elevated border-primary ring-1 ring-primary"
                : "bg-surface border-border-subtle hover:border-border hover:bg-surface-elevated"
              }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedType === persona.type 
                  ? "bg-primary/20 text-primary" 
                  : "bg-surface-elevated text-text-secondary"
              }`}>
                <persona.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {persona.title}
                </h3>
                <p className="text-text-secondary text-sm mb-3">
                  {persona.description}
                </p>
                <ul className="space-y-1">
                  {persona.features.map((feature, i) => (
                    <li key={i} className="text-text-muted text-xs flex items-center gap-2">
                      <span className="w-1 h-1 bg-text-muted rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className="px-8 py-3 bg-primary text-white font-medium rounded-md
                     hover:opacity-90 transition-opacity disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// Icons
function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  )
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
