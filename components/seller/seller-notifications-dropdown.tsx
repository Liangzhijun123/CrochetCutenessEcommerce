"use client"

import { useState, useEffect } from "react"
import { Bell, Package, DollarSign, MessageSquare, AlertCircle, CheckCircle, Star, Upload } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

interface Notification {
  id: string
  type: "order" | "payment" | "message" | "alert" | "success" | "product" | "application"
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

export default function SellerNotificationsDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load notifications based on seller activity
    loadSellerNotifications()
  }, [user])

  const loadSellerNotifications = () => {
    if (!user) return

    const mockNotifications: Notification[] = []

    // Application approved notification
    if (user.sellerApplication?.status === "approved") {
      mockNotifications.push({
        id: "app-approved",
        type: "application",
        title: "Application Approved!",
        message: "Congratulations! Your seller application has been approved.",
        time: "2 hours ago",
        read: false,
        link: "/seller-dashboard"
      })
    }

    // Sample notifications for active sellers
    if (user.role === "seller") {
      mockNotifications.push(
        {
          id: "1",
          type: "order",
          title: "New Order",
          message: "You have a new order #1234",
          time: "5 min ago",
          read: false,
          link: "/seller-dashboard?tab=orders"
        },
        {
          id: "2",
          type: "payment",
          title: "Payment Received",
          message: "$45.99 has been added to your balance",
          time: "1 hour ago",
          read: false,
          link: "/seller-dashboard?tab=earnings"
        },
        {
          id: "3",
          type: "product",
          title: "Product Uploaded",
          message: "Your 'Cute Bunny Amigurumi' is now live in the shop",
          time: "3 hours ago",
          read: true,
          link: "/shop"
        },
        {
          id: "4",
          type: "message",
          title: "New Message",
          message: "Customer inquiry about Bunny Pattern",
          time: "6 hours ago",
          read: true,
          link: "/messages"
        },
        {
          id: "5",
          type: "success",
          title: "Earnings Milestone",
          message: "You've earned $500 total! Keep up the great work.",
          time: "1 day ago",
          read: true,
          link: "/seller-dashboard?tab=earnings"
        }
      )
    }

    setNotifications(mockNotifications)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "alert":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "product":
        return <Upload className="h-4 w-4 text-blue-500" />
      case "application":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || "#"}
                  onClick={() => markAsRead(notification.id)}
                  className={`block p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Link href="/seller-dashboard">
            <Button variant="ghost" className="w-full text-sm">
              View Dashboard
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
