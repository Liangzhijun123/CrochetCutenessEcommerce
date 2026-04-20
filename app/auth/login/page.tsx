"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { GoogleIcon } from "@/components/icons/google"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastSubmitTime = useRef(0)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submit
    if (isLoading) return

    // Debounce: block rapid re-submissions (5s window)
    const now = Date.now()
    if (now - lastSubmitTime.current < 5000) {
      setError('Please wait a few seconds before trying again.')
      return
    }
    lastSubmitTime.current = now

    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      // Redirect to home page after successful login
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials."
      setError(errorMessage)
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ OAuth Login Handler
  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setOAuthLoading(provider)
      setError(null)
      console.log(`🔐 Starting ${provider} OAuth login...`)

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://crochet-ecommerce-site.vercel.app/auth/callback",
        },
      })

      if (oauthError) {
        console.error(`❌ ${provider} OAuth error:`, oauthError)
        throw oauthError
      }

      console.log(`✅ ${provider} OAuth initiated`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login failed`
      setError(errorMessage)
      console.error(`❌ ${provider} OAuth failed:`, err)
      setOAuthLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* ✅ OAuth Login Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={oauthLoading !== null || isLoading}
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  {oauthLoading === "google" ? "Connecting to Google..." : "Login with Google"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="mt-8 max-w-md mx-auto p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Demo Accounts:</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Customer:</strong> user@example.com / password123
          </li>
          <li>
            <strong>Seller:</strong> seller@example.com / password123
          </li>
          <li>
            <strong>Admin:</strong> admin@example.com / password123
          </li>
        </ul>
      </div>
    </div>
  )
}
