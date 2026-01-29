"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'creator' | 'admin'
  allowedRoles?: ('user' | 'creator' | 'admin')[]
  redirectTo?: string
  showToast?: boolean
}

/**
 * Protected route component that handles authentication and authorization
 */
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRoles, 
  redirectTo = "/auth/login",
  showToast = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Wait for auth state to load

    // Check authentication
    if (!isAuthenticated || !user) {
      if (showToast) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this page.",
          variant: "destructive",
        })
      }
      router.push(redirectTo)
      return
    }

    // Check role-based authorization
    if (requiredRole && user.role !== requiredRole) {
      // Check role hierarchy
      const roleHierarchy = {
        admin: ['admin', 'creator', 'user'],
        creator: ['creator', 'user'],
        user: ['user']
      }
      
      const userPermissions = roleHierarchy[user.role as keyof typeof roleHierarchy] || []
      
      if (!userPermissions.includes(requiredRole)) {
        if (showToast) {
          toast({
            title: "Access denied",
            description: `This page requires ${requiredRole} privileges.`,
            variant: "destructive",
          })
        }
        router.push("/")
        return
      }
    }

    if (allowedRoles && !allowedRoles.includes(user.role as any)) {
      if (showToast) {
        toast({
          title: "Access denied",
          description: `Access restricted to: ${allowedRoles.join(', ')}`,
          variant: "destructive",
        })
      }
      router.push("/")
      return
    }
  }, [isAuthenticated, user, isLoading, requiredRole, allowedRoles, router, redirectTo, showToast])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null
  }

  // Check authorization before rendering
  if (requiredRole && user.role !== requiredRole) {
    const roleHierarchy = {
      admin: ['admin', 'creator', 'user'],
      creator: ['creator', 'user'],
      user: ['user']
    }
    
    const userPermissions = roleHierarchy[user.role as keyof typeof roleHierarchy] || []
    
    if (!userPermissions.includes(requiredRole)) {
      return null
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return null
  }

  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Specific protected route components for common use cases
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

export function CreatorRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['creator', 'admin']}>
      {children}
    </ProtectedRoute>
  )
}

export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      {children}
    </ProtectedRoute>
  )
}