"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User, Settings, ShoppingBag, Heart, CreditCard, LogOut, Loader2, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/hooks/use-toast"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const addressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
})

const preferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  marketing: z.boolean().default(false),
  notifications: z.boolean().default(true),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type AddressFormValues = z.infer<typeof addressSchema>
type PreferencesFormValues = z.infer<typeof preferencesSchema>

// Mock order data
const orders = [
  {
    id: "ORD-1234",
    date: "2023-05-15",
    status: "Delivered",
    total: 45.99,
    items: [
      {
        name: "Bunny Amigurumi",
        price: 24.99,
        quantity: 1,
      },
      {
        name: "Crochet Coasters (Set of 4)",
        price: 16.99,
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD-5678",
    date: "2023-04-02",
    status: "Delivered",
    total: 32.5,
    items: [
      {
        name: "Crochet Plant Hanger",
        price: 18.5,
        quantity: 1,
      },
      {
        name: "Bunny Pattern",
        price: 14.0,
        quantity: 1,
      },
    ],
  },
]

// Mock wishlist data
const wishlist = [
  {
    id: "1",
    name: "Bear Amigurumi",
    price: 29.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Crochet Wall Hanging",
    price: 38.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Baby Blanket Pattern",
    price: 14.99,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function ProfilePage() {
  const { user, profile, isAuthenticated, isLoading, updateUser, updateProfile, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("account")

  // Set active tab from URL parameter if available
  useEffect(() => {
    if (tabParam && ["account", "orders", "wishlist", "security", "loyalty", "coins"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      bio: "",
    },
  })

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: profile?.address?.street || "",
      city: profile?.address?.city || "",
      state: profile?.address?.state || "",
      postalCode: profile?.address?.postalCode || "",
      country: profile?.address?.country || "United States",
    },
  })

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      newsletter: profile?.preferences?.newsletter || false,
      marketing: profile?.preferences?.marketing || false,
      notifications: true,
    },
  })

  // Update form values when user/profile data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: profile?.phone || "",
        bio: "",
      })
    }

    if (profile?.address) {
      addressForm.reset({
        street: profile.address.street,
        city: profile.address.city,
        state: profile.address.state,
        postalCode: profile.address.postalCode,
        country: profile.address.country,
      })
    }

    if (profile?.preferences) {
      preferencesForm.reset({
        newsletter: profile.preferences.newsletter,
        marketing: profile.preferences.marketing,
        notifications: true,
      })
    }
  }, [user, profile, profileForm, addressForm, preferencesForm])

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      await updateUser({ name: data.name, email: data.email })
      await updateProfile({ phone: data.phone })
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function onAddressSubmit(data: AddressFormValues) {
    try {
      await updateProfile({
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
      })
      toast({
        title: "Address updated",
        description: "Your address information has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update address:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your address. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function onPreferencesSubmit(data: PreferencesFormValues) {
    try {
      await updateProfile({
        preferences: {
          newsletter: data.newsletter,
          marketing: data.marketing,
        },
      })
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Failed to update preferences:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="mt-2 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="hidden md:block">
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 text-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-rose-100">
              <img
                src={user?.avatar || "/placeholder.svg?height=96&width=96"}
                alt={user?.name || "User avatar"}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("account")}>
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <Button
              variant={activeTab === "account" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("account")
                router.push("/profile?tab=account", { scroll: false })
              }}
            >
              <User className="h-4 w-4" />
              Account
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("orders")
                router.push("/profile?tab=orders", { scroll: false })
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Button>
            <Button
              variant={activeTab === "wishlist" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("wishlist")
                router.push("/profile?tab=wishlist", { scroll: false })
              }}
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Button>
            <Button
              variant={activeTab === "loyalty" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("loyalty")
                router.push("/profile?tab=loyalty", { scroll: false })
              }}
            >
              <Award className="h-4 w-4" />
              Loyalty Points
            </Button>
            <Button
              variant={activeTab === "coins" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("coins")
                router.push("/profile?tab=coins", { scroll: false })
              }}
            >
              <Award className="h-4 w-4" />
              Daily Coins
            </Button>
            <Button
              variant={activeTab === "security" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveTab("security")
                router.push("/profile?tab=security", { scroll: false })
              }}
            >
              <CreditCard className="h-4 w-4" />
              Security
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              router.push(`/profile?tab=${value}`, { scroll: false })
            }}
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              <TabsTrigger value="coins">Coins</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-6 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>Used for order updates and delivery notifications</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a bit about yourself..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>This will be displayed on your public profile</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Update your shipping address</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
                      <FormField
                        control={addressForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={addressForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addressForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State / Province</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={addressForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addressForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                  <SelectItem value="Germany">Germany</SelectItem>
                                  <SelectItem value="France">France</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage your communication preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={preferencesForm.control}
                          name="newsletter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Newsletter</FormLabel>
                                <FormDescription>
                                  Receive our weekly newsletter with new patterns, products, and crochet tips
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="marketing"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Marketing Emails</FormLabel>
                                <FormDescription>
                                  Receive emails about promotions, discounts, and special offers
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Order Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications about your orders, shipping updates, and delivery
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and manage your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will appear here</p>
                      <Button className="mt-4 bg-rose-500 hover:bg-rose-600" asChild>
                        <Link href="/shop">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-lg border">
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Placed on {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium">${order.total.toFixed(2)}</p>
                                <p className="text-sm">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "Processing"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="mb-2 text-sm font-medium">Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>
                                    {item.quantity} × {item.name}
                                  </span>
                                  <span>${item.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Items you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Your wishlist is empty</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Save items you love to your wishlist</p>
                      <Button className="mt-4 bg-rose-500 hover:bg-rose-600" asChild>
                        <Link href="/shop">Browse Products</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-rose-600">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                              Add to Cart
                            </Button>
                            <Button size="sm" variant="outline">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Program</CardTitle>
                    <CardDescription>View your loyalty points and rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Casino-Style Loyalty Points Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Points - Casino Style */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 p-6 text-white shadow-xl">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div className="rounded-full bg-white/20 p-3">
                                <Award className="h-8 w-8 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium opacity-90">LOYALTY POINTS</p>
                                <p className="text-4xl font-bold">350</p>
                                <p className="text-sm opacity-75">POINTS</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="opacity-90">Current Tier</span>
                                <span className="font-bold">SILVER</span>
                              </div>
                              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-white/60 rounded-full"></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-75">
                                <span>350/500 to Gold</span>
                                <span>150 more needed</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Next Tier Benefits - Casino Style */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-white shadow-xl">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                                <Award className="h-8 w-8 text-white animate-pulse" />
                              </div>
                              <h3 className="text-xl font-bold mb-2">GOLD TIER</h3>
                              <p className="text-sm opacity-90 mb-4">Unlock premium benefits</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <span>🚚</span>
                                  <span>Free shipping on all orders</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <span>🎂</span>
                                  <span>20% birthday discount</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <span>⭐</span>
                                  <span>VIP customer support</span>
                                </div>
                              </div>
                              <p className="text-xs mt-3 opacity-75">🎯 150 points to unlock</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="mb-3 text-lg font-medium">Available Rewards</h3>
                          <div className="space-y-3">
                            <div className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">$5 Discount</p>
                                  <p className="text-sm text-muted-foreground">Valid on your next order</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-rose-600">100 points</p>
                                  <Button size="sm" className="mt-2 bg-rose-500 hover:bg-rose-600">
                                    Redeem
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Free Shipping</p>
                                  <p className="text-sm text-muted-foreground">On your next order</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-rose-600">50 points</p>
                                  <Button size="sm" className="mt-2 bg-rose-500 hover:bg-rose-600">
                                    Redeem
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-lg font-medium">Recent Activity</h3>
                          <div className="rounded-lg border">
                            <div className="border-b p-3 text-sm font-medium">
                              <div className="grid grid-cols-3">
                                <div>Date</div>
                                <div>Activity</div>
                                <div className="text-right">Points</div>
                              </div>
                            </div>
                            <div className="divide-y">
                              <div className="p-3 text-sm">
                                <div className="grid grid-cols-3">
                                  <div>May 15, 2023</div>
                                  <div>Purchase: Order #ORD-1234</div>
                                  <div className="text-right text-green-600">+45</div>
                                </div>
                              </div>
                              <div className="p-3 text-sm">
                                <div className="grid grid-cols-3">
                                  <div>Apr 2, 2023</div>
                                  <div>Purchase: Order #ORD-5678</div>
                                  <div className="text-right text-green-600">+32</div>
                                </div>
                              </div>
                              <div className="p-3 text-sm">
                                <div className="grid grid-cols-3">
                                  <div>Mar 20, 2023</div>
                                  <div>Review submitted</div>
                                  <div className="text-right text-green-600">+10</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Membership Benefits</CardTitle>
                    <CardDescription>Current benefits for Silver tier members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="ml-6 list-disc space-y-2">
                      <li>Free shipping on orders over $35</li>
                      <li>Birthday discount: 15% off</li>
                      <li>Early access to sales</li>
                      <li>Exclusive monthly patterns</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="coins" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Coins</CardTitle>
                    <CardDescription>Claim your daily coins and manage your balance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Casino-Style Balance and Claim Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Balance - Casino Style */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-6 text-white shadow-xl">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div className="rounded-full bg-white/20 p-3">
                                <Award className="h-8 w-8 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium opacity-90">TOTAL BALANCE</p>
                                <p className="text-3xl font-bold">127</p>
                                <p className="text-sm opacity-75">COINS</p>
                              </div>
                            </div>
                            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full w-3/4 bg-white/40 rounded-full"></div>
                            </div>
                            <p className="text-xs mt-2 opacity-75">Level: Gold Member</p>
                          </div>
                        </div>

                        {/* Daily Claim - Casino Style */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 text-white shadow-xl">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                                <Award className="h-8 w-8 text-white animate-pulse" />
                              </div>
                              <h3 className="text-xl font-bold mb-2">DAILY BONUS</h3>
                              <p className="text-sm opacity-90 mb-4">Claim your daily reward</p>
                              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold py-3 text-lg backdrop-blur-sm">
                                🎰 CLAIM 3 COINS
                              </Button>
                              <p className="text-xs mt-3 opacity-75">⏰ Next claim: 23h 45m</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Month Calendar */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Monthly Claim Calendar</h3>
                        <div className="rounded-lg border p-4 bg-white">
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">
                              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </h4>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                ‹
                              </Button>
                              <Button variant="outline" size="sm">
                                ›
                              </Button>
                            </div>
                          </div>

                          {/* Day Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 42 }, (_, i) => {
                              const today = new Date()
                              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                              const startDate = new Date(firstDay)
                              startDate.setDate(startDate.getDate() - firstDay.getDay())

                              const currentDate = new Date(startDate)
                              currentDate.setDate(startDate.getDate() + i)

                              const isCurrentMonth = currentDate.getMonth() === today.getMonth()
                              const isToday = currentDate.toDateString() === today.toDateString()
                              const isTomorrow =
                                currentDate.toDateString() ===
                                new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()
                              const isPast = currentDate < today && !isToday
                              const isFuture = currentDate > today

                              // Mock claim status (you can replace with real data)
                              const isClaimed = isPast && Math.random() > 0.3 // 70% claimed for past days
                              const isMissed = isPast && !isClaimed

                              let bgColor = "bg-gray-50 text-gray-400" // Default for other month
                              let status = ""

                              if (isCurrentMonth) {
                                if (isToday) {
                                  bgColor = "bg-blue-100 border-2 border-blue-400 text-blue-800"
                                  status = "TODAY"
                                } else if (isTomorrow) {
                                  bgColor = "bg-yellow-100 text-yellow-800"
                                  status = "TOMORROW"
                                } else if (isClaimed) {
                                  bgColor = "bg-green-100 text-green-800"
                                  status = "✓"
                                } else if (isMissed) {
                                  bgColor = "bg-red-100 text-red-800"
                                  status = "✗"
                                } else if (isFuture) {
                                  bgColor = "bg-gray-100 text-gray-500"
                                  status = "FUTURE"
                                }
                              }

                              return (
                                <div
                                  key={i}
                                  className={`
                                    p-2 rounded-lg text-center text-sm min-h-[60px] flex flex-col justify-center
                                    ${bgColor}
                                    ${isCurrentMonth ? "font-medium" : "font-normal"}
                                  `}
                                >
                                  <div className="font-semibold">{currentDate.getDate()}</div>
                                  <div className="text-xs mt-1">{status}</div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Legend */}
                          <div className="mt-4 flex flex-wrap gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
                              <span>Today</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-100 rounded"></div>
                              <span>Claimed</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-100 rounded"></div>
                              <span>Missed</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                              <span>Tomorrow</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-gray-100 rounded"></div>
                              <span>Future</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recovery Options */}
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Missed Yesterday?</h3>
                        <p className="text-sm text-red-600 mb-4">You can still recover your missed coins!</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            📺 Watch 5 Ads (Free)
                          </Button>
                          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                            💳 Purchase for $1.99
                          </Button>
                        </div>
                        <p className="text-xs text-red-500 mt-2">Recovery available for last 7 days only</p>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                        <div className="rounded-lg border">
                          <div className="border-b p-3 text-sm font-medium">
                            <div className="grid grid-cols-3">
                              <div>Date</div>
                              <div>Activity</div>
                              <div className="text-right">Coins</div>
                            </div>
                          </div>
                          <div className="divide-y">
                            <div className="p-3 text-sm">
                              <div className="grid grid-cols-3">
                                <div>Today</div>
                                <div>Daily Claim</div>
                                <div className="text-right text-green-600">+3</div>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="grid grid-cols-3">
                                <div>Yesterday</div>
                                <div>Missed Claim</div>
                                <div className="text-right text-red-600">-3</div>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="grid grid-cols-3">
                                <div>2 days ago</div>
                                <div>Daily Claim</div>
                                <div className="text-right text-green-600">+3</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="current-password" className="mb-2 block text-sm font-medium">
                            Current Password
                          </label>
                          <Input id="current-password" type="password" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="new-password" className="mb-2 block text-sm font-medium">
                            New Password
                          </label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div>
                          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">
                            Confirm New Password
                          </label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-rose-500 hover:bg-rose-600">Update Password</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Account Activity</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Sign Out
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Recent Activity</p>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Password changed</span>
                            <span className="text-muted-foreground">2 weeks ago</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Login from new device</span>
                            <span className="text-muted-foreground">1 month ago</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Email updated</span>
                            <span className="text-muted-foreground">2 months ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Delete Account</h3>
                    <Separator className="my-4" />
                    <div className="rounded-lg border border-destructive/20 p-4">
                      <p className="font-medium text-destructive">Danger Zone</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Once you delete your account, there is no going back. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm" className="mt-4">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
