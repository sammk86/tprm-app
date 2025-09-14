import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  description: z.string().optional(),
  category: z.enum(['GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL']).optional(),
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
  }).optional(),
  riskWeights: z.object({
    sections: z.record(z.string(), z.number()),
    questions: z.record(z.string(), z.number()),
  }).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/assessment-templates/[id] - Get specific assessment template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: params.id },
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
        assessments: {
          select: {
            id: true,
            status: true,
            riskScore: true,
            createdAt: true,
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Get latest 10 assessments
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment template not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Assessment template fetch error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching assessment template',
        },
      },
      { status: 500 }
    )
  }
}

// PUT /api/assessment-templates/[id] - Update assessment template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const authenticatedRequest = authResult as any

    const body = await request.json()
    
    // Validate request body
    const validatedData = updateTemplateSchema.parse(body)

    // Check if template exists
    const existingTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment template not found',
          },
        },
        { status: 404 }
      )
    }

    // Update template
    const template = await prisma.assessmentTemplate.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Assessment template update error:', error)

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
          message: 'An error occurred while updating assessment template',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/assessment-templates/[id] - Delete assessment template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Check if template exists
    const existingTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment template not found',
          },
        },
        { status: 404 }
      )
    }

    // Check if template has active assessments
    const activeAssessments = await prisma.assessment.count({
      where: {
        templateId: params.id,
        status: {
          in: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'],
        },
      },
    })

    if (activeAssessments > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_IN_USE',
            message: 'Cannot delete template with active assessments',
          },
        },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.assessmentTemplate.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Assessment template deleted successfully',
    })
  } catch (error) {
    console.error('Assessment template deletion error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting assessment template',
        },
      },
      { status: 500 }
    )
  }
}
