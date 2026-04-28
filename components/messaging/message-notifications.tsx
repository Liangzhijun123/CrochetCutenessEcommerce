"use client"

import React, { useEffect, useState, useCallback } from "react"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/context/auth-context"

interface ChatSession {
  id: string
  other_participant: { id: string; name: string; avatar: string } | null
  last_message: { content: string; created_at: string; sender_id: string } | null
  unread_count: number
  title: string | null
}

interface MessageNotificationsProps {
  className?: string
}

export function MessageNotifications({ className }: MessageNotificationsProps) {
  const { user, token } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const fetchSessions = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch("/api/chat/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch {
      // fail silently — badge just shows 0
    }
  }, [token])

  // Initial fetch
  useEffect(() => {
    if (user) fetchSessions()
  }, [user, fetchSessions])

  // Poll every 15 seconds for new messages
  useEffect(() => {
    if (!user) return
    const interval = setInterval(fetchSessions, 15000)
    return () => clearInterval(interval)
  }, [user, fetchSessions])

  // Refresh when popover opens
  useEffect(() => {
    if (isOpen) fetchSessions()
  }, [isOpen, fetchSessions])

  if (!user) return null

  const totalUnread = sessions.reduce((sum, s) => sum + (s.unread_count || 0), 0)
  const unreadSessions = sessions.filter((s) => s.unread_count > 0).slice(0, 5)

  function formatTime(iso: string) {
    const d = new Date(iso)
    const diffMs = Date.now() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative h-9 w-9 ${className}`}>
          <MessageCircle className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Messages</CardTitle>
              {totalUnread > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {totalUnread} unread
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {unreadSessions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new messages</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-1 p-2">
                  {unreadSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/messages?session=${session.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={session.other_participant?.avatar} />
                        <AvatarFallback className="text-xs">
                          {session.other_participant?.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-sm truncate">
                            {session.other_participant?.name || session.title || "Chat"}
                          </p>
                          <Badge variant="destructive" className="text-xs shrink-0 h-5 min-w-5 px-1">
                            {session.unread_count}
                          </Badge>
                        </div>
                        {session.last_message && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {session.last_message.content}
                          </p>
                        )}
                        {session.last_message?.created_at && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {formatTime(session.last_message.created_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="border-t p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/messages">View All Messages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}