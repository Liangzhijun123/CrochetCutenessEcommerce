"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  File, 
  Search,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react"
import { useMessaging } from "@/context/messaging-context"
import { useAuth } from "@/context/auth-context"
import { formatDistanceToNow } from "date-fns"

interface MessagingInterfaceProps {
  patternId?: string
  creatorId?: string
  className?: string
}

export function MessagingInterface({ patternId, creatorId, className }: MessagingInterfaceProps) {
  const { user } = useAuth()
  const {
    conversations,
    currentConversation,
    unreadCount,
    isLoading,
    error,
    isConnected,
    typingUsers,
    loadConversation,
    sendMessage,
    markAsRead,
    createPatternConversation,
    clearCurrentConversation,
    startTyping,
    stopTyping
  } = useMessaging()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const otherParticipant = conv.otherParticipant
    const pattern = conv.pattern
    
    return (
      otherParticipant?.name?.toLowerCase().includes(query) ||
      pattern?.name?.toLowerCase().includes(query) ||
      conv.title?.toLowerCase().includes(query)
    )
  })

  // Load conversation when selected
  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId)
    } else {
      clearCurrentConversation()
    }
  }, [selectedConversationId, loadConversation, clearCurrentConversation])

  // Auto-create pattern conversation if patternId and creatorId provided
  useEffect(() => {
    if (patternId && creatorId && user && creatorId !== user.id) {
      createPatternConversation(patternId, creatorId).then(conversation => {
        if (conversation) {
          setSelectedConversationId(conversation.conversation.id)
        }
      })
    }
  }, [patternId, creatorId, user, createPatternConversation])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleMessageInputChange = (value: string) => {
    setMessageText(value)
    
    // Handle typing indicators
    if (currentConversation && value.trim() && !isTyping) {
      setIsTyping(true)
      startTyping(currentConversation.conversation.id)
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (currentConversation && isTyping) {
        setIsTyping(false)
        stopTyping(currentConversation.conversation.id)
      }
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return

    // Stop typing indicator
    if (currentConversation && isTyping) {
      setIsTyping(false)
      stopTyping(currentConversation.conversation.id)
    }

    setIsSending(true)
    try {
      const message = await sendMessage({
        conversationId: selectedConversationId || undefined,
        content: messageText.trim(),
        patternId,
        recipientId: creatorId
      })

      if (message) {
        setMessageText("")
        // If this was a new conversation, select it
        if (!selectedConversationId && currentConversation) {
          setSelectedConversationId(currentConversation.conversation.id)
        }
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    await markAsRead(messageId, true) // Mark entire conversation as read
  }

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const getMessageStatus = (message: any) => {
    if (message.senderId !== user?.id) return null
    
    if (message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else {
      return <Check className="h-3 w-3 text-gray-400" />
    }
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to access messaging</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex h-[600px] border rounded-lg overflow-hidden ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Messages</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading && conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversationId === conversation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.otherParticipant?.avatar} />
                      <AvatarFallback>
                        {conversation.otherParticipant?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conversation.otherParticipant?.name || "Unknown User"}
                        </p>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.pattern && (
                        <p className="text-xs text-muted-foreground truncate">
                          About: {conversation.pattern.name}
                        </p>
                      )}
                      
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {conversation.unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentConversation.otherParticipant?.avatar} />
                    <AvatarFallback>
                      {currentConversation.otherParticipant?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">
                        {currentConversation.otherParticipant?.name || "Unknown User"}
                      </h4>
                      {isConnected ? (
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Offline</span>
                        </div>
                      )}
                    </div>
                    {currentConversation.pattern && (
                      <p className="text-sm text-muted-foreground">
                        Discussing: {currentConversation.pattern.name}
                      </p>
                    )}
                    {typingUsers.size > 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {Array.from(typingUsers).length === 1 ? "Typing..." : "Multiple people typing..."}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation.messages.map((message) => {
                  const isOwn = message.senderId === user.id
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachmentUrl && (
                          <div className="mt-2 p-2 rounded border bg-background/10">
                            <div className="flex items-center space-x-2">
                              {message.attachmentType === "image" ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                              <span className="text-xs">
                                {message.attachmentName || "Attachment"}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex items-center justify-between mt-2 ${
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          <span className="text-xs">
                            {formatMessageTime(message.sentAt)}
                          </span>
                          {getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => handleMessageInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isSending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}