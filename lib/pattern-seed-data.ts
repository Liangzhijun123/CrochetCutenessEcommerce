// Seed data for patterns
import { createPattern } from "./pattern-db"
import { createUser, updateUser, getUserByEmail } from "./local-storage-db"

export function seedPatternData() {
  console.log("[SEED] Starting pattern data seeding...")

  try {
    // Create a creator user if it doesn't exist
    let creator = getUserByEmail("creator@example.com")
    if (!creator) {
      creator = createUser({
        name: "Sarah Johnson",
        email: "creator@example.com",
        password: "password123",
        role: "creator",
        avatar: "/placeholder.svg?height=200&width=200"
      })

      // Add seller profile
      updateUser(creator.id, {
        sellerProfile: {
          approved: true,
          bio: "Passionate crochet designer with 10+ years of experience creating beautiful patterns for all skill levels.",
          storeDescription: "Welcome to my pattern shop! I specialize in amigurumi, baby items, and home decor.",
          socialMedia: {
            instagram: "https://instagram.com/sarahcrochets",
            pinterest: "https://pinterest.com/sarahcrochets",
          },
          salesCount: 245,
          rating: 4.9,
          joinedDate: new Date().toISOString(),
        },
      })
    }

    // Create another creator
    let creator2 = getUserByEmail("creator2@example.com")
    if (!creator2) {
      creator2 = createUser({
        name: "Emma Wilson",
        email: "creator2@example.com",
        password: "password123",
        role: "creator",
        avatar: "/placeholder.svg?height=200&width=200"
      })

      updateUser(creator2.id, {
        sellerProfile: {
          approved: true,
          bio: "Modern crochet designer focusing on contemporary patterns and sustainable materials.",
          storeDescription: "Eco-friendly crochet patterns for the modern maker.",
          socialMedia: {
            instagram: "https://instagram.com/emmacrochets",
            etsy: "https://etsy.com/shop/emmacrochets",
          },
          salesCount: 156,
          rating: 4.7,
          joinedDate: new Date().toISOString(),
        },
      })
    }

    // Sample patterns
    const samplePatterns = [
      {
        title: "Adorable Bunny Amigurumi",
        description: "Create this sweet little bunny with our detailed step-by-step pattern. Perfect for beginners and includes video tutorial showing all the basic stitches. The finished bunny is approximately 8 inches tall and makes a wonderful gift for children or adults who love cute handmade items.",
        price: 4.99,
        creatorId: creator.id,
        difficultyLevel: "beginner" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/bunny-amigurumi.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/bunny-tutorial.mp4",
        thumbnailUrl: "/crochet-bunny.png",
        category: "amigurumi",
        tags: ["bunny", "rabbit", "toy", "gift", "beginner-friendly"],
        materials: ["Worsted weight yarn", "Fiberfill stuffing", "Safety eyes", "Embroidery thread"],
        estimatedTime: "4-6 hours",
        isActive: true,
        featured: true,
      },
      {
        title: "Cozy Baby Blanket Pattern",
        description: "Wrap your little one in love with this soft and cozy baby blanket. Features a beautiful shell stitch pattern that's both elegant and practical. The pattern includes multiple size options and color variations to match any nursery theme.",
        price: 6.99,
        creatorId: creator.id,
        difficultyLevel: "intermediate" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/baby-blanket.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/baby-blanket-tutorial.mp4",
        thumbnailUrl: "/cozy-crochet-blanket.png",
        category: "baby-items",
        tags: ["blanket", "baby", "shell-stitch", "nursery", "gift"],
        materials: ["Baby yarn", "Crochet hook size H", "Scissors", "Yarn needle"],
        estimatedTime: "12-15 hours",
        isActive: true,
        featured: true,
      },
      {
        title: "Boho Plant Hanger",
        description: "Add a touch of bohemian style to your home with this macrame-inspired plant hanger. Perfect for displaying your favorite plants and adding texture to any room. Includes instructions for three different sizes.",
        price: 3.99,
        creatorId: creator2.id,
        difficultyLevel: "intermediate" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/plant-hanger.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/plant-hanger-tutorial.mp4",
        thumbnailUrl: "/crochet-plant-hanger.png",
        category: "home-decor",
        tags: ["plant-hanger", "macrame", "boho", "home-decor", "modern"],
        materials: ["Cotton cord", "Metal ring", "Scissors"],
        estimatedTime: "3-4 hours",
        isActive: true,
        featured: false,
      },
      {
        title: "Granny Square Cardigan",
        description: "A modern take on the classic granny square! This oversized cardigan is perfect for layering and features a beautiful color-block design. Includes sizes XS through 3XL with detailed construction diagrams.",
        price: 8.99,
        creatorId: creator2.id,
        difficultyLevel: "advanced" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/granny-cardigan.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/granny-cardigan-tutorial.mp4",
        thumbnailUrl: "/placeholder.svg?height=400&width=400",
        category: "clothing",
        tags: ["cardigan", "granny-square", "clothing", "modern", "oversized"],
        materials: ["DK weight yarn", "Crochet hook size G", "Stitch markers", "Yarn needle"],
        estimatedTime: "25-30 hours",
        isActive: true,
        featured: false,
      },
      {
        title: "Market Tote Bag",
        description: "Sustainable and stylish! This sturdy market tote is perfect for grocery shopping or everyday use. Made with cotton yarn for durability and includes a reinforced bottom and comfortable handles.",
        price: 5.99,
        creatorId: creator.id,
        difficultyLevel: "beginner" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/market-tote.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/market-tote-tutorial.mp4",
        thumbnailUrl: "/placeholder.svg?height=400&width=400",
        category: "bags",
        tags: ["tote", "bag", "market", "eco-friendly", "practical"],
        materials: ["Cotton yarn", "Crochet hook size I", "Stitch markers"],
        estimatedTime: "6-8 hours",
        isActive: true,
        featured: false,
      },
      {
        title: "Flower Crown Headband",
        description: "Feel like a fairy with this delicate flower crown headband. Perfect for festivals, weddings, or just adding a whimsical touch to your outfit. Includes patterns for 5 different flower types.",
        price: 4.49,
        creatorId: creator2.id,
        difficultyLevel: "intermediate" as const,
        patternFileUrl: "https://cdn.crochet-platform.com/patterns/flower-crown.pdf",
        tutorialVideoUrl: "https://cdn.crochet-platform.com/videos/flower-crown-tutorial.mp4",
        thumbnailUrl: "/placeholder.svg?height=400&width=400",
        category: "accessories",
        tags: ["headband", "flowers", "crown", "festival", "wedding"],
        materials: ["Thread weight yarn", "Small crochet hook", "Headband base", "Beads"],
        estimatedTime: "5-7 hours",
        isActive: true,
        featured: false,
      }
    ]

    // Create patterns
    for (const patternData of samplePatterns) {
      try {
        createPattern(patternData)
        console.log(`[SEED] Created pattern: ${patternData.title}`)
      } catch (error) {
        console.log(`[SEED] Pattern already exists or error: ${patternData.title}`)
      }
    }

    console.log("[SEED] Pattern data seeding completed!")
  } catch (error) {
    console.error("[SEED] Error seeding pattern data:", error)
  }
}