import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.enum(['GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL']),
  questions: z.object({
    sections: z.array(z.object({
      title: z.string(),
      questions: z.array(z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(['yesno', 'select', 'multiselect', 'text', 'number', 'date']),
        options: z.array(z.string()).optional(),
        required: z.boolean().default(false),
      })),
    })),
  }),
  riskWeights: z.object({
    sections: z.record(z.string(), z.number()),
    questions: z.record(z.string(), z.number()),
  }),
  isActive: z.boolean().default(true),
})

const templateQuerySchema = z.object({
  category: z.enum(['GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL']).optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
})

// GET /api/assessment-templates - List assessment templates
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = templateQuerySchema.parse(queryParams)
    const { category, isActive } = validatedQuery

    // Build where clause
    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    // Get templates
    const templates = await prisma.assessmentTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error) {
    console.error('Assessment template listing error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching assessment templates',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/assessment-templates - Create new assessment template
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const authenticatedRequest = authResult as any

    const body = await request.json()
    
    // Validate request body
    const validatedData = createTemplateSchema.parse(body)

    // Create assessment template
    const template = await prisma.assessmentTemplate.create({
      data: {
        ...validatedData,
        createdById: authenticatedRequest.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        questions: true,
        riskWeights: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        template,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Assessment template creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating assessment template',
        },
      },
      { status: 500 }
    )
  }
}
