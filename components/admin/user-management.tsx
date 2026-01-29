"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, UserCheck, UserX, Edit, Coins, Star } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "creator" | "admin"
  isActive: boolean
  coins: number
  points: number
  loginStreak: number
  createdAt: string
  lastLogin?: string
}

interface UserManagementProps {
  className?: string
}

export default function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [coinAdjustment, setCoinAdjustment] = useState("")
  const [pointsAdjustment, setPointsAdjustment] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        })
        fetchUsers()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User role updated successfully",
        })
        fetchUsers()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const adjustUserBalance = async () => {
    if (!selectedUser) return

    try {
      const updates: any = {}
      
      if (coinAdjustment && coinAdjustment !== "0") {
        updates.coinAdjustment = parseInt(coinAdjustment)
        updates.coinAdjustmentReason = adjustmentReason || "Admin adjustment"
      }
      
      if (pointsAdjustment && pointsAdjustment !== "0") {
        updates.pointsAdjustment = parseInt(pointsAdjustment)
        updates.pointsAdjustmentReason = adjustmentReason || "Admin adjustment"
      }

      if (Object.keys(updates).length === 0) {
        toast({
          title: "Error",
          description: "Please enter an adjustment amount",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User balance adjusted successfully",
        })
        setEditDialogOpen(false)
        setCoinAdjustment("")
        setPointsAdjustment("")
        setAdjustmentReason("")
        fetchUsers()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to adjust user balance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to adjust user balance:", error)
      toast({
        title: "Error",
        description: "Failed to adjust user balance",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800"
      case "creator": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts, roles, and balances</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="creator">Creator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {user.coins} coins
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {user.points} points
                    </span>
                    <span>Streak: {user.loginStreak} days</span>
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog 
                    open={editDialogOpen && selectedUser?.id === user.id} 
                    onOpenChange={(open) => {
                      setEditDialogOpen(open)
                      if (open) setSelectedUser(user)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User: {user.name}</DialogTitle>
                        <DialogDescription>
                          Adjust user's coins and points balance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="coinAdjustment">Coin Adjustment</Label>
                          <Input
                            id="coinAdjustment"
                            type="number"
                            placeholder="Enter positive or negative amount"
                            value={coinAdjustment}
                            onChange={(e) => setCoinAdjustment(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Current balance: {user.coins} coins
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="pointsAdjustment">Points Adjustment</Label>
                          <Input
                            id="pointsAdjustment"
                            type="number"
                            placeholder="Enter positive or negative amount"
                            value={pointsAdjustment}
                            onChange={(e) => setPointsAdjustment(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Current balance: {user.points} points
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="reason">Reason for Adjustment</Label>
                          <Textarea
                            id="reason"
                            placeholder="Enter reason for this adjustment..."
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={adjustUserBalance}>
                          Apply Adjustment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => updateUserStatus(user.id, !user.isActive)}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}