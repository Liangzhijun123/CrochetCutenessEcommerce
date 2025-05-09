import CreatorProfile from "@/components/creator/creator-profile"

// This would normally come from a database or API
const mockCreator = {
  id: "jane-doe",
  name: "Jane Doe Crochet",
  bio: "Crochet designer and YouTuber specializing in amigurumi and home decor. I love creating cute and cozy designs that bring joy to your home.",
  avatar: "/placeholder.svg?height=128&width=128",
  coverImage: "/placeholder.svg?height=400&width=1200",
  youtubeUrl: "https://youtube.com/c/janedoecrochet",
  socialLinks: {
    instagram: "https://instagram.com/janedoecrochet",
    twitter: "https://twitter.com/janedoecrochet",
    website: "https://janedoecrochet.com",
  },
  stats: {
    followers: 25000,
    products: 12,
    patterns: 28,
    sales: 3500,
  },
}

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the creator data based on the ID
  return <CreatorProfile creator={mockCreator} />
}
