"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useAuthApi } from "@/hooks/use-auth-fetch"
import { ProtectedRoute, AdminRoute, CreatorRoute } from "./protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

/**
 * Example component demonstrating authentication system usage
 */
export function AuthExample() {
  const { user, isAuthenticated, login, register, logout } = useAuth()
  const { get, post } = useAuthApi()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast({ title: "Login successful!" })
      }
    } catch (error) {
      toast({ title: "Login failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const success = await register(name, email, password, "user")
      if (success) {
        toast({ title: "Registration successful!" })
      }
    } catch (error) {
      toast({ title: "Registration failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const testProtectedEndpoint = async () => {
    try {
      const data = await get("/api/auth/profile")
      toast({ title: "Protected endpoint accessed successfully!" })
      console.log("Profile data:", data)
    } catch (error) {
      toast({ title: "Failed to access protected endpoint", variant: "destructive" })
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Example</CardTitle>
          <CardDescription>
            Test the JWT-based authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Name (for registration)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleLogin} 
              disabled={isLoading || !email || !password}
              className="flex-1"
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
            <Button 
              onClick={handleRegister} 
              disabled={isLoading || !name || !email || !password}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? "Loading..." : "Register"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Test accounts:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>user@example.com / password123 (User)</li>
              <li>seller@example.com / password123 (Creator)</li>
              <li>admin@example.com / password123 (Admin)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>
            You are logged in as: <Badge variant="secondary">{user?.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testProtectedEndpoint}>
              Test Protected Endpoint
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content available to all authenticated users */}
      <ProtectedRoute>
        <Card>
          <CardHeader>
            <CardTitle>User Content</CardTitle>
            <CardDescription>This content is visible to all authenticated users</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your user ID: {user?.id}</p>
            <p>Your email: {user?.email}</p>
          </CardContent>
        </Card>
      </ProtectedRoute>

      {/* Content available to creators and admins */}
      <CreatorRoute>
        <Card>
          <CardHeader>
            <CardTitle>Creator Content</CardTitle>
            <CardDescription>This content is only visible to creators and admins</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have creator privileges! You can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload patterns</li>
              <li>Manage your store</li>
              <li>View sales analytics</li>
            </ul>
          </CardContent>
        </Card>
      </CreatorRoute>

      {/* Content available to admins only */}
      <AdminRoute>
        <Card>
          <CardHeader>
            <CardTitle>Admin Content</CardTitle>
            <CardDescription>This content is only visible to administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have admin privileges! You can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Manage all users</li>
              <li>Approve seller applications</li>
              <li>Moderate content</li>
              <li>View platform analytics</li>
            </ul>
          </CardContent>
        </Card>
      </AdminRoute>
    </div>
  )
}