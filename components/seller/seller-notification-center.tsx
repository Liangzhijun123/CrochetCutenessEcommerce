"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Mail, 
  DollarSign,
  Package,
  Star,
  Clock
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

type NotificationType = 
  | "application_status"
  | "payment"
  | "order"
  | "review"
  | "system"
  | "verification"

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
  priority: "low" | "medium" | "high"
}

export default function SellerNotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications for the seller
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    // Mock notifications - in a real app, this would come from an API
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "application_status",
        title: "Application Approved!",
        message: "Congratulations! Your seller application has been approved. You can now start listing your patterns.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        actionUrl: "/seller-onboarding",
        actionText: "Complete Setup",
        priority: "high"
      },
      {
        id: "2",
        type: "payment",
        title: "Weekly Payment Processed",
        message: "Your weekly payment of $127.50 has been processed and will arrive in your account within 2-3 business days.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        priority: "medium"
      },
      {
        id: "3",
        type: "order",
        title: "New Pattern Purchase",
        message: "Your 'Cute Bunny Amigurumi' pattern was purchased by Sarah M. You earned $21.25 from this sale.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        read: false,
        actionUrl: "/seller-dashboard/orders",
        actionText: "View Order",
        priority: "medium"
      },
      {
        id: "4",
        type: "review",
        title: "New 5-Star Review",
        message: "You received a 5-star review on your 'Cozy Baby Blanket' pattern from Jennifer K.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        read: false,
        actionUrl: "/seller-dashboard/reviews",
        actionText: "View Review",
        priority: "low"
      },
      {
        id: "5",
        type: "verification",
        title: "Verification Level Upgraded",
        message: "Your account has been upgraded to Verified status. You now have access to premium features.",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        read: true,
        priority: "high"
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: NotificationType, priority: string) => {
    const iconClass = priority === "high" ? "text-red-600" : 
                     priority === "medium" ? "text-yellow-600" : "text-blue-600"

    switch (type) {
      case "application_status":
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case "payment":
        return <DollarSign className={`h-5 w-5 ${iconClass}`} />
      case "order":
        return <Package className={`h-5 w-5 ${iconClass}`} />
      case "review":
        return <Star className={`h-5 w-5 ${iconClass}`} />
      case "verification":
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case "system":
        return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
        <CardDescription>
          Stay updated with your seller account activity
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div 
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    !notification.read ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          {getPriorityBadge(notification.priority)}
                        </div>
                      </div>
                    </div>
                    
                    {notification.actionUrl && notification.actionText && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            markAsRead(notification.id)
                            // Navigate to action URL
                            window.location.href = notification.actionUrl!
                          }}
                        >
                          {notification.actionText}
                        </Button>
                      </div>
                    )}
                    
                    {!notification.read && (
                      <div className="mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < notifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}