import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateVendorSchema } from '@/lib/validations'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

// GET /api/vendors/[id] - Get specific vendor
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

    const vendor = await prisma.vendor.findFirst({
      where: {
        id: params.id,
        companyId: authenticatedRequest.user.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
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
        assessments: {
          select: {
            id: true,
            status: true,
            riskScore: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Get latest 5 assessments
        },
      },
    })

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vendor not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      vendor,
    })
  } catch (error) {
    console.error('Vendor fetch error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching vendor',
        },
      },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Update vendor
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
    const validatedData = updateVendorSchema.parse(body)

    // Check if vendor exists and belongs to user's company
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id: params.id,
        companyId: authenticatedRequest.user.companyId,
      },
    })

    if (!existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vendor not found',
          },
        },
        { status: 404 }
      )
    }

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        contactEmail: true,
        contactPhone: true,
        website: true,
        address: true,
        description: true,
        services: true,
        vendorType: true,
        riskLevel: true,
        businessCriticality: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      vendor,
    })
  } catch (error) {
    console.error('Vendor update error:', error)

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
          message: 'An error occurred while updating vendor',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete vendor (soft delete)
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
    const authenticatedRequest = authResult as any

    // Check if vendor exists and belongs to user's company
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id: params.id,
        companyId: authenticatedRequest.user.companyId,
      },
    })

    if (!existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vendor not found',
          },
        },
        { status: 404 }
      )
    }

    // Soft delete by setting status to TERMINATED
    await prisma.vendor.update({
      where: { id: params.id },
      data: {
        status: 'TERMINATED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully',
    })
  } catch (error) {
    console.error('Vendor deletion error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting vendor',
        },
      },
      { status: 500 }
    )
  }
}
