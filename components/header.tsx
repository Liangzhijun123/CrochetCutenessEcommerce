"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from "lucide-react"
import CartButton from "./cart/cart-button"
import CartDrawer from "./cart/cart-drawer"
import AuthStatus from "./auth/auth-status"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled ? "bg-white shadow-sm" : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-rose-500">Crochet Crafts</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  pathname === "/" ? "text-rose-500" : "text-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  pathname === "/shop" ? "text-rose-500" : "text-foreground"
                }`}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  pathname === "/about" ? "text-rose-500" : "text-foreground"
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  pathname === "/contact" ? "text-rose-500" : "text-foreground"
                }`}
              >
                Contact
              </Link>
              {isAuthenticated && user?.role === "seller" && (
                <Link
                  href="/seller-dashboard"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/seller-dashboard" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Seller Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/admin-dashboard" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === "user" && !user?.sellerApplication && (
                <Link
                  href="/become-seller"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/become-seller" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Become a Seller
                </Link>
              )}
            </nav>

            {/* Search, Cart, and Auth */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-[200px] pl-8 rounded-full bg-background" />
              </div>

              <CartButton onClick={() => setIsCartOpen(true)} />
              <AuthStatus />

              {/* Mobile Menu Button */}
              <button
                className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-full pl-8 rounded-full bg-background" />
              </div>

              <nav className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/shop" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/about" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                    pathname === "/contact" ? "text-rose-500" : "text-foreground"
                  }`}
                >
                  Contact
                </Link>
                {isAuthenticated && user?.role === "seller" && (
                  <Link
                    href="/seller-dashboard"
                    className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                      pathname === "/seller-dashboard" ? "text-rose-500" : "text-foreground"
                    }`}
                  >
                    Seller Dashboard
                  </Link>
                )}
                {isAuthenticated && user?.role === "admin" && (
                  <Link
                    href="/admin-dashboard"
                    className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                      pathname === "/admin-dashboard" ? "text-rose-500" : "text-foreground"
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {isAuthenticated && user?.role === "user" && !user?.sellerApplication && (
                  <Link
                    href="/become-seller"
                    className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                      pathname === "/become-seller" ? "text-rose-500" : "text-foreground"
                    }`}
                  >
                    Become a Seller
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
