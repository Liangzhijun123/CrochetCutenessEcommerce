import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'creator' | 'admin'
}

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'creator' | 'admin'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getAuthenticatedUser(request: NextRequest): JWTPayload | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null

  const token = header.slice(7)
  return verifyToken(token)
}

export const ROLE_HIERARCHY = {
  admin: ['admin', 'creator', 'user'],
  creator: ['creator', 'user'],
  user: ['user']
}

export function hasPermission(
  userRole: 'user' | 'creator' | 'admin',
  requiredRole: 'user' | 'creator' | 'admin'
): boolean {
  return ROLE_HIERARCHY[userRole].includes(requiredRole)
}