import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createVendorSchema, vendorQuerySchema } from '@/lib/validations'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

// GET /api/vendors - List vendors with search and filtering
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
    const validatedQuery = vendorQuerySchema.parse(queryParams)
    const { page, limit, search, status, riskLevel, vendorType } = validatedQuery

    // Build where clause
    const where: any = {
      companyId: authenticatedRequest.user.companyId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (riskLevel) {
      where.riskLevel = riskLevel
    }

    if (vendorType) {
      where.vendorType = vendorType
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get vendors with pagination
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          vendorType: true,
          riskLevel: true,
          status: true,
          businessCriticality: true,
          createdAt: true,
        },
      }),
      prisma.vendor.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
  } catch (error) {
    console.error('Vendor listing error:', error)

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
          message: 'An error occurred while fetching vendors',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create new vendor
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
    const validatedData = createVendorSchema.parse(body)

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        ...validatedData,
        companyId: authenticatedRequest.user.companyId,
        createdById: authenticatedRequest.user.id,
      },
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

    return NextResponse.json(
      {
        success: true,
        vendor,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Vendor creation error:', error)

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
          message: 'An error occurred while creating vendor',
        },
      },
      { status: 500 }
    )
  }
}
