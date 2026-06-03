"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Persona } from "@prisma/client"
import { ContractTemplate } from "@/lib/contracts/types"
import { createContract } from "@/lib/actions/contracts"

interface ContractWizardProps {
  userId: string
  personas: Persona[]
  template: ContractTemplate
}

interface FormData {
  title: string
  description: string
  partyAId: string
  partyBId: string
  partyBName: string
  amount: string
  currency: string
  [key: string]: string
}

export function ContractWizard({ userId, personas, template }: ContractWizardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const initialFields: Record<string, string> = {}
  template.requiredFields.forEach(field => {
    initialFields[field.name] = ""
  })
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    partyAId: personas[0]?.id || "",
    partyBId: "",
    partyBName: "",
    amount: "",
    currency: "USD",
    ...initialFields,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Create a basic title from track/project name if not provided
    const title = formData.title || 
      formData.trackTitle || 
      formData.projectName || 
      formData.eventName ||
      `${template.name} - ${new Date().toLocaleDateString()}`

    const result = await createContract(userId, {
      type: template.type,
      title,
      description: formData.description,
      partyAId: formData.partyAId,
      partyBId: formData.partyBId || formData.partyBName,
      amount: formData.amount ? parseInt(formData.amount, 10) * 100 : undefined,
      currency: formData.currency,
      terms: {
        ...template.requiredFields.reduce((acc, field) => {
          acc[field.name] = formData[field.name]
          return acc
        }, {} as Record<string, string>),
      },
    })

    if (result.success) {
      router.push("/contracts")
    } else {
      setError(result.error || "Failed to create contract")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Parties */}
      <div className="bg-surface rounded-lg border border-border-subtle p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Parties</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              You (as)
            </label>
            <select
              name="partyAId"
              value={formData.partyAId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white"
              required
            >
              {personas.map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.displayName} ({persona.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Counterparty
            </label>
            <input
              type="text"
              name="partyBName"
              value={formData.partyBName}
              onChange={handleChange}
              placeholder="Search by name or email"
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted"
              required
            />
            <p className="text-text-muted text-xs mt-1">
              They will receive an invitation to review and sign
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Contract Details */}
      <div className="bg-surface rounded-lg border border-border-subtle p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Contract Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={`e.g., ${template.name} Agreement`}
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the agreement"
              className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted resize-none"
            />
          </div>

          {/* Template-specific required fields */}
          {template.requiredFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {field.label}
                {field.validation?.required && <span className="text-error">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted resize-none"
                  required={field.validation?.required}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white"
                  required={field.validation?.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "money" ? (
                <div className="flex gap-2">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white"
                  >
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                    <option value="GBP">£</option>
                  </select>
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    min={field.validation?.min}
                    max={field.validation?.max}
                    className="flex-1 px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted"
                    required={field.validation?.required}
                  />
                </div>
              ) : (
                <input
                  type={field.type === "percentage" ? "number" : field.type === "date" ? "date" : "text"}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-lg text-white placeholder-text-muted"
                  required={field.validation?.required}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-border text-text-secondary font-medium rounded-lg hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Contract"}
        </button>
      </div>
    </form>
  )
}
