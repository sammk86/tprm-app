import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateAssessmentResponsesSchema } from '@/lib/validations'
import { withAuth } from '@/lib/middleware'
import { calculateRiskScore } from '@/lib/risk-scoring'
import { z } from 'zod'

// GET /api/assessments/[id] - Get specific assessment
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
    const authenticatedRequest = authResult as any

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        vendor: {
          companyId: authenticatedRequest.user.companyId,
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            vendorType: true,
            riskLevel: true,
            businessCriticality: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            questions: true,
            riskWeights: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error('Assessment fetch error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching assessment',
        },
      },
      { status: 500 }
    )
  }
}

// PUT /api/assessments/[id] - Update assessment
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
    
    // Check if this is a response update
    if (body.responses) {
      return await updateAssessmentResponses(request, params, authenticatedRequest, body)
    }

    // Regular assessment update
    const updateData = {
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      assignedToId: body.assignedToId,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    )

    // Check if assessment exists and belongs to user's company
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        vendor: {
          companyId: authenticatedRequest.user.companyId,
        },
      },
    })

    if (!existingAssessment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          },
        },
        { status: 404 }
      )
    }

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            vendorType: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      assessment,
    })
  } catch (error) {
    console.error('Assessment update error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating assessment',
        },
      },
      { status: 500 }
    )
  }
}

// Helper function to update assessment responses
async function updateAssessmentResponses(
  request: NextRequest,
  params: { id: string },
  authenticatedRequest: any,
  body: any
) {
  try {
    // Validate request body
    const validatedData = updateAssessmentResponsesSchema.parse(body)
    const { responses } = validatedData

    // Get assessment with template
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        vendor: {
          companyId: authenticatedRequest.user.companyId,
        },
      },
      include: {
        template: {
          select: {
            questions: true,
            riskWeights: true,
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          },
        },
        { status: 404 }
      )
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(responses, assessment.template.riskWeights as any)

    // Update assessment with responses and risk score
    const updatedAssessment = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        responses,
        riskScore,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            vendorType: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      assessment: updatedAssessment,
    })
  } catch (error) {
    console.error('Assessment response update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid response data',
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
          message: 'An error occurred while updating assessment responses',
        },
      },
      { status: 500 }
    )
  }
}
