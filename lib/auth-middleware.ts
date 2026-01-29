import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasPermission, JWTPayload } from './auth'

export interface AuthMiddlewareOptions {
  requiredRole?: 'user' | 'creator' | 'admin'
  allowedRoles?: ('user' | 'creator' | 'admin')[]
}

/**
 * Authentication middleware that verifies JWT tokens and checks user roles
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse> | NextResponse,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract and verify JWT token
      const user = getAuthenticatedUser(request)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required. Please provide a valid token.' },
          { status: 401 }
        )
      }

      // Check role-based authorization
      if (options.requiredRole && !hasPermission(user.role, options.requiredRole)) {
        return NextResponse.json(
          { error: `Access denied. ${options.requiredRole} role required.` },
          { status: 403 }
        )
      }

      if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: `Access denied. Allowed roles: ${options.allowedRoles.join(', ')}` },
          { status: 403 }
        )
      }

      // Call the actual handler with authenticated user
      return await handler(request, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware specifically for admin-only routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { requiredRole: 'admin' })
}

/**
 * Middleware for creator and admin routes
 */
export function withCreatorAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { allowedRoles: ['creator', 'admin'] })
}

/**
 * Middleware for any authenticated user
 */
export function withUserAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { requiredRole: 'user' })
}