import { ContractType } from "@prisma/client"

export interface ContractTemplate {
  type: ContractType
  name: string
  description: string
  estimatedTime: string
  category: "collaboration" | "performance" | "licensing" | "management" | "employment"
  requiredFields: ContractField[]
  optionalFields: ContractField[]
  defaultClauses: string[]
}

export interface ContractField {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "date" | "select" | "multiselect" | "percentage" | "money"
  placeholder?: string
  options?: string[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
  }
}

export interface ContractParty {
  personaId: string
  role: string
  obligations?: string[]
  compensation?: {
    type: "flat" | "percentage" | "hourly"
    amount: number
    currency: string
  }
}

export interface ContractTerms {
  startDate?: Date
  endDate?: Date
  duration?: string
  territory?: string[]
  exclusivity?: boolean
  deliverables?: string[]
  milestones?: ContractMilestone[]
}

export interface ContractMilestone {
  name: string
  description: string
  dueDate?: Date
  paymentAmount?: number
  trigger: string
}

export interface ContractPayment {
  totalAmount: number
  currency: string
  paymentSchedule: "upfront" | "milestone" | "completion" | "royalty"
  splits?: ContractSplit[]
}

export interface ContractSplit {
  partyId: string
  percentage: number
  role: string
}

// Contract Templates
export const ContractTemplates: Record<ContractType, ContractTemplate> = {
  PRODUCER_AGREEMENT: {
    type: "PRODUCER_AGREEMENT",
    name: "Producer Agreement",
    description: "Agreement between an artist and producer for beat/instrumental creation",
    estimatedTime: "3-5 min",
    category: "collaboration",
    requiredFields: [
      { name: "trackTitle", label: "Track Title", type: "text", validation: { required: true } },
      { name: "producerServices", label: "Producer Services", type: "textarea", placeholder: "Describe what the producer will create" },
      { name: "producerFee", label: "Producer Fee", type: "money" },
      { name: "royaltySplit", label: "Royalty Split (%)", type: "percentage", validation: { required: true, min: 0, max: 100 } },
    ],
    optionalFields: [
      { name: "creditLine", label: "Credit Line", type: "text", placeholder: "How producer will be credited" },
      { name: "deliveryDate", label: "Delivery Date", type: "date" },
      { name: "revisions", label: "Number of Revisions", type: "number", validation: { min: 0, max: 10 } },
    ],
    defaultClauses: [
      "Work for Hire: Producer acknowledges this is a work-for-hire arrangement.",
      "Ownership: Artist retains full ownership of the master recording.",
      "Credit: Producer will receive credit as specified in the agreement.",
    ],
  },

  SPLIT_SHEET: {
    type: "SPLIT_SHEET",
    name: "Split Sheet",
    description: "Document ownership percentages for songwriting and master recording",
    estimatedTime: "2-3 min",
    category: "collaboration",
    requiredFields: [
      { name: "trackTitle", label: "Track Title", type: "text", validation: { required: true } },
      { name: "masterSplits", label: "Master Recording Splits", type: "percentage" },
      { name: "publishingSplits", label: "Publishing Splits", type: "percentage" },
    ],
    optionalFields: [
      { name: "isrc", label: "ISRC Code", type: "text" },
      { name: "releaseDate", label: "Planned Release Date", type: "date" },
    ],
    defaultClauses: [
      "All parties agree to the ownership percentages as specified.",
      "Revenue will be distributed according to the agreed splits.",
      "Changes require written agreement from all parties.",
    ],
  },

  PERFORMANCE: {
    type: "PERFORMANCE",
    name: "Performance Contract",
    description: "Agreement for live performance at a venue or event",
    estimatedTime: "4-5 min",
    category: "performance",
    requiredFields: [
      { name: "eventName", label: "Event Name", type: "text", validation: { required: true } },
      { name: "performanceDate", label: "Performance Date", type: "date", validation: { required: true } },
      { name: "venue", label: "Venue", type: "text", validation: { required: true } },
      { name: "performanceFee", label: "Performance Fee", type: "money", validation: { required: true } },
      { name: "setLength", label: "Set Length (minutes)", type: "number", validation: { required: true } },
    ],
    optionalFields: [
      { name: "soundcheckTime", label: "Soundcheck Time", type: "text" },
      { name: "hospitality", label: "Hospitability Rider", type: "textarea" },
      { name: "technicalRider", label: "Technical Rider", type: "textarea" },
      { name: "merchTerms", label: "Merchandise Terms", type: "textarea" },
    ],
    defaultClauses: [
      "Payment due as specified in the payment terms.",
      "Cancellation policy applies as stated.",
      "Force majeure provisions included.",
    ],
  },

  WORK_FOR_HIRE: {
    type: "WORK_FOR_HIRE",
    name: "Work for Hire",
    description: "Agreement for specific work where client retains full ownership",
    estimatedTime: "3-4 min",
    category: "employment",
    requiredFields: [
      { name: "workDescription", label: "Work Description", type: "textarea", validation: { required: true } },
      { name: "deliverables", label: "Deliverables", type: "textarea", validation: { required: true } },
      { name: "fee", label: "Fee", type: "money", validation: { required: true } },
      { name: "deadline", label: "Deadline", type: "date", validation: { required: true } },
    ],
    optionalFields: [
      { name: "revisions", label: "Revision Rounds", type: "number", validation: { min: 0 } },
      { name: "usageRights", label: "Usage Rights", type: "textarea" },
    ],
    defaultClauses: [
      "This is a work-for-hire agreement.",
      "Client retains all ownership and rights to the work product.",
      "Contractor assigns all rights, title, and interest to the client.",
    ],
  },

  COLLABORATION: {
    type: "COLLABORATION",
    name: "Collaboration Agreement",
    description: "Agreement between multiple artists working together on a project",
    estimatedTime: "4-5 min",
    category: "collaboration",
    requiredFields: [
      { name: "projectName", label: "Project Name", type: "text", validation: { required: true } },
      { name: "projectDescription", label: "Project Description", type: "textarea" },
      { name: "ownershipSplit", label: "Ownership Split", type: "percentage", validation: { required: true } },
    ],
    optionalFields: [
      { name: "decisionMaking", label: "Decision Making Process", type: "textarea" },
      { name: "expenseSharing", label: "Expense Sharing", type: "textarea" },
      { name: "exitTerms", label: "Exit Terms", type: "textarea" },
    ],
    defaultClauses: [
      "All collaborators share ownership as specified.",
      "Major decisions require consensus.",
      "Revenue split according to ownership percentages.",
    ],
  },

  MANAGEMENT: {
    type: "MANAGEMENT",
    name: "Management Agreement",
    description: "Agreement between artist and manager for representation",
    estimatedTime: "5-7 min",
    category: "management",
    requiredFields: [
      { name: "termLength", label: "Term Length (months)", type: "number", validation: { required: true, min: 1 } },
      { name: "commissionRate", label: "Commission Rate (%)", type: "percentage", validation: { required: true, min: 0, max: 100 } },
      { name: "services", label: "Management Services", type: "textarea", validation: { required: true } },
    ],
    optionalFields: [
      { name: "keyManClause", label: "Key Person Clause", type: "textarea" },
      { name: "sunsetClause", label: "Sunset Period (months)", type: "number" },
      { name: "expenseAuthorization", label: "Expense Authorization Limit", type: "money" },
    ],
    defaultClauses: [
      "Manager will provide services as specified.",
      "Commission applies to gross income as defined.",
      "Term and termination conditions specified.",
    ],
  },

  SYNC_LICENSE: {
    type: "SYNC_LICENSE",
    name: "Sync License",
    description: "License for using music in film, TV, advertising, or games",
    estimatedTime: "4-6 min",
    category: "licensing",
    requiredFields: [
      { name: "projectTitle", label: "Project Title", type: "text", validation: { required: true } },
      { name: "mediaType", label: "Media Type", type: "select", options: ["Film", "TV Show", "Commercial", "Video Game", "Web", "Other"], validation: { required: true } },
      { name: "licenseFee", label: "License Fee", type: "money", validation: { required: true } },
      { name: "territory", label: "Territory", type: "multiselect", options: ["Worldwide", "North America", "Europe", "Asia", "Other"], validation: { required: true } },
      { name: "term", label: "License Term", type: "select", options: ["1 year", "2 years", "5 years", "10 years", "Perpetuity"], validation: { required: true } },
    ],
    optionalFields: [
      { name: "usage", label: "Usage Description", type: "textarea" },
      { name: "exclusivity", label: "Exclusivity", type: "select", options: ["Exclusive", "Non-exclusive"] },
      { name: "credits", label: "Credit Requirements", type: "textarea" },
    ],
    defaultClauses: [
      "License is granted for the specified media and territory only.",
      "License fee is as specified and payable upon execution.",
      "All rights not expressly granted are reserved.",
    ],
  },

  CUSTOM: {
    type: "CUSTOM",
    name: "Custom Agreement",
    description: "Create a custom agreement with your own terms",
    estimatedTime: "5-10 min",
    category: "collaboration",
    requiredFields: [
      { name: "agreementTitle", label: "Agreement Title", type: "text", validation: { required: true } },
      { name: "terms", label: "Terms & Conditions", type: "textarea", validation: { required: true } },
    ],
    optionalFields: [
      { name: "additionalClauses", label: "Additional Clauses", type: "textarea" },
    ],
    defaultClauses: [
      "Parties agree to the terms as specified.",
      "Agreement governed by applicable law.",
    ],
  },
}

export const ContractCategories = {
  collaboration: { label: "Collaboration", color: "#6C63FF" },
  performance: { label: "Performance", color: "#00D4AA" },
  licensing: { label: "Licensing", color: "#FF6B6B" },
  management: { label: "Management", color: "#FFB800" },
  employment: { label: "Employment", color: "#6E6E8A" },
}
