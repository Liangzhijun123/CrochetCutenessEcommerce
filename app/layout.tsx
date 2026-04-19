import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { MessagingProvider } from "@/context/messaging-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crochet Crafts - Handmade Crochet Items and Patterns",
  description: "Discover beautiful handmade crochet items and patterns from talented creators.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <MessagingProvider>
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <Toaster />
                </MessagingProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
