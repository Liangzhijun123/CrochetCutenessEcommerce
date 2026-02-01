"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessagingInterface } from "@/components/messaging/messaging-interface"
import { MessageNotifications } from "@/components/messaging/message-notifications"
import { useAuth } from "@/context/auth-context"
import { useMessaging } from "@/context/messaging-context"
import { MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const { user } = useAuth()
  const { conversations, unreadCount, isLoading } = useMessaging()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation")

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Messages</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to view and send messages
            </p>
            <div className="space-x-2">
              <Button asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with pattern creators and other users
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} unread
            </Badge>
          )}
          <MessageNotifications />
        </div>
      </div>

      {/* Main Content */}
      <Card className="min-h-[600px]">
        <CardContent className="p-0">
          {isLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : (
            <MessagingInterface className="h-[600px] border-0" />
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">How Messaging Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Pattern Discussions</h4>
              <p className="text-muted-foreground">
                Message pattern creators directly about their designs, ask questions, 
                and share your progress photos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Real-time Chat</h4>
              <p className="text-muted-foreground">
                Enjoy instant messaging with read receipts and attachment support 
                for sharing images and files.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Organized Conversations</h4>
              <p className="text-muted-foreground">
                All conversations are organized by pattern, making it easy to 
                find discussions about specific projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}