"use client"

import { useState } from "react"
import { createVerificationSession, getVerificationStatus } from "@/lib/actions/identity"

interface IdentityVerificationProps {
  userId: string
  isVerified: boolean
  verifiedAt: Date | null
  hasSession: boolean
}

export function IdentityVerification({
  userId,
  isVerified,
  verifiedAt,
  hasSession,
}: IdentityVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(isVerified ? "verified" : hasSession ? "pending" : "none")

  const handleStartVerification = async () => {
    setIsLoading(true)
    setError(null)

    const result = await createVerificationSession(userId)

    if (result.success && result.url) {
      // Redirect to Stripe Identity
      window.location.href = result.url
    } else {
      setError(result.error || "Failed to start verification")
      setIsLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    setIsLoading(true)
    
    const result = await getVerificationStatus(userId)
    
    if (result.success) {
      setStatus(result.status || "none")
      if (result.verified) {
        setStatus("verified")
      }
    }
    
    setIsLoading(false)
  }

  if (status === "verified") {
    return (
      <div className="bg-surface rounded-lg border border-border-subtle p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-success/20 rounded-full flex items-center justify-center">
          <CheckIcon className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Identity Verified
        </h2>
        <p className="text-text-secondary mb-4">
          Your identity has been verified. You can now receive payments and create contracts.
        </p>
        {verifiedAt && (
          <p className="text-text-muted text-sm">
            Verified on {new Date(verifiedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6">
      <div className="space-y-6">
        {/* Why verify section */}
        <div className="pb-6 border-b border-border-subtle">
          <h3 className="text-lg font-medium text-white mb-3">
            Why verify your identity?
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Receive payments securely through Stripe</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Create and sign legally binding contracts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Build trust with other professionals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Required for escrow and payout features</span>
            </li>
          </ul>
        </div>

        {/* What's needed */}
        <div className="pb-6 border-b border-border-subtle">
          <h3 className="text-lg font-medium text-white mb-3">
            What you'll need
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                1
              </span>
              <span>A valid government-issued ID (Driver's License, Passport, or ID Card)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                2
              </span>
              <span>A selfie for identity matching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                3
              </span>
              <span>About 2-3 minutes of your time</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === "pending" ? (
            <>
              <button
                onClick={handleCheckStatus}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-surface-elevated text-white font-medium rounded-lg
                           border border-border hover:border-border-subtle transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Checking..." : "Check Verification Status"}
              </button>
              <button
                onClick={handleStartVerification}
                disabled={isLoading}
                className="w-full px-6 py-3 text-text-secondary hover:text-white text-sm transition-colors"
              >
                Start new verification
              </button>
            </>
          ) : (
            <button
              onClick={handleStartVerification}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg
                         hover:opacity-90 transition-opacity disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {isLoading ? "Starting..." : "Start Identity Verification"}
            </button>
          )}
        </div>

        <p className="text-center text-text-muted text-sm">
          Your information is securely processed by Stripe and never stored on our servers.
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
