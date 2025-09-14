import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createAssessmentSchema, assessmentQuerySchema } from '@/lib/validations'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

// GET /api/assessments - List assessments with filtering
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await withAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const authenticatedRequest = authResult as any

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = assessmentQuerySchema.parse(queryParams)
    const { page, limit, status, vendorId } = validatedQuery

    // Build where clause
    const where: any = {
      vendor: {
        companyId: authenticatedRequest.user.companyId,
      },
    }

    if (status) {
      where.status = status
    }

    if (vendorId) {
      where.vendorId = vendorId
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get assessments with pagination
    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.assessment.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      assessments,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
  } catch (error) {
    console.error('Assessment listing error:', error)

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
          message: 'An error occurred while fetching assessments',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/assessments - Create new assessment
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
    const validatedData = createAssessmentSchema.parse(body)
    const { vendorId, templateId, dueDate, assignedToId } = validatedData

    // Verify vendor belongs to user's company
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        companyId: authenticatedRequest.user.companyId,
      },
    })

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found or access denied',
          },
        },
        { status: 404 }
      )
    }

    // Verify template exists and is active
    const template = await prisma.assessmentTemplate.findFirst({
      where: {
        id: templateId,
        isActive: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Assessment template not found or inactive',
          },
        },
        { status: 404 }
      )
    }

    // Verify assigned user exists and belongs to same company
    let assignedUser = null
    if (assignedToId) {
      assignedUser = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          companyId: authenticatedRequest.user.companyId,
        },
      })

      if (!assignedUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'Assigned user not found or access denied',
            },
          },
          { status: 404 }
        )
      }
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        vendorId,
        templateId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        createdById: authenticatedRequest.user.id,
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

    return NextResponse.json(
      {
        success: true,
        assessment,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Assessment creation error:', error)

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
          message: 'An error occurred while creating assessment',
        },
      },
      { status: 500 }
    )
  }
}
