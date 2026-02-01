"use client"

import React, { useEffect, useState } from "react"
import { Bell, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMessaging } from "@/context/messaging-context"
import { useAuth } from "@/context/auth-context"
import { formatDistanceToNow } from "date-fns"

interface MessageNotificationsProps {
  className?: string
}

export function MessageNotifications({ className }: MessageNotificationsProps) {
  const { user } = useAuth()
  const { conversations, unreadCount, refreshConversations } = useMessaging()
  const [isOpen, setIsOpen] = useState(false)

  // Get recent unread conversations
  const unreadConversations = conversations
    .filter(conv => conv.unreadCount && conv.unreadCount > 0)
    .slice(0, 5) // Show max 5 recent notifications

  // Refresh conversations periodically
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshConversations()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user, refreshConversations])

  if (!user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Messages</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {unreadConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new messages</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-1 p-2">
                  {unreadConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        // Navigate to messages page or open conversation
                        window.location.href = `/messages?conversation=${conversation.id}`
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={conversation.otherParticipant?.avatar} />
                          <AvatarFallback className="text-xs">
                            {conversation.otherParticipant?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.otherParticipant?.name || "Unknown User"}
                            </p>
                            <Badge variant="destructive" className="text-xs ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          </div>

                          {conversation.pattern && (
                            <p className="text-xs text-muted-foreground truncate">
                              About: {conversation.pattern.name}
                            </p>
                          )}

                          {conversation.lastMessageAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { 
                                addSuffix: true 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="border-t p-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center"
                onClick={() => {
                  window.location.href = "/messages"
                  setIsOpen(false)
                }}
              >
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}