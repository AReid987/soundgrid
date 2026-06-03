import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { ContractTemplates } from "@/lib/contracts/types"
import { ContractWizard } from "./contract-wizard"
import { ContractType } from "@prisma/client"

export const metadata: Metadata = {
  title: "Contract Wizard - SoundGrid",
  description: "Create a new contract",
}

const validTypes = Object.keys(ContractTemplates).map(t => t.toLowerCase())

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function ContractWizardPage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  const typeParam = params.type?.toUpperCase()
  if (!typeParam || !validTypes.includes(params.type?.toLowerCase() || "")) {
    redirect("/contracts/new")
  }

  const contractType = typeParam as ContractType
  const template = ContractTemplates[contractType]

  if (!template) {
    redirect("/contracts/new")
  }

  // Get user's personas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { personas: true },
  })

  if (!user?.personas || user.personas.length === 0) {
    redirect("/persona/select")
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-text-muted text-sm mb-2">
          Step 1 of 3
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">
          {template.name}
        </h1>
        <p className="text-text-secondary">
          {template.description}
        </p>
      </div>

      <ContractWizard
        userId={user.id}
        personas={user.personas}
        template={template}
      />
    </div>
  )
}
