import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { getUserContracts } from "@/lib/actions/contracts"
import Link from "next/link"
import { ContractStatus } from "@prisma/client"

export const metadata: Metadata = {
  title: "Contracts - SoundGrid",
  description: "Manage your contracts",
}

const statusColors: Record<ContractStatus, string> = {
  DRAFT: "bg-text-muted",
  PENDING_SIGNATURE: "bg-yellow-500",
  PARTIALLY_SIGNED: "bg-blue-500",
  SIGNED: "bg-success",
  IN_ESCROW: "bg-primary",
  COMPLETED: "bg-success",
  CANCELLED: "bg-error",
  DISPUTED: "bg-error",
}

const statusLabels: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  PENDING_SIGNATURE: "Pending Signature",
  PARTIALLY_SIGNED: "Partially Signed",
  SIGNED: "Signed",
  IN_ESCROW: "In Escrow",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
}

export default async function ContractsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  const result = await getUserContracts(session.user.id)
  const contracts = result.contracts || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Contracts
          </h1>
          <p className="text-text-secondary">
            Manage your agreements and track their status
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          New Contract
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border-subtle p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-elevated rounded-full flex items-center justify-center">
            <DocumentIcon className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No contracts yet
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your first contract to start protecting your work and ensuring you get paid.
          </p>
          <Link
            href="/contracts/new"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Create Your First Contract
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-6 py-4 text-text-secondary font-medium text-sm">
                  Contract
                </th>
                <th className="text-left px-6 py-4 text-text-secondary font-medium text-sm">
                  Parties
                </th>
                <th className="text-left px-6 py-4 text-text-secondary font-medium text-sm">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-text-secondary font-medium text-sm">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-text-secondary font-medium text-sm">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-surface-elevated/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="block"
                    >
                      <p className="font-medium text-white hover:text-primary transition-colors">
                        {contract.title}
                      </p>
                      <p className="text-text-muted text-sm">
                        {contract.type.replace(/_/g, " ")}
                      </p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary text-sm">
                        {contract.partyA.displayName}
                      </span>
                      <span className="text-text-muted">→</span>
                      <span className="text-text-secondary text-sm">
                        {contract.partyB.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${statusColors[contract.status]}`}
                      />
                      <span className="text-text-secondary text-sm">
                        {statusLabels[contract.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white">
                      {contract.amount
                        ? `$${(contract.amount / 100).toFixed(2)}`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-muted text-sm">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
