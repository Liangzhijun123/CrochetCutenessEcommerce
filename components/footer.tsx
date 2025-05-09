import Link from "next/link"
import { Facebook, Instagram, PinIcon as Pinterest, Twitter, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-rose-50 py-12">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">CrochetCraft</h3>
          <p className="mb-4 text-muted-foreground">
            Handmade crochet items crafted with love. From adorable amigurumi to cozy home decor.
          </p>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-100 hover:text-rose-500">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-100 hover:text-rose-500">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-100 hover:text-rose-500">
              <Pinterest className="h-5 w-5" />
              <span className="sr-only">Pinterest</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-100 hover:text-rose-500">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-100 hover:text-rose-500">
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </Button>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Shop</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/shop" className="text-muted-foreground hover:text-rose-500">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/shop?category=amigurumi" className="text-muted-foreground hover:text-rose-500">
                Amigurumi
              </Link>
            </li>
            <li>
              <Link href="/shop?category=home" className="text-muted-foreground hover:text-rose-500">
                Home Decor
              </Link>
            </li>
            <li>
              <Link href="/shop?category=baby" className="text-muted-foreground hover:text-rose-500">
                Baby Items
              </Link>
            </li>
            <li>
              <Link href="/shop?category=patterns" className="text-muted-foreground hover:text-rose-500">
                Patterns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Customer Service</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="text-muted-foreground hover:text-rose-500">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-muted-foreground hover:text-rose-500">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-muted-foreground hover:text-rose-500">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-rose-500">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-rose-500">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-rose-500">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-rose-500">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/become-seller" className="text-muted-foreground hover:text-rose-500">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/become-seller" className="text-muted-foreground hover:text-rose-500">
                Sell with Us
              </Link>
            </li>
            <li>
              <Link href="/affiliate" className="text-muted-foreground hover:text-rose-500">
                Affiliate Program
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t border-rose-200 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CrochetCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <img src="/placeholder.svg?height=30&width=50&text=Visa" alt="Visa" className="h-8" />
            <img src="/placeholder.svg?height=30&width=50&text=Mastercard" alt="Mastercard" className="h-8" />
            <img src="/placeholder.svg?height=30&width=50&text=PayPal" alt="PayPal" className="h-8" />
            <img src="/placeholder.svg?height=30&width=50&text=Apple+Pay" alt="Apple Pay" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  )
}
