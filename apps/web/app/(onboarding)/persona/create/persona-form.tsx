"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PersonaType } from "@prisma/client"
import { createPersona } from "@/lib/actions/persona"

const genreOptions = [
  "Hip Hop", "R&B", "Pop", "Rock", "Electronic", "Jazz", "Classical",
  "Country", "Folk", "Reggae", "Latin", "World", "Metal", "Punk",
  "Indie", "Alternative", "Soul", "Funk", "Blues", "Gospel", "Other"
]

interface PersonaFormProps {
  userId: string
  type: PersonaType
}

export function PersonaForm({ userId, type }: PersonaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const input: any = {
      type,
      displayName: formData.get("displayName") as string,
      location: formData.get("location") as string || undefined,
      bio: formData.get("bio") as string || undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    }

    // Add type-specific fields
    if (type === "ARTIST" || type === "PRODUCER") {
      input.stageName = formData.get("stageName") as string || undefined
    }
    
    if (type === "VENUE") {
      input.venueName = formData.get("venueName") as string || undefined
      const capacity = formData.get("capacity") as string
      if (capacity) input.capacity = parseInt(capacity, 10)
    }
    
    if (type === "SUPERVISOR" || type === "MANAGER") {
      input.companyName = formData.get("companyName") as string || undefined
    }

    const result = await createPersona(userId, input)

    if (result.success) {
      router.push("/welcome")
    } else {
      setError(result.error || "Failed to create persona")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Common Fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary mb-2">
            Display Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            required
            maxLength={100}
            placeholder="How you want to be known"
            className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                       text-white placeholder-text-muted focus:border-primary focus:outline-none
                       transition-colors"
          />
        </div>

        {/* Type-specific fields */}
        {(type === "ARTIST" || type === "PRODUCER") && (
          <div>
            <label htmlFor="stageName" className="block text-sm font-medium text-text-secondary mb-2">
              Stage Name
            </label>
            <input
              type="text"
              id="stageName"
              name="stageName"
              maxLength={100}
              placeholder="Your artist/producer name (if different)"
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                         text-white placeholder-text-muted focus:border-primary focus:outline-none
                         transition-colors"
            />
          </div>
        )}

        {type === "VENUE" && (
          <>
            <div>
              <label htmlFor="venueName" className="block text-sm font-medium text-text-secondary mb-2">
                Venue Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="venueName"
                name="venueName"
                required
                maxLength={100}
                placeholder="Name of your venue"
                className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                           text-white placeholder-text-muted focus:border-primary focus:outline-none
                           transition-colors"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-text-secondary mb-2">
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min={1}
                placeholder="Maximum audience capacity"
                className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                           text-white placeholder-text-muted focus:border-primary focus:outline-none
                           transition-colors"
              />
            </div>
          </>
        )}

        {(type === "SUPERVISOR" || type === "MANAGER") && (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-text-secondary mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              maxLength={100}
              placeholder="Your company or agency name"
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                         text-white placeholder-text-muted focus:border-primary focus:outline-none
                         transition-colors"
            />
          </div>
        )}

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            maxLength={100}
            placeholder="City, State/Country"
            className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                       text-white placeholder-text-muted focus:border-primary focus:outline-none
                       transition-colors"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={500}
            placeholder="Tell us about yourself, your experience, and what you're looking for..."
            className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg
                       text-white placeholder-text-muted focus:border-primary focus:outline-none
                       transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-text-muted">
            Maximum 500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genreOptions.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors
                  ${selectedGenres.includes(genre)
                    ? "bg-primary text-white"
                    : "bg-surface-elevated text-text-secondary hover:text-white border border-border-subtle"
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-border text-text-secondary font-medium rounded-lg
                     hover:text-white hover:border-border transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg
                     hover:opacity-90 transition-opacity disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Profile"}
        </button>
      </div>
    </form>
  )
}
