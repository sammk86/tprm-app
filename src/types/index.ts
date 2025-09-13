import { User, Company, Vendor, Assessment, AssessmentTemplate } from '@prisma/client'

export type { User, Company, Vendor, Assessment, AssessmentTemplate }

export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'PROCUREMENT_MANAGER'
export type CompanySize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
export type VendorType = 'GENERAL' | 'TECHNOLOGY' | 'FINANCIAL' | 'HEALTHCARE' | 'LEGAL' | 'CONSULTING' | 'OTHER'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type BusinessCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' | 'TERMINATED'
export type AssessmentCategory = 'GENERAL' | 'CYBERSECURITY' | 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'REPUTATIONAL'
export type AssessmentStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'

// Extended types with relations
export type UserWithCompany = User & {
  company: Company
}

export type VendorWithRelations = Vendor & {
  company: Company
  createdBy: User
  assessments: Assessment[]
}

export type AssessmentWithRelations = Assessment & {
  vendor: Vendor
  template: AssessmentTemplate
  assignedTo?: User | null
  createdBy: User
}

export type AssessmentTemplateWithCreator = AssessmentTemplate & {
  createdBy: User
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface CreateVendorData {
  name: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  address?: string
  description?: string
  services?: string[]
  vendorType: VendorType
  riskLevel?: RiskLevel
  businessCriticality?: BusinessCriticality
}

export interface CreateAssessmentData {
  vendorId: string
  templateId: string
  dueDate?: string
  assignedToId?: string
}

export interface UpdateAssessmentResponsesData {
  responses: Record<string, any>
}
