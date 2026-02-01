import { describe, it, expect, beforeEach } from "@jest/globals"
import {
  createPatternTestingApplication,
  getPatternTestingApplications,
  getPatternTestingApplicationByUserId,
  updatePatternTestingApplication,
  createPatternTestAssignment,
  getPatternTestAssignmentsByTester,
  updatePatternTestAssignment,
  createPatternTestFeedback,
  getPatternTestFeedbackByAssignment,
  completePatternTest,
  getTesterStatsByUser,
  updateTesterStats,
  getTesterLeaderboard,
  getTestingAnalytics,
  updatePatternTestMetrics,
} from "../pattern-testing-db"
import { createUser, createPattern, setItem } from "../local-storage-db"

describe("Pattern Testing Database", () => {
  beforeEach(() => {
    // Clear all testing data before each test
    setItem("crochet_pattern_testing_applications", [])
    setItem("crochet_pattern_test_assignments", [])
    setItem("crochet_pattern_test_feedback", [])
    setItem("crochet_pattern_test_metrics", [])
    setItem("crochet_tester_stats", [])
    setItem("crochet_users", [])
    setItem("crochet_patterns", [])
  })

  describe("Pattern Testing Applications", () => {
    it("should create a pattern testing application", () => {
      const user = createUser({
        name: "Test User",
        email: "test@example.com",
        password: "password",
        role: "user",
      })

      const application = createPatternTestingApplication({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        whyTesting: "I love testing patterns",
        experienceLevel: "intermediate",
        availability: "10-15 hours per week",
        comments: "Looking forward to helping",
      })

      expect(application.id).toBeDefined()
      expect(application.status).toBe("pending")
      expect(application.userId).toBe(user.id)
      expect(application.experienceLevel).toBe("intermediate")
    })

    it("should get application by user ID", () => {
      const user = createUser({
        name: "Test User",
        email: "test@example.com",
        password: "password",
        role: "user",
      })

      const application = createPatternTestingApplication({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        whyTesting: "I love testing patterns",
        experienceLevel: "beginner",
        availability: "5-10 hours per week",
      })

      const found = getPatternTestingApplicationByUserId(user.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(application.id)
    })

    it("should update application status", () => {
      const user = createUser({
        name: "Test User",
        email: "test@example.com",
        password: "password",
        role: "user",
      })

      const application = createPatternTestingApplication({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        whyTesting: "I love testing patterns",
        experienceLevel: "advanced",
        availability: "20+ hours per week",
      })

      const updated = updatePatternTestingApplication(application.id, {
        status: "approved",
        reviewedBy: "admin-123",
        reviewedAt: new Date().toISOString(),
      })

      expect(updated.status).toBe("approved")
      expect(updated.reviewedBy).toBe("admin-123")
    })

    it("should prevent duplicate pending applications", () => {
      const user = createUser({
        name: "Test User",
        email: "test@example.com",
        password: "password",
        role: "user",
      })

      createPatternTestingApplication({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        whyTesting: "First application",
        experienceLevel: "beginner",
        availability: "5 hours",
      })

      expect(() => {
        createPatternTestingApplication({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          whyTesting: "Second application",
          experienceLevel: "intermediate",
          availability: "10 hours",
        })
      }).toThrow("User already has a pending application")
    })
  })

  describe("Pattern Test Assignments", () => {
    it("should create a test assignment", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "beginner",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "amigurumi",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "5-7 hours",
        isActive: true,
        featured: false,
      })

      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 7)

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: deadline.toISOString(),
        estimatedHours: 6,
        rewardCoins: 60,
        rewardPoints: 30,
      })

      expect(assignment.id).toBeDefined()
      expect(assignment.status).toBe("pending")
      expect(assignment.progress).toBe(0)
      expect(assignment.testerId).toBe(tester.id)
    })

    it("should update assignment status", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "intermediate",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "clothing",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "8-10 hours",
        isActive: true,
        featured: false,
      })

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 9,
        rewardCoins: 90,
        rewardPoints: 45,
      })

      const updated = updatePatternTestAssignment(assignment.id, {
        status: "in_progress",
        startedAt: new Date().toISOString(),
        progress: 25,
      })

      expect(updated.status).toBe("in_progress")
      expect(updated.progress).toBe(25)
      expect(updated.startedAt).toBeDefined()
    })

    it("should get assignments by tester", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern1 = createPattern({
        creatorId: creator.id,
        title: "Pattern 1",
        description: "First pattern",
        price: 10,
        difficultyLevel: "beginner",
        patternFileUrl: "file1.pdf",
        tutorialVideoUrl: "video1.mp4",
        thumbnailUrl: "thumb1.jpg",
        category: "amigurumi",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "3-5 hours",
        isActive: true,
        featured: false,
      })

      const pattern2 = createPattern({
        creatorId: creator.id,
        title: "Pattern 2",
        description: "Second pattern",
        price: 15,
        difficultyLevel: "intermediate",
        patternFileUrl: "file2.pdf",
        tutorialVideoUrl: "video2.mp4",
        thumbnailUrl: "thumb2.jpg",
        category: "clothing",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "6-8 hours",
        isActive: true,
        featured: false,
      })

      createPatternTestAssignment({
        patternId: pattern1.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 4,
        rewardCoins: 40,
        rewardPoints: 20,
      })

      createPatternTestAssignment({
        patternId: pattern2.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 7,
        rewardCoins: 70,
        rewardPoints: 35,
      })

      const assignments = getPatternTestAssignmentsByTester(tester.id)
      expect(assignments).toHaveLength(2)
    })
  })

  describe("Pattern Test Feedback", () => {
    it("should create feedback", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "beginner",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "amigurumi",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "4-6 hours",
        isActive: true,
        featured: false,
      })

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 5,
        rewardCoins: 50,
        rewardPoints: 25,
      })

      const feedback = createPatternTestFeedback({
        assignmentId: assignment.id,
        testerId: tester.id,
        patternId: pattern.id,
        creatorId: creator.id,
        type: "question",
        message: "How do I do row 15?",
        images: ["image1.jpg"],
      })

      expect(feedback.id).toBeDefined()
      expect(feedback.type).toBe("question")
      expect(feedback.message).toBe("How do I do row 15?")
    })

    it("should get feedback by assignment", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "intermediate",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "home",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "7-9 hours",
        isActive: true,
        featured: false,
      })

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 8,
        rewardCoins: 80,
        rewardPoints: 40,
      })

      createPatternTestFeedback({
        assignmentId: assignment.id,
        testerId: tester.id,
        patternId: pattern.id,
        creatorId: creator.id,
        type: "question",
        message: "Question 1",
      })

      createPatternTestFeedback({
        assignmentId: assignment.id,
        testerId: tester.id,
        patternId: pattern.id,
        creatorId: creator.id,
        type: "issue",
        message: "Issue 1",
      })

      const feedback = getPatternTestFeedbackByAssignment(assignment.id)
      expect(feedback).toHaveLength(2)
    })
  })

  describe("Complete Pattern Test", () => {
    it("should complete test and award rewards", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "beginner",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "amigurumi",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "5-7 hours",
        isActive: true,
        featured: false,
      })

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 6,
        rewardCoins: 60,
        rewardPoints: 30,
      })

      // Start the assignment
      updatePatternTestAssignment(assignment.id, {
        status: "in_progress",
        startedAt: new Date().toISOString(),
      })

      const result = completePatternTest(assignment.id, {
        rating: 5,
        message: "Great pattern!",
        images: ["final1.jpg", "final2.jpg"],
        clarity: 5,
        accuracy: 5,
        difficulty: "as_expected",
      })

      expect(result.assignment.status).toBe("completed")
      expect(result.assignment.progress).toBe(100)
      expect(result.rewards.coins).toBe(60)
      expect(result.rewards.points).toBe(30)
      expect(result.rewards.xp).toBe(16) // 10 base + 6 hours
    })
  })

  describe("Tester Stats", () => {
    it("should update tester stats after completion", () => {
      const tester = createUser({
        name: "Tester",
        email: "tester@example.com",
        password: "password",
        role: "user",
      })

      const creator = createUser({
        name: "Creator",
        email: "creator@example.com",
        password: "password",
        role: "creator",
      })

      const pattern = createPattern({
        creatorId: creator.id,
        title: "Test Pattern",
        description: "A test pattern",
        price: 10,
        difficultyLevel: "beginner",
        patternFileUrl: "file.pdf",
        tutorialVideoUrl: "video.mp4",
        thumbnailUrl: "thumb.jpg",
        category: "amigurumi",
        tags: ["test"],
        materials: ["yarn"],
        estimatedTime: "5-7 hours",
        isActive: true,
        featured: false,
      })

      const assignment = createPatternTestAssignment({
        patternId: pattern.id,
        testerId: tester.id,
        creatorId: creator.id,
        deadline: new Date().toISOString(),
        estimatedHours: 6,
        rewardCoins: 60,
        rewardPoints: 30,
      })

      updatePatternTestAssignment(assignment.id, {
        status: "in_progress",
        startedAt: new Date().toISOString(),
      })

      completePatternTest(assignment.id, {
        rating: 5,
        message: "Great!",
        clarity: 5,
        accuracy: 5,
        difficulty: "as_expected",
      })

      const stats = getTesterStatsByUser(tester.id)
      expect(stats).toBeDefined()
      expect(stats?.totalTestsCompleted).toBe(1)
      expect(stats?.totalCoinsEarned).toBe(60)
      expect(stats?.totalPointsEarned).toBe(30)
      expect(stats?.badges).toContain("First Test")
    })
  })

  describe("Testing Analytics", () => {
    it("should generate testing analytics", () => {
      const analytics = getTestingAnalytics()

      expect(analytics).toBeDefined()
      expect(analytics.totalTesters).toBeGreaterThanOrEqual(0)
      expect(analytics.totalTests).toBeGreaterThanOrEqual(0)
      expect(analytics.completedTests).toBeGreaterThanOrEqual(0)
    })
  })
})
