"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { useWebSocket } from "@/hooks/use-websocket"
import { toast } from "@/hooks/use-toast"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  content: string
  attachmentUrl?: string
  attachmentType?: "image" | "file"
  attachmentName?: string
  isRead: boolean
  sentAt: string
  readAt?: string
}

export interface Conversation {
  id: string
  patternId?: string
  participantIds: string[]
  lastMessageId?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  title?: string
  isActive: boolean
  participants?: any[]
  otherParticipant?: any
  pattern?: any
  unreadCount?: number
}

export interface ConversationDetails {
  conversation: Conversation
  messages: Message[]
  participants: any[]
  otherParticipant?: any
  pattern?: any
  unreadCount: number
}

interface MessagingContextType {
  conversations: Conversation[]
  currentConversation: ConversationDetails | null
  unreadCount: number
  isLoading: boolean
  error: string | null
  isConnected: boolean
  typingUsers: Set<string>
  
  // Actions
  loadConversations: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  sendMessage: (data: {
    conversationId?: string
    recipientId?: string
    content: string
    patternId?: string
    attachmentUrl?: string
    attachmentType?: "image" | "file"
    attachmentName?: string
  }) => Promise<Message | null>
  markAsRead: (messageId: string, markConversation?: boolean) => Promise<void>
  createPatternConversation: (patternId: string, creatorId: string) => Promise<ConversationDetails | null>
  clearCurrentConversation: () => void
  refreshConversations: () => Promise<void>
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ConversationDetails | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // WebSocket integration
  const {
    isConnected,
    joinConversation: wsJoinConversation,
    leaveConversation: wsLeaveConversation,
    sendMessage: wsSendMessage,
    markMessageAsRead: wsMarkMessageAsRead,
    startTyping: wsStartTyping,
    stopTyping: wsStopTyping
  } = useWebSocket({
    onMessageReceived: (message) => {
      // Update current conversation if it matches
      if (currentConversation && message.conversationId === currentConversation.conversation.id) {
        setCurrentConversation(prev => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, message]
          }
        })
      }
      
      // Refresh conversations to update last message
      loadConversations()
    },
    onNewMessageNotification: (notification) => {
      // Show toast notification for new messages
      toast({
        title: `New message from ${notification.senderName}`,
        description: notification.content.length > 50 
          ? notification.content.substring(0, 50) + "..." 
          : notification.content,
        duration: 5000
      })
      
      // Refresh conversations and unread count
      loadConversations()
    },
    onMessageReadUpdate: (update) => {
      // Update message read status in current conversation
      if (currentConversation && update.conversationId === currentConversation.conversation.id) {
        setCurrentConversation(prev => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === update.messageId 
                ? { ...msg, isRead: true, readAt: update.readAt }
                : msg
            )
          }
        })
      }
    },
    onUserTyping: (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversation.id) {
        setTypingUsers(prev => new Set([...prev, data.userId]))
      }
    },
    onUserStoppedTyping: (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversation.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    }
  })

  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/messages/conversations", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to load conversations")
      }

      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations || [])
        setUnreadCount(data.totalUnreadCount || 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to load conversation")
      }

      const data = await response.json()
      if (data.success) {
        setCurrentConversation(data.conversation)
        
        // Join WebSocket room for real-time updates
        wsJoinConversation(conversationId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation")
    } finally {
      setIsLoading(false)
    }
  }, [user, wsJoinConversation])

  const sendMessage = useCallback(async (data: {
    conversationId?: string
    recipientId?: string
    content: string
    patternId?: string
    attachmentUrl?: string
    attachmentType?: "image" | "file"
    attachmentName?: string
  }): Promise<Message | null> => {
    if (!user) return null

    try {
      setError(null)

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const result = await response.json()
      if (result.success) {
        // Update current conversation if it matches
        if (result.conversation && currentConversation?.conversation.id === result.conversation.conversation.id) {
          setCurrentConversation(result.conversation)
        }
        
        // Send WebSocket message for real-time updates
        if (result.message && isConnected) {
          wsSendMessage({
            messageId: result.message.id,
            conversationId: result.message.conversationId,
            recipientId: data.recipientId || result.conversation?.otherParticipant?.id || "",
            content: result.message.content,
            timestamp: result.message.sentAt
          })
        }
        
        // Refresh conversations list
        await loadConversations()
        
        return result.message
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
      return null
    }
  }, [user, currentConversation, loadConversations, isConnected, wsSendMessage])

  const markAsRead = useCallback(async (messageId: string, markConversation = false) => {
    if (!user) return

    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ markConversation })
      })

      if (!response.ok) {
        throw new Error("Failed to mark as read")
      }

      // Send WebSocket update
      if (isConnected) {
        wsMarkMessageAsRead({
          messageId,
          conversationId: currentConversation?.conversation.id || "",
          readAt: new Date().toISOString()
        })
      }

      // Refresh current conversation and conversations list
      if (currentConversation) {
        await loadConversation(currentConversation.conversation.id)
      }
      await loadConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read")
    }
  }, [user, currentConversation, loadConversation, loadConversations, isConnected, wsMarkMessageAsRead])

  const createPatternConversation = useCallback(async (patternId: string, creatorId: string): Promise<ConversationDetails | null> => {
    if (!user) return null

    try {
      setError(null)

      const response = await fetch(`/api/messages/pattern/${patternId}?creatorId=${creatorId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to create pattern conversation")
      }

      const data = await response.json()
      if (data.success && data.conversation) {
        await loadConversations() // Refresh conversations list
        return data.conversation
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pattern conversation")
      return null
    }
  }, [user, loadConversations])

  const clearCurrentConversation = useCallback(() => {
    // Leave WebSocket room when clearing conversation
    if (currentConversation) {
      wsLeaveConversation(currentConversation.conversation.id)
    }
    setCurrentConversation(null)
    setTypingUsers(new Set())
  }, [currentConversation, wsLeaveConversation])

  const refreshConversations = useCallback(async () => {
    await loadConversations()
  }, [loadConversations])

  // Typing indicator functions
  const startTyping = useCallback((conversationId: string) => {
    if (isConnected) {
      wsStartTyping(conversationId)
    }
  }, [isConnected, wsStartTyping])

  const stopTyping = useCallback((conversationId: string) => {
    if (isConnected) {
      wsStopTyping(conversationId)
    }
  }, [isConnected, wsStopTyping])

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations()
    } else {
      setConversations([])
      setCurrentConversation(null)
      setUnreadCount(0)
    }
  }, [user, loadConversations])

  const value: MessagingContextType = {
    conversations,
    currentConversation,
    unreadCount,
    isLoading,
    error,
    isConnected,
    typingUsers,
    loadConversations,
    loadConversation,
    sendMessage,
    markAsRead,
    createPatternConversation,
    clearCurrentConversation,
    refreshConversations,
    startTyping,
    stopTyping
  }

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }
  return context
}