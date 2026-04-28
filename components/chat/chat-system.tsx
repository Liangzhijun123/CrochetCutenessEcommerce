"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  ShoppingBag,
  HeadphonesIcon,
  ArrowLeft,
  Package,
  Loader2,
  X,
  Check,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

// ─── Types ──────────────────────────────────────────────────

interface Seller {
  id: string
  shop_name: string
  shop_description: string
  user_id: string
  full_name: string
  avatar_url: string
  products: Product[]
}

interface Product {
  id: string
  title: string
  price: number
  image_url: string
  seller_id: string
}

interface ChatSession {
  id: string
  session_type: "seller_customer" | "admin_customer" | "admin_seller"
  customer_id: string | null
  seller_id: string | null
  admin_id: string | null
  product_id: string | null
  title: string | null
  status: "open" | "closed" | "pending"
  created_at: string
  updated_at: string
  other_participant: { id: string; name: string; avatar: string } | null
  product: { id: string; title: string; image_url: string } | null
  last_message: { content: string; created_at: string; sender_id: string } | null
  unread_count: number
}

interface ChatMessage {
  id: string
  session_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

function avatarInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ─── New Chat Wizard ─────────────────────────────────────────

type WizardStep = "choose_type" | "select_seller" | "select_product" | "write_message"

interface NewChatWizardProps {
  open: boolean
  onClose: () => void
  token: string
  userRole: string
  onSessionCreated: (session: ChatSession) => void
}

function NewChatWizard({ open, onClose, token, userRole, onSessionCreated }: NewChatWizardProps) {
  const [step, setStep] = useState<WizardStep>("choose_type")
  const [chatType, setChatType] = useState<"seller" | "admin" | null>(null)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [firstMessage, setFirstMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingSellers, setLoadingSellers] = useState(false)

  useEffect(() => {
    if (!open) {
      // Reset on close
      setStep("choose_type")
      setChatType(null)
      setSellers([])
      setSearchQuery("")
      setSelectedSeller(null)
      setSelectedProduct(null)
      setFirstMessage("")
    }
  }, [open])

  useEffect(() => {
    if (step === "select_seller") {
      loadSellers(searchQuery)
    }
  }, [step, searchQuery])

  const loadSellers = async (q: string) => {
    setLoadingSellers(true)
    try {
      const res = await fetch(`/api/chat/sellers${q ? `?q=${encodeURIComponent(q)}` : ""}`, {
        headers: authHeaders(token),
      })
      const data = await res.json()
      setSellers(data.sellers || [])
    } catch (e) {
      console.error("Failed to load sellers", e)
    } finally {
      setLoadingSellers(false)
    }
  }

  const handleChooseType = (type: "seller" | "admin") => {
    setChatType(type)
    if (type === "admin") {
      setStep("write_message")
    } else {
      setStep("select_seller")
    }
  }

  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller)
    setStep("select_product")
  }

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product)
    setStep("write_message")
  }

  const handleCreate = async () => {
    if (!token) return
    setLoading(true)
    try {
      let body: any

      if (chatType === "admin") {
        // Admin support: different type depending on role
        const type = userRole === "seller" ? "admin_seller" : "admin_customer"
        body = { type, first_message: firstMessage || undefined }
      } else {
        body = {
          type: "seller_customer",
          seller_id: selectedSeller!.id,
          product_id: selectedProduct?.id || undefined,
          title: selectedProduct ? `Re: ${selectedProduct.title}` : `Chat with ${selectedSeller!.shop_name}`,
          first_message: firstMessage || undefined,
        }
      }

      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.session) {
        onSessionCreated(data.session)
        onClose()
      }
    } catch (e) {
      console.error("Failed to create session", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "choose_type" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  if (step === "select_seller") setStep("choose_type")
                  else if (step === "select_product") setStep("select_seller")
                  else if (step === "write_message" && chatType === "seller") setStep("select_product")
                  else if (step === "write_message" && chatType === "admin") setStep("choose_type")
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            New Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Choose type */}
        {step === "choose_type" && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">Who would you like to contact?</p>
            <button
              className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              onClick={() => handleChooseType("seller")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <ShoppingBag className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="font-medium">Talk to a Seller</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ask about products, orders, or custom requests
                </p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              onClick={() => handleChooseType("admin")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <HeadphonesIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Contact Admin Support</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get help with account issues, disputes, or general support
                </p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Step 2: Select seller */}
        {step === "select_seller" && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">Search for a seller by shop name</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <ScrollArea className="h-64">
              {loadingSellers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sellers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {searchQuery ? "No sellers found" : "No sellers available"}
                </p>
              ) : (
                <div className="space-y-1 pr-3">
                  {sellers.map((seller) => (
                    <button
                      key={seller.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      onClick={() => handleSelectSeller(seller)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={seller.avatar_url} />
                        <AvatarFallback className="text-xs">{avatarInitials(seller.shop_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{seller.shop_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {seller.products.length} product{seller.products.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Step 3: Select product */}
        {step === "select_product" && selectedSeller && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              What would you like to ask about?
            </p>
            <ScrollArea className="h-64">
              <div className="space-y-1 pr-3">
                <button
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  onClick={() => handleSelectProduct(null)}
                >
                  <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">General Inquiry</p>
                    <p className="text-xs text-muted-foreground">Ask a general question</p>
                  </div>
                </button>

                {selectedSeller.products.map((product) => (
                  <button
                    key={product.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground">${product.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 4: Write first message */}
        {step === "write_message" && (
          <div className="space-y-4 pt-2">
            {/* Context summary */}
            {chatType === "seller" && selectedSeller && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={selectedSeller.avatar_url} />
                  <AvatarFallback className="text-xs">{avatarInitials(selectedSeller.shop_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="font-medium">{selectedSeller.shop_name}</span>
                  {selectedProduct && (
                    <span className="text-muted-foreground truncate"> · {selectedProduct.title}</span>
                  )}
                </div>
              </div>
            )}
            {chatType === "admin" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">
                <HeadphonesIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="font-medium">Admin Support</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message (optional)</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type your first message..."
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                autoFocus
              />
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><MessageCircle className="h-4 w-4 mr-2" /> Start Conversation</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Conversation Sidebar ─────────────────────────────────────

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  currentUserId: string
  onSelect: (session: ChatSession) => void
  onNewChat: () => void
  loading: boolean
}

function ConversationSidebar({
  sessions,
  activeSessionId,
  currentUserId,
  onSelect,
  onNewChat,
  loading,
}: SidebarProps) {
  const [filter, setFilter] = useState("")

  const filtered = sessions.filter((s) => {
    if (!filter) return true
    const name = s.other_participant?.name?.toLowerCase() || ""
    const product = s.product?.title?.toLowerCase() || ""
    const q = filter.toLowerCase()
    return name.includes(q) || product.includes(q)
  })

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Messages</h2>
          <Button size="sm" onClick={onNewChat} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter ? "No conversations found" : "No conversations yet"}
            </p>
            {!filter && (
              <Button variant="link" size="sm" onClick={onNewChat} className="mt-1">
                Start one
              </Button>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((session) => (
              <ConversationItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                currentUserId={currentUserId}
                onClick={() => onSelect(session)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function ConversationItem({
  session,
  isActive,
  currentUserId,
  onClick,
}: {
  session: ChatSession
  isActive: boolean
  currentUserId: string
  onClick: () => void
}) {
  const name = session.other_participant?.name || "Unknown"
  const avatar = session.other_participant?.avatar || ""
  const lastMsg = session.last_message
  const isFromMe = lastMsg?.sender_id === currentUserId

  const typeLabel =
    session.session_type === "seller_customer"
      ? "Seller"
      : session.session_type === "admin_customer"
        ? "Support"
        : "Admin"

  const typeBadgeColor =
    session.session_type === "seller_customer"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"

  return (
    <button
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left",
        isActive && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-xs">{avatarInitials(name)}</AvatarFallback>
        </Avatar>
        {session.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">
            {session.unread_count > 9 ? "9+" : session.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", typeBadgeColor)}>
            {typeLabel}
          </span>
          <span className="font-medium text-sm truncate">{name}</span>
          {lastMsg && (
            <span className="ml-auto text-[11px] text-muted-foreground flex-shrink-0">
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        {session.product && (
          <p className="text-[11px] text-muted-foreground truncate mb-0.5">
            Re: {session.product.title}
          </p>
        )}
        {lastMsg && (
          <p className={cn("text-xs truncate", session.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
            {isFromMe ? "You: " : ""}{lastMsg.content}
          </p>
        )}
      </div>
    </button>
  )
}

// ─── Chat Window ─────────────────────────────────────────────

interface ChatWindowProps {
  session: ChatSession
  token: string
  currentUserId: string
  onSessionUpdate: (session: ChatSession) => void
}

function ChatWindow({ session, token, currentUserId, onSessionUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages?session_id=${session.id}`, {
        headers: authHeaders(token),
      })
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        // If there were unread messages, update the session's unread count
        if (session.unread_count > 0) {
          onSessionUpdate({ ...session, unread_count: 0 })
        }
      }
    } catch (e) {
      console.error("Failed to fetch messages", e)
    }
  }, [session.id, token])

  useEffect(() => {
    setLoadingMessages(true)
    fetchMessages().finally(() => setLoadingMessages(false))

    // Poll for new messages every 4 seconds
    pollingRef.current = setInterval(fetchMessages, 4000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [session.id, fetchMessages])

  // Also subscribe via Supabase realtime if available
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new as ChatMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending || session.status === "closed") return

    setSending(true)
    setInput("")

    // Optimistically add the message
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await fetch(`/api/chat/sessions/${session.id}`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.message) {
        // Replace temp message with real one
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)))
      }
    } catch (e) {
      console.error("Failed to send message", e)
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const name = session.other_participant?.name || "Unknown"
  const avatar = session.other_participant?.avatar || ""

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-sm">{avatarInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{name}</p>
          {session.product && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Package className="h-3 w-3 flex-shrink-0" />
              {session.product.title}
            </p>
          )}
        </div>
        {session.status === "open" && (
          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex-shrink-0">
            Active
          </Badge>
        )}
        {session.status === "closed" && (
          <Badge variant="secondary" className="text-[10px] flex-shrink-0">Closed</Badge>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingMessages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUserId
            const prevMsg = messages[i - 1]
            const showAvatar = !isMe && (i === 0 || prevMsg?.sender_id !== msg.sender_id)

            return (
              <div
                key={msg.id}
                className={cn("flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}
              >
                {!isMe && (
                  <div className="flex-shrink-0 w-7">
                    {showAvatar && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-[10px]">{avatarInitials(name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  <p className="break-words leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isMe ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(msg.created_at)}
                    {isMe && msg.is_read && (
                      <Check className="inline h-3 w-3 ml-1 -mt-0.5" />
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex items-end gap-2 flex-shrink-0">
        {session.status === "closed" ? (
          <p className="text-sm text-muted-foreground text-center w-full py-1">
            This conversation is closed
          </p>
        ) : (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              rows={1}
            />
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0 rounded-xl"
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Chat System ─────────────────────────────────────────

interface ChatSystemProps {
  initialSessionId?: string | null
}

export default function ChatSystem({ initialSessionId }: ChatSystemProps) {
  const { user, token, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch("/api/chat/sessions", { headers: authHeaders(token) })
      const data = await res.json()
      if (data.sessions) {
        setSessions(data.sessions)
        // If there's an initialSessionId, activate that session
        if (initialSessionId) {
          const target = data.sessions.find((s: ChatSession) => s.id === initialSessionId)
          if (target) setActiveSession(target)
        }
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e)
    }
  }, [token, initialSessionId])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    setLoadingSessions(true)
    fetchSessions().finally(() => setLoadingSessions(false))

    // Poll sessions list every 10s to catch new conversations
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, token, fetchSessions])

  const handleSelectSession = (session: ChatSession) => {
    setActiveSession(session)
    setShowSidebar(false)
  }

  const handleSessionCreated = (session: ChatSession) => {
    setSessions((prev) => {
      const exists = prev.find((s) => s.id === session.id)
      if (exists) return prev.map((s) => (s.id === session.id ? session : s))
      return [session, ...prev]
    })
    setActiveSession(session)
    setShowSidebar(false)
  }

  const handleSessionUpdate = (updated: ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    if (activeSession?.id === updated.id) setActiveSession(updated)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
        <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg mb-2">Sign in to use Chat</h3>
        <p className="text-sm text-muted-foreground">You need to be logged in to send messages.</p>
      </div>
    )
  }

  const totalUnread = sessions.reduce((sum, s) => sum + s.unread_count, 0)

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] max-h-[750px] overflow-hidden rounded-xl border bg-card">
      {/* Sidebar — always visible on desktop, toggle on mobile */}
      <div
        className={cn(
          "w-full md:w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col",
          "md:block",
          showSidebar ? "flex" : "hidden md:flex"
        )}
      >
        <ConversationSidebar
          sessions={sessions}
          activeSessionId={activeSession?.id || null}
          currentUserId={user?.id || ""}
          onSelect={handleSelectSession}
          onNewChat={() => setShowNewChat(true)}
          loading={loadingSessions}
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-border" />

      {/* Chat Window */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showSidebar ? "hidden md:flex" : "flex"
        )}
      >
        {activeSession ? (
          <>
            {/* Mobile back button */}
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border-b"
              onClick={() => setShowSidebar(true)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to messages
            </button>
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                key={activeSession.id}
                session={activeSession}
                token={token!}
                currentUserId={user?.id || ""}
                onSessionUpdate={handleSessionUpdate}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="relative mb-4">
              <MessageCircle className="h-14 w-14 text-muted-foreground/30" />
              {totalUnread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center text-[10px]">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2">Your Messages</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Select a conversation from the list or start a new one to chat with sellers or get support.
            </p>
            <Button onClick={() => setShowNewChat(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Wizard */}
      <NewChatWizard
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        token={token!}
        userRole={user?.role || "user"}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  )
}
