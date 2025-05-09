"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings, ShoppingBag, Heart, Award, Store, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AuthStatus() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <span className="h-4 w-4 animate-pulse rounded-full bg-muted"></span>
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button className="bg-rose-500 hover:bg-rose-600" size="sm" asChild>
          <Link href="/auth/register">Register</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline-block">{user?.name?.split(" ")[0] || "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            <span className="text-xs font-normal text-muted-foreground capitalize">{user?.role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex w-full cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=orders" className="flex w-full cursor-pointer items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Order History</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=wishlist" className="flex w-full cursor-pointer items-center">
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=loyalty" className="flex w-full cursor-pointer items-center">
            <Award className="mr-2 h-4 w-4" />
            <span>Loyalty Points</span>
          </Link>
        </DropdownMenuItem>

        {user?.role === "seller" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/seller-dashboard" className="flex w-full cursor-pointer items-center">
                <Store className="mr-2 h-4 w-4" />
                <span>Seller Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin-dashboard" className="flex w-full cursor-pointer items-center">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
