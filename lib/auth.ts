import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// JWT secret - in production this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'creator' | 'admin'
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'creator' | 'admin'
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Get authenticated user from request
 */
export function getAuthenticatedUser(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromHeader(request)
  if (!token) {
    return null
  }
  return verifyToken(token)
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Role hierarchy for authorization
 */
export const ROLE_HIERARCHY = {
  admin: ['admin', 'creator', 'user'],
  creator: ['creator', 'user'],
  user: ['user']
}

/**
 * Check if user has permission based on role hierarchy
 */
export function hasPermission(userRole: 'user' | 'creator' | 'admin', requiredRole: 'user' | 'creator' | 'admin'): boolean {
  const allowedRoles = ROLE_HIERARCHY[userRole] || []
  return allowedRoles.includes(requiredRole)
}
