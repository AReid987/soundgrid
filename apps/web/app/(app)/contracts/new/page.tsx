import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { ContractTemplates, ContractCategories } from "@/lib/contracts/types"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Create Contract - SoundGrid",
  description: "Create a new music industry contract",
}

export default async function NewContractPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { personas: true },
  })

  if (!user?.personas || user.personas.length === 0) {
    redirect("/persona/select")
  }

  // Group templates by category
  const templatesByCategory = Object.values(ContractTemplates).reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, typeof ContractTemplates[keyof typeof ContractTemplates][]>)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create a Contract
        </h1>
        <p className="text-text-secondary">
          Choose a contract type to get started. Each template is tailored for specific music industry agreements.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(templatesByCategory).map(([category, templates]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ContractCategories[category as keyof typeof ContractCategories].color }}
              />
              <h2 className="text-lg font-semibold text-white">
                {ContractCategories[category as keyof typeof ContractCategories].label}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Link
                  key={template.type}
                  href={`/contracts/new/wizard?type=${template.type.toLowerCase()}`}
                  className="block p-6 bg-surface rounded-lg border border-border-subtle hover:border-primary transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <span className="text-xs text-text-muted">
                      {template.estimatedTime}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {template.requiredFields.length} required fields
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-surface-elevated rounded-lg border border-border-subtle">
        <p className="text-text-secondary text-sm">
          <span className="text-white font-medium">Tip:</span> Not sure which contract to use? 
          Start with a { ContractTemplates.PRODUCER_AGREEMENT.name } for beat collaborations or a { ContractTemplates.SPLIT_SHEET.name } for documenting ownership splits.
        </p>
      </div>
    </div>
  )
}
