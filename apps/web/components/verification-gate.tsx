import Link from "next/link"

interface VerificationGateProps {
  isVerified: boolean
  children: React.ReactNode
  actionName?: string
}

export function VerificationGate({
  isVerified,
  children,
  actionName = "this action",
}: VerificationGateProps) {
  if (isVerified) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-surface-elevated border border-border rounded-lg p-6 shadow-lg max-w-sm text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
            <LockIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Verification Required
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            You need to complete identity verification before you can {actionName}.
          </p>
          <Link
            href="/verify/identity"
            className="inline-block px-4 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Verify Identity
          </Link>
        </div>
      </div>
    </div>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
