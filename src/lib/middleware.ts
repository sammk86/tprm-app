import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UserRole } from '@/types'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
    companyId: string
  }
}

export async function withAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<NextResponse | AuthenticatedRequest> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Check if user role is allowed
    if (allowedRoles && !allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        { status: 403 }
      )
    }

    // Add user info to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: token.sub!,
      email: token.email!,
      role: token.role as UserRole,
      companyId: token.companyId as string,
    }

    return authenticatedRequest
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication error',
        },
      },
      { status: 500 }
    )
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest) => {
    return withAuth(request, allowedRoles)
  }
}

export function requireAdmin(request: NextRequest) {
  return requireRole(['ADMIN'])(request)
}

export function requireComplianceOfficer(request: NextRequest) {
  return requireRole(['ADMIN', 'COMPLIANCE_OFFICER'])(request)
}

export function requireProcurementManager(request: NextRequest) {
  return requireRole(['ADMIN', 'PROCUREMENT_MANAGER'])(request)
}
