// WebSocket server for real-time messaging
import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import jwt from "jsonwebtoken"
import { getUserById } from "./local-storage-db"

export interface SocketUser {
  id: string
  name: string
  email: string
  role: string
}

export class WebSocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map() // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error("Authentication error: No token provided"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
        const user = getUserById(decoded.userId)
        
        if (!user) {
          return next(new Error("Authentication error: User not found"))
        }

        socket.data.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }

        next()
      } catch (error) {
        next(new Error("Authentication error: Invalid token"))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const user = socket.data.user as SocketUser
      console.log(`User ${user.name} (${user.id}) connected`)

      // Store user connection
      this.connectedUsers.set(user.id, socket.id)

      // Join user to their personal room
      socket.join(`user:${user.id}`)

      // Handle joining conversation rooms
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`)
        console.log(`User ${user.name} joined conversation ${conversationId}`)
      })

      // Handle leaving conversation rooms
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`User ${user.name} left conversation ${conversationId}`)
      })

      // Handle new message events
      socket.on("new_message", (data) => {
        // Broadcast to conversation room
        socket.to(`conversation:${data.conversationId}`).emit("message_received", data)
        
        // Send notification to recipient
        if (data.recipientId) {
          this.io.to(`user:${data.recipientId}`).emit("new_message_notification", {
            messageId: data.messageId,
            senderId: data.senderId,
            senderName: user.name,
            conversationId: data.conversationId,
            content: data.content,
            timestamp: data.timestamp
          })
        }
      })

      // Handle message read events
      socket.on("message_read", (data) => {
        // Notify sender that message was read
        socket.to(`conversation:${data.conversationId}`).emit("message_read_update", {
          messageId: data.messageId,
          readBy: user.id,
          readAt: data.readAt
        })
      })

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
          userId: user.id,
          userName: user.name,
          conversationId: data.conversationId
        })
      })

      socket.on("typing_stop", (data) => {
        socket.to(`conversation:${data.conversationId}`).emit("user_stopped_typing", {
          userId: user.id,
          conversationId: data.conversationId
        })
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User ${user.name} (${user.id}) disconnected`)
        this.connectedUsers.delete(user.id)
      })
    })
  }

  // Public methods for sending messages from API endpoints
  public sendMessageToConversation(conversationId: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit("message_received", data)
  }

  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit("notification", notification)
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer)
  }
  return wsServer
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer
}