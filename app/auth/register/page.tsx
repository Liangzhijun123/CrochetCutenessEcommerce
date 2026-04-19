"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { GoogleIcon } from "@/components/icons/google"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const lastSubmitTime = useRef(0)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "seller",
    terms: false,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (busy) {
      console.warn('⚠️ Form already submitting, ignoring duplicate submit');
      return;
    }

    const now = Date.now()
    if (now - lastSubmitTime.current < 5000) {
      console.warn('⚠️ Signup submitted too quickly, ignoring');
      setError('Please wait a few seconds before trying again.')
      return;
    }
    lastSubmitTime.current = now

    setError(null)

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.terms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setBusy(true)

    try {
      await signUp(formData.email, formData.password, formData.name, formData.role)
      // Seller signups go to application form; customers go to home
      if (formData.role === "seller") {
        router.push("/seller-application")
      } else {
        router.push("/")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again."
      setError(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleOAuthSignup = async (provider: "google") => {
    if (busy) return
    try {
      setBusy(true)
      setError(null)

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) throw oauthError
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} signup failed`
      setError(errorMessage)
      setBusy(false)
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignup("google")}
            disabled={busy}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>I want to</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "customer" })}
                className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                  formData.role === "customer"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={busy}
              >
                Shop & Buy
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">Browse and purchase items</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "seller" })}
                className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                  formData.role === "seller"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={busy}
              >
                Sell & Create
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">List your handmade items</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Minimum 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2.5 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.terms}
              onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
            />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                privacy policy
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
