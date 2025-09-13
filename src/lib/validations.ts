import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  role: z.enum(['ADMIN', 'COMPLIANCE_OFFICER', 'PROCUREMENT_MANAGER']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// Vendor validation schemas
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).optional(),
  vendorType: z.enum(['GENERAL', 'TECHNOLOGY', 'FINANCIAL', 'HEALTHCARE', 'LEGAL', 'CONSULTING', 'OTHER']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  businessCriticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
})

export const updateVendorSchema = createVendorSchema.partial()

// Assessment validation schemas
export const createAssessmentSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
})

export const updateAssessmentResponsesSchema = z.object({
  responses: z.record(z.any()),
})

// Query parameter schemas
export const vendorQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'TERMINATED']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  vendorType: z.enum(['GENERAL', 'TECHNOLOGY', 'FINANCIAL', 'HEALTHCARE', 'LEGAL', 'CONSULTING', 'OTHER']).optional(),
})

export const assessmentQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED']).optional(),
  vendorId: z.string().optional(),
})
