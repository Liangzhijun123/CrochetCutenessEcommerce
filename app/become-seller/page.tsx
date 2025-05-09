import type { Metadata } from "next"
import BecomeSellerClientPage from "./BecomeSellerClientPage"

export const metadata: Metadata = {
  title: "Become a Seller | Crochet Ecommerce",
  description: "Apply to become a seller and share your crochet creations with our community",
}

export default function BecomeSellerPage() {
  return <BecomeSellerClientPage />
}
