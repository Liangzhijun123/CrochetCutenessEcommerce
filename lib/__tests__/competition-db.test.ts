// Basic tests for competition database functions
import {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  createCompetitionEntry,
  createCompetitionVote,
  selectCompetitionWinner,
} from "../competition-db"
import { createUser, getUsers } from "../local-storage-db"

describe("Competition Database", () => {
  let adminUser: any
  let regularUser: any
  let competitionId: string

  beforeAll(() => {
    // Create test users
    try {
      adminUser = createUser({
        name: "Test Admin",
        email: "admin-test@example.com",
        password: "password123",
        role: "admin",
        avatar: "",
      })
    } catch (error) {
      // User might already exist
      const users = getUsers()
      adminUser = users.find((u) => u.email === "admin-test@example.com")
    }

    try {
      regularUser = createUser({
        name: "Test User",
        email: "user-test@example.com",
        password: "password123",
        role: "user",
        avatar: "",
      })
    } catch (error) {
      // User might already exist
      const users = getUsers()
      regularUser = users.find((u) => u.email === "user-test@example.com")
    }
  })

  describe("Competition CRUD", () => {
    it("should create a competition", () => {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      const competition = createCompetition({
        title: "Test Competition",
        description: "A test competition",
        rules: "Test rules",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        prizeDescription: "Test prize",
        status: "active",
        createdBy: adminUser.id,
      })

      expect(competition).toBeDefined()
      expect(competition.id).toBeDefined()
      expect(competition.title).toBe("Test Competition")
      expect(competition.status).toBe("active")

      competitionId = competition.id
    })

    it("should retrieve competitions", () => {
      const competitions = getCompetitions()
      expect(competitions.length).toBeGreaterThan(0)
    })

    it("should retrieve competition by ID", () => {
      const competition = getCompetitionById(competitionId)
      expect(competition).toBeDefined()
      expect(competition?.id).toBe(competitionId)
    })

    it("should not allow non-admin to create competition", () => {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      expect(() => {
        createCompetition({
          title: "Invalid Competition",
          description: "Should fail",
          rules: "Test rules",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          prizeDescription: "Test prize",
          status: "active",
          createdBy: regularUser.id,
        })
      }).toThrow("Only administrators can create competitions")
    })
  })

  describe("Competition Entries", () => {
    it("should create a competition entry", () => {
      const entry = createCompetitionEntry({
        competitionId,
        userId: regularUser.id,
        description: "My test entry with a detailed description",
        photoUrl: "https://example.com/photo.jpg",
      })

      expect(entry).toBeDefined()
      expect(entry.id).toBeDefined()
      expect(entry.votes).toBe(0)
      expect(entry.status).toBe("approved")
    })

    it("should not allow duplicate entries", () => {
      expect(() => {
        createCompetitionEntry({
          competitionId,
          userId: regularUser.id,
          description: "Another entry",
          photoUrl: "https://example.com/photo2.jpg",
        })
      }).toThrow("You have already submitted an entry for this competition")
    })
  })

  describe("Competition Voting", () => {
    let entryId: string
    let voter: any

    beforeAll(() => {
      // Create another user for voting
      try {
        voter = createUser({
          name: "Voter User",
          email: "voter-test@example.com",
          password: "password123",
          role: "user",
          avatar: "",
        })
      } catch (error) {
        const users = getUsers()
        voter = users.find((u) => u.email === "voter-test@example.com")
      }

      // Get the entry ID from the previous test
      const { getEntriesByCompetition } = require("../competition-db")
      const entries = getEntriesByCompetition(competitionId)
      entryId = entries[0]?.id
    })

    it("should allow voting on an entry", () => {
      if (!entryId) {
        console.log("No entry found, skipping vote test")
        return
      }

      const vote = createCompetitionVote({
        competitionId,
        entryId,
        userId: voter.id,
      })

      expect(vote).toBeDefined()
      expect(vote.id).toBeDefined()
      expect(vote.entryId).toBe(entryId)
    })

    it("should not allow duplicate votes", () => {
      if (!entryId) {
        console.log("No entry found, skipping duplicate vote test")
        return
      }

      expect(() => {
        createCompetitionVote({
          competitionId,
          entryId,
          userId: voter.id,
        })
      }).toThrow("You have already voted in this competition")
    })

    it("should not allow voting for own entry", () => {
      if (!entryId) {
        console.log("No entry found, skipping self-vote test")
        return
      }

      expect(() => {
        createCompetitionVote({
          competitionId,
          entryId,
          userId: regularUser.id,
        })
      }).toThrow("You cannot vote for your own entry")
    })
  })

  describe("Winner Selection", () => {
    it("should select a winner", () => {
      const winningEntry = selectCompetitionWinner(competitionId)

      expect(winningEntry).toBeDefined()
      expect(winningEntry.id).toBeDefined()

      // Verify competition was updated
      const competition = getCompetitionById(competitionId)
      expect(competition?.status).toBe("completed")
      expect(competition?.winnerId).toBe(winningEntry.userId)
    })
  })
})
