"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import ChatSystem from "@/components/chat/chat-system"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function MessagesContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Chat with sellers about products or contact admin for support
          </p>
        </div>
      </div>

      <ChatSystem initialSessionId={sessionId} />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          <div>
            <div className="h-7 w-32 rounded bg-muted animate-pulse mb-1" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-[600px] rounded-xl border bg-card animate-pulse" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}

