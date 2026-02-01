"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/context/auth-context"

interface UseWebSocketOptions {
  onMessageReceived?: (message: any) => void
  onNewMessageNotification?: (notification: any) => void
  onMessageReadUpdate?: (update: any) => void
  onUserTyping?: (data: any) => void
  onUserStoppedTyping?: (data: any) => void
  onNotification?: (notification: any) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    // Get token from localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      setConnectionError("No authentication token found")
      return
    }

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || window.location.origin, {
      auth: {
        token
      },
      transports: ["websocket", "polling"]
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on("connect", () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    // Message event handlers
    socket.on("message_received", (message) => {
      options.onMessageReceived?.(message)
    })

    socket.on("new_message_notification", (notification) => {
      options.onNewMessageNotification?.(notification)
    })

    socket.on("message_read_update", (update) => {
      options.onMessageReadUpdate?.(update)
    })

    socket.on("user_typing", (data) => {
      options.onUserTyping?.(data)
    })

    socket.on("user_stopped_typing", (data) => {
      options.onUserStoppedTyping?.(data)
    })

    socket.on("notification", (notification) => {
      options.onNotification?.(notification)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [user, options])

  // Helper functions
  const joinConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join_conversation", conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave_conversation", conversationId)
    }
  }

  const sendMessage = (data: {
    messageId: string
    conversationId: string
    recipientId: string
    content: string
    timestamp: string
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("new_message", {
        ...data,
        senderId: user?.id
      })
    }
  }

  const markMessageAsRead = (data: {
    messageId: string
    conversationId: string
    readAt: string
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message_read", data)
    }
  }

  const startTyping = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing_start", { conversationId })
    }
  }

  const stopTyping = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing_stop", { conversationId })
    }
  }

  return {
    isConnected,
    connectionError,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping
  }
}