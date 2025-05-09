"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, Search, ShieldCheck, Store, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import AuthStatus from "@/components/auth/auth-status"
import CartButton from "@/components/cart/cart-button"

export default function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-lg font-medium transition-colors hover:text-rose-500"
                onClick={() => document.body.click()}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-lg font-medium transition-colors hover:text-rose-500"
                onClick={() => document.body.click()}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium transition-colors hover:text-rose-500"
                onClick={() => document.body.click()}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium transition-colors hover:text-rose-500"
                onClick={() => document.body.click()}
              >
                Contact
              </Link>
              {isAuthenticated && user?.role !== "seller" && (
                <Link
                  href="/become-seller"
                  className="text-lg font-medium transition-colors hover:text-rose-500"
                  onClick={() => document.body.click()}
                >
                  Become a Seller
                </Link>
              )}
              {isAuthenticated && user?.role === "seller" && (
                <Link
                  href="/seller-dashboard"
                  className="text-lg font-medium transition-colors hover:text-rose-500"
                  onClick={() => document.body.click()}
                >
                  Seller Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className="text-lg font-medium transition-colors hover:text-rose-500"
                  onClick={() => document.body.click()}
                >
                  <ShieldCheck className="mr-2 h-4 w-4 inline" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center md:w-1/4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CrochetCraft</span>
          </Link>
        </div>
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                isActive("/") ? "text-rose-500" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                isActive("/shop") ? "text-rose-500" : ""
              }`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                isActive("/about") ? "text-rose-500" : ""
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                isActive("/contact") ? "text-rose-500" : ""
              }`}
            >
              Contact
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-end md:w-1/4 gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] md:w-[300px] pr-8"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <X
                className="absolute right-2 h-4 w-4 cursor-pointer text-muted-foreground"
                onClick={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile?tab=wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
          )}
          <CartButton />
          {isAuthenticated && user?.role !== "seller" && (
            <Button variant="outline" size="sm" className="hidden md:flex" asChild>
              <Link href="/become-seller">
                <Store className="mr-2 h-4 w-4" />
                Become a Seller
              </Link>
            </Button>
          )}
          {isAuthenticated && user?.role === "seller" && (
            <Button variant="outline" size="sm" className="hidden md:flex" asChild>
              <Link href="/seller-dashboard">
                <Store className="mr-2 h-4 w-4" />
                Seller Dashboard
              </Link>
            </Button>
          )}
          {isAuthenticated && user?.role === "admin" && (
            <Button variant="outline" size="sm" className="hidden md:flex" asChild>
              <Link href="/admin-dashboard">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <AuthStatus />
        </div>
      </div>
    </header>
  )
}
