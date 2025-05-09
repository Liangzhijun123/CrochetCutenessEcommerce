"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll receive our newsletter with the latest crochet patterns and promotions.",
      })
      setEmail("")
    }
  }

  return (
    <section className="w-full py-12 md:py-24 bg-rose-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Join Our Crochet Community</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Subscribe to our newsletter for exclusive patterns, tips, and special offers.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full bg-white"
                required
              />
              <Button type="submit" className="rounded-full bg-rose-500 hover:bg-rose-600">
                <Send className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
