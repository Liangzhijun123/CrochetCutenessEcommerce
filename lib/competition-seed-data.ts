// Seed data for competitions
import { getItem, setItem, getUsers } from "./local-storage-db"

export function seedCompetitionData() {
  console.log("[SEED] Checking competition data...")

  const competitions = getItem("crochet_competitions", [])
  
  if (competitions.length > 0) {
    console.log(`[SEED] Competition data already exists (${competitions.length} competitions)`)
    return
  }

  console.log("[SEED] Seeding competition data...")

  // Get admin user for creating competitions
  const users = getUsers()
  const adminUser = users.find((u) => u.role === "admin")

  if (!adminUser) {
    console.log("[SEED] No admin user found, skipping competition seeding")
    return
  }

  // Create sample competitions
  const now = new Date()
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  const sampleCompetitions = [
    {
      id: crypto.randomUUID(),
      title: "Summer Crochet Challenge 2024",
      description: "Show off your best summer-themed crochet projects! Create anything that captures the essence of summer.",
      rules: `Competition Rules:
1. All entries must be original crochet work created by you
2. Projects must have a summer theme (beach, sun, flowers, etc.)
3. Submit one clear photo of your finished project
4. Include a description of your project and techniques used
5. Voting will be open to all community members
6. Winner will be selected based on community votes
7. Be respectful and supportive of all participants`,
      startDate: now.toISOString(),
      endDate: futureDate.toISOString(),
      prizeDescription: "$100 gift card + Featured on homepage for 1 month",
      status: "active" as const,
      votingStartDate: new Date(futureDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      votingEndDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxEntries: 100,
      createdBy: adminUser.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Amigurumi Animals Contest",
      description: "Create your cutest amigurumi animal! Any animal is welcome - from realistic to fantasy creatures.",
      rules: `Competition Rules:
1. Must be an amigurumi (stuffed crochet toy) of an animal
2. Any animal type is allowed (real or imaginary)
3. Must be your original design or pattern
4. Submit a clear photo showing your amigurumi
5. Include details about yarn used and size
6. Community voting will determine the winner
7. Have fun and be creative!`,
      startDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(futureDate.getTime() + 37 * 24 * 60 * 60 * 1000).toISOString(),
      prizeDescription: "$75 yarn store gift card + Pattern bundle",
      status: "draft" as const,
      createdBy: adminUser.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Spring Flowers Competition",
      description: "Celebrate spring with beautiful crochet flowers! Create any type of flower arrangement.",
      rules: `Competition Rules:
1. Create crochet flowers (any type)
2. Can be a single flower or arrangement
3. Must be completed during competition period
4. Submit photo of finished work
5. Winner selected by community vote
6. Be creative with colors and designs!`,
      startDate: pastDate.toISOString(),
      endDate: new Date(pastDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      prizeDescription: "$50 gift card + Featured creator spotlight",
      status: "completed" as const,
      winnerId: users.find((u) => u.role === "user")?.id,
      winnerAnnouncedAt: new Date(pastDate.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: adminUser.id,
      createdAt: pastDate.toISOString(),
      updatedAt: new Date(pastDate.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  setItem("crochet_competitions", sampleCompetitions)
  console.log(`[SEED] ✅ Created ${sampleCompetitions.length} sample competitions`)

  // Create some sample entries for the completed competition
  const completedCompetition = sampleCompetitions[2]
  const regularUsers = users.filter((u) => u.role === "user")

  if (regularUsers.length > 0) {
    const sampleEntries = regularUsers.slice(0, 3).map((user, index) => ({
      id: crypto.randomUUID(),
      competitionId: completedCompetition.id,
      userId: user.id,
      description: `My beautiful spring flower creation! I used ${
        ["cotton", "acrylic", "wool"][index]
      } yarn and spent about ${[5, 8, 12][index]} hours on this project.`,
      photoUrl: "/placeholder.svg?height=400&width=400",
      votes: [15, 23, 18][index],
      status: "approved" as const,
      submittedAt: new Date(
        pastDate.getTime() + (10 + index * 5) * 24 * 60 * 60 * 1000
      ).toISOString(),
    }))

    setItem("crochet_competition_entries", sampleEntries)
    console.log(`[SEED] ✅ Created ${sampleEntries.length} sample entries`)

    // Create participation records
    const participations = sampleEntries.map((entry) => ({
      id: crypto.randomUUID(),
      userId: entry.userId,
      competitionId: entry.competitionId,
      entryId: entry.id,
      participatedAt: entry.submittedAt,
      won: entry.userId === completedCompetition.winnerId,
      prizeReceived: entry.userId === completedCompetition.winnerId,
      prizeReceivedAt:
        entry.userId === completedCompetition.winnerId
          ? completedCompetition.winnerAnnouncedAt
          : undefined,
    }))

    setItem("crochet_competition_participation", participations)
    console.log(`[SEED] ✅ Created ${participations.length} participation records`)
  }

  console.log("[SEED] Competition data seeding complete!")
}
