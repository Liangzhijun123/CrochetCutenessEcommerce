// Pattern Testing database functions for the crochet community platform
// Handles pattern testing workflow, feedback, analytics, and rewards

import {
  getItem,
  setItem,
  getUserById,
  updateUser,
  getPatternById,
  createCoinTransaction,
  createPointsTransaction,
  type User,
  type Pattern,
} from "./local-storage-db"

// Pattern Testing Types
export type PatternTestingApplication = {
  id: string
  userId: string
  userName: string
  userEmail: string
  whyTesting: string
  experienceLevel: "beginner" | "intermediate" | "advanced"
  availability: string
  comments?: string
  status: "pending" | "approved" | "disapproved"
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export type PatternTestAssignment = {
  id: string
  patternId: string
  testerId: string
  creatorId: string
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  assignedAt: string
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
  deadline: string
  progress: number // 0-100
  estimatedHours: number
  rewardCoins: number
  rewardPoints: number
}

export type PatternTestFeedback = {
  id: string
  assignmentId: string
  testerId: string
  patternId: string
  creatorId: string
  type: "question" | "issue" | "progress_update" | "final_review"
  message: string
  images?: string[]
  rating?: number // 1-5 for final review
  difficulty?: "easier" | "as_expected" | "harder"
  clarity?: number // 1-5 for pattern clarity
  accuracy?: number // 1-5 for pattern accuracy
  createdAt: string
  respondedAt?: string
  response?: string
}

export type PatternTestMetrics = {
  patternId: string
  totalTests: number
  completedTests: number
  averageRating: number
  averageCompletionTime: number // in hours
  averageDifficulty: number // 1-5 scale
  averageClarity: number
  averageAccuracy: number
  commonIssues: string[]
  lastUpdated: string
}

export type TesterStats = {
  userId: string
  level: number
  xp: number
  totalTestsCompleted: number
  totalTestsInProgress: number
  averageRating: number // rating given by creators
  averageCompletionTime: number
  specialties: string[] // pattern types they excel at
  badges: string[]
  totalCoinsEarned: number
  totalPointsEarned: number
  joinedAt: string
  lastActiveAt: string
}

// Database functions for Pattern Testing Applications
export const getPatternTestingApplications = (): PatternTestingApplication[] => {
  return getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
}

export const getPatternTestingApplicationById = (id: string): PatternTestingApplication | undefined => {
  const applications = getPatternTestingApplications()
  return applications.find((app) => app.id === id)
}

export const getPatternTestingApplicationByUserId = (userId: string): PatternTestingApplication | undefined => {
  const applications = getPatternTestingApplications()
  return applications.find((app) => app.userId === userId)
}

export const createPatternTestingApplication = (
  application: Omit<PatternTestingApplication, "id" | "createdAt" | "status">
): PatternTestingApplication => {
  const applications = getPatternTestingApplications()

  // Check if user already has an application
  const existingApp = applications.find((app) => app.userId === application.userId)
  if (existingApp && existingApp.status === "pending") {
    throw new Error("User already has a pending application")
  }

  const newApplication: PatternTestingApplication = {
    id: crypto.randomUUID(),
    ...application,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  applications.push(newApplication)
  setItem("crochet_pattern_testing_applications", applications)

  return newApplication
}

export const updatePatternTestingApplication = (
  id: string,
  updates: Partial<PatternTestingApplication>
): PatternTestingApplication => {
  const applications = getPatternTestingApplications()
  const appIndex = applications.findIndex((app) => app.id === id)

  if (appIndex === -1) {
    throw new Error("Application not found")
  }

  const updatedApp = {
    ...applications[appIndex],
    ...updates,
  }

  applications[appIndex] = updatedApp
  setItem("crochet_pattern_testing_applications", applications)

  return updatedApp
}

// Database functions for Pattern Test Assignments
export const getPatternTestAssignments = (): PatternTestAssignment[] => {
  return getItem("crochet_pattern_test_assignments", []) as PatternTestAssignment[]
}

export const getPatternTestAssignmentById = (id: string): PatternTestAssignment | undefined => {
  const assignments = getPatternTestAssignments()
  return assignments.find((assignment) => assignment.id === id)
}

export const getPatternTestAssignmentsByTester = (testerId: string): PatternTestAssignment[] => {
  const assignments = getPatternTestAssignments()
  return assignments.filter((assignment) => assignment.testerId === testerId)
}

export const getPatternTestAssignmentsByPattern = (patternId: string): PatternTestAssignment[] => {
  const assignments = getPatternTestAssignments()
  return assignments.filter((assignment) => assignment.patternId === patternId)
}

export const getPatternTestAssignmentsByCreator = (creatorId: string): PatternTestAssignment[] => {
  const assignments = getPatternTestAssignments()
  return assignments.filter((assignment) => assignment.creatorId === creatorId)
}

export const createPatternTestAssignment = (
  assignment: Omit<PatternTestAssignment, "id" | "assignedAt" | "status" | "progress">
): PatternTestAssignment => {
  const assignments = getPatternTestAssignments()

  const newAssignment: PatternTestAssignment = {
    id: crypto.randomUUID(),
    ...assignment,
    status: "pending",
    progress: 0,
    assignedAt: new Date().toISOString(),
  }

  assignments.push(newAssignment)
  setItem("crochet_pattern_test_assignments", assignments)

  return newAssignment
}

export const updatePatternTestAssignment = (
  id: string,
  updates: Partial<PatternTestAssignment>
): PatternTestAssignment => {
  const assignments = getPatternTestAssignments()
  const assignmentIndex = assignments.findIndex((assignment) => assignment.id === id)

  if (assignmentIndex === -1) {
    throw new Error("Assignment not found")
  }

  const updatedAssignment = {
    ...assignments[assignmentIndex],
    ...updates,
  }

  assignments[assignmentIndex] = updatedAssignment
  setItem("crochet_pattern_test_assignments", assignments)

  return updatedAssignment
}

// Database functions for Pattern Test Feedback
export const getPatternTestFeedback = (): PatternTestFeedback[] => {
  return getItem("crochet_pattern_test_feedback", []) as PatternTestFeedback[]
}

export const getPatternTestFeedbackById = (id: string): PatternTestFeedback | undefined => {
  const feedback = getPatternTestFeedback()
  return feedback.find((f) => f.id === id)
}

export const getPatternTestFeedbackByAssignment = (assignmentId: string): PatternTestFeedback[] => {
  const feedback = getPatternTestFeedback()
  return feedback
    .filter((f) => f.assignmentId === assignmentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const getPatternTestFeedbackByPattern = (patternId: string): PatternTestFeedback[] => {
  const feedback = getPatternTestFeedback()
  return feedback.filter((f) => f.patternId === patternId)
}

export const createPatternTestFeedback = (
  feedback: Omit<PatternTestFeedback, "id" | "createdAt">
): PatternTestFeedback => {
  const allFeedback = getPatternTestFeedback()

  const newFeedback: PatternTestFeedback = {
    id: crypto.randomUUID(),
    ...feedback,
    createdAt: new Date().toISOString(),
  }

  allFeedback.push(newFeedback)
  setItem("crochet_pattern_test_feedback", allFeedback)

  return newFeedback
}

export const updatePatternTestFeedback = (
  id: string,
  updates: Partial<PatternTestFeedback>
): PatternTestFeedback => {
  const allFeedback = getPatternTestFeedback()
  const feedbackIndex = allFeedback.findIndex((f) => f.id === id)

  if (feedbackIndex === -1) {
    throw new Error("Feedback not found")
  }

  const updatedFeedback = {
    ...allFeedback[feedbackIndex],
    ...updates,
  }

  allFeedback[feedbackIndex] = updatedFeedback
  setItem("crochet_pattern_test_feedback", allFeedback)

  return updatedFeedback
}

// Database functions for Pattern Test Metrics
export const getPatternTestMetrics = (): PatternTestMetrics[] => {
  return getItem("crochet_pattern_test_metrics", []) as PatternTestMetrics[]
}

export const getPatternTestMetricsByPattern = (patternId: string): PatternTestMetrics | undefined => {
  const metrics = getPatternTestMetrics()
  return metrics.find((m) => m.patternId === patternId)
}

export const updatePatternTestMetrics = (patternId: string): PatternTestMetrics => {
  const metrics = getPatternTestMetrics()
  const assignments = getPatternTestAssignmentsByPattern(patternId)
  const feedback = getPatternTestFeedbackByPattern(patternId)

  const completedAssignments = assignments.filter((a) => a.status === "completed")
  const finalReviews = feedback.filter((f) => f.type === "final_review")

  const totalTests = assignments.length
  const completedTests = completedAssignments.length

  let averageRating = 0
  let averageCompletionTime = 0
  let averageDifficulty = 0
  let averageClarity = 0
  let averageAccuracy = 0

  if (finalReviews.length > 0) {
    averageRating = finalReviews.reduce((sum, f) => sum + (f.rating || 0), 0) / finalReviews.length
    averageClarity = finalReviews.reduce((sum, f) => sum + (f.clarity || 0), 0) / finalReviews.length
    averageAccuracy = finalReviews.reduce((sum, f) => sum + (f.accuracy || 0), 0) / finalReviews.length
  }

  if (completedAssignments.length > 0) {
    averageCompletionTime =
      completedAssignments.reduce((sum, a) => {
        if (a.startedAt && a.completedAt) {
          const hours =
            (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / (1000 * 60 * 60)
          return sum + hours
        }
        return sum
      }, 0) / completedAssignments.length
  }

  // Extract common issues from feedback
  const issueMessages = feedback.filter((f) => f.type === "issue").map((f) => f.message)
  const commonIssues = [...new Set(issueMessages)].slice(0, 5) // Top 5 unique issues

  const newMetrics: PatternTestMetrics = {
    patternId,
    totalTests,
    completedTests,
    averageRating: Number(averageRating.toFixed(1)),
    averageCompletionTime: Number(averageCompletionTime.toFixed(1)),
    averageDifficulty,
    averageClarity: Number(averageClarity.toFixed(1)),
    averageAccuracy: Number(averageAccuracy.toFixed(1)),
    commonIssues,
    lastUpdated: new Date().toISOString(),
  }

  const metricIndex = metrics.findIndex((m) => m.patternId === patternId)
  if (metricIndex === -1) {
    metrics.push(newMetrics)
  } else {
    metrics[metricIndex] = newMetrics
  }

  setItem("crochet_pattern_test_metrics", metrics)
  return newMetrics
}

// Database functions for Tester Stats
export const getTesterStats = (): TesterStats[] => {
  return getItem("crochet_tester_stats", []) as TesterStats[]
}

export const getTesterStatsByUser = (userId: string): TesterStats | undefined => {
  const stats = getTesterStats()
  return stats.find((s) => s.userId === userId)
}

export const createTesterStats = (userId: string): TesterStats => {
  const stats = getTesterStats()

  const existingStats = stats.find((s) => s.userId === userId)
  if (existingStats) {
    return existingStats
  }

  const newStats: TesterStats = {
    userId,
    level: 1,
    xp: 0,
    totalTestsCompleted: 0,
    totalTestsInProgress: 0,
    averageRating: 0,
    averageCompletionTime: 0,
    specialties: [],
    badges: [],
    totalCoinsEarned: 0,
    totalPointsEarned: 0,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  stats.push(newStats)
  setItem("crochet_tester_stats", stats)

  return newStats
}

export const updateTesterStats = (userId: string): TesterStats => {
  const stats = getTesterStats()
  const assignments = getPatternTestAssignmentsByTester(userId)

  const completedAssignments = assignments.filter((a) => a.status === "completed")
  const inProgressAssignments = assignments.filter((a) => a.status === "in_progress")

  let totalCoinsEarned = 0
  let totalPointsEarned = 0
  let totalXP = 0

  completedAssignments.forEach((assignment) => {
    totalCoinsEarned += assignment.rewardCoins
    totalPointsEarned += assignment.rewardPoints
    // XP calculation: base 10 XP per completed test + bonus based on difficulty
    totalXP += 10 + assignment.estimatedHours
  })

  // Calculate level based on XP (100 XP per level)
  const level = Math.floor(totalXP / 100) + 1

  const newStats: TesterStats = {
    userId,
    level,
    xp: totalXP,
    totalTestsCompleted: completedAssignments.length,
    totalTestsInProgress: inProgressAssignments.length,
    averageRating: 0, // Would need creator ratings
    averageCompletionTime: 0, // Calculate from assignments
    specialties: [],
    badges: calculateBadges(completedAssignments.length, level),
    totalCoinsEarned,
    totalPointsEarned,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  const statIndex = stats.findIndex((s) => s.userId === userId)
  if (statIndex === -1) {
    stats.push(newStats)
  } else {
    stats[statIndex] = newStats
  }

  setItem("crochet_tester_stats", stats)
  return newStats
}

// Helper function to calculate badges
const calculateBadges = (completedTests: number, level: number): string[] => {
  const badges: string[] = []

  if (completedTests >= 1) badges.push("First Test")
  if (completedTests >= 5) badges.push("Novice Tester")
  if (completedTests >= 10) badges.push("Experienced Tester")
  if (completedTests >= 25) badges.push("Expert Tester")
  if (completedTests >= 50) badges.push("Master Tester")
  if (completedTests >= 100) badges.push("Legend Tester")

  if (level >= 5) badges.push("Level 5 Achiever")
  if (level >= 10) badges.push("Level 10 Achiever")

  return badges
}

// Complete a pattern test and award rewards
export const completePatternTest = (assignmentId: string, finalFeedback: {
  rating: number
  message: string
  images?: string[]
  clarity: number
  accuracy: number
  difficulty: "easier" | "as_expected" | "harder"
}): { assignment: PatternTestAssignment; rewards: { coins: number; points: number; xp: number } } => {
  const assignment = getPatternTestAssignmentById(assignmentId)
  if (!assignment) {
    throw new Error("Assignment not found")
  }

  if (assignment.status === "completed") {
    throw new Error("Assignment already completed")
  }

  // Create final review feedback
  createPatternTestFeedback({
    assignmentId: assignment.id,
    testerId: assignment.testerId,
    patternId: assignment.patternId,
    creatorId: assignment.creatorId,
    type: "final_review",
    message: finalFeedback.message,
    images: finalFeedback.images,
    rating: finalFeedback.rating,
    clarity: finalFeedback.clarity,
    accuracy: finalFeedback.accuracy,
    difficulty: finalFeedback.difficulty,
  })

  // Update assignment status
  const updatedAssignment = updatePatternTestAssignment(assignmentId, {
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
  })

  // Award coins and points
  const user = getUserById(assignment.testerId)
  if (user) {
    // Award coins
    createCoinTransaction({
      userId: assignment.testerId,
      type: "admin_adjustment",
      amount: assignment.rewardCoins,
      description: `Pattern testing reward for completing test`,
    })

    // Award points
    createPointsTransaction({
      userId: assignment.testerId,
      type: "admin_adjustment",
      amount: assignment.rewardPoints,
      description: `Pattern testing reward for completing test`,
    })

    // Update user balances
    updateUser(assignment.testerId, {
      coins: (user.coins || 0) + assignment.rewardCoins,
      points: (user.points || 0) + assignment.rewardPoints,
    })
  }

  // Update tester stats
  updateTesterStats(assignment.testerId)

  // Update pattern metrics
  updatePatternTestMetrics(assignment.patternId)

  return {
    assignment: updatedAssignment,
    rewards: {
      coins: assignment.rewardCoins,
      points: assignment.rewardPoints,
      xp: 10 + assignment.estimatedHours,
    },
  }
}

// Get leaderboard data
export const getTesterLeaderboard = (limit: number = 10): Array<TesterStats & { user: User }> => {
  const stats = getTesterStats()
  const sortedStats = stats.sort((a, b) => b.totalTestsCompleted - a.totalTestsCompleted).slice(0, limit)

  return sortedStats
    .map((stat) => {
      const user = getUserById(stat.userId)
      if (!user) return null
      return { ...stat, user }
    })
    .filter((item): item is TesterStats & { user: User } => item !== null)
}

// Get testing analytics for admin
export const getTestingAnalytics = (): {
  totalTesters: number
  activeTesters: number
  totalTests: number
  completedTests: number
  averageCompletionRate: number
  totalRewardsDistributed: { coins: number; points: number }
  topPatterns: Array<{ patternId: string; completedTests: number }>
} => {
  const stats = getTesterStats()
  const assignments = getPatternTestAssignments()
  const completedAssignments = assignments.filter((a) => a.status === "completed")

  const activeTesters = stats.filter((s) => s.totalTestsInProgress > 0).length
  const totalRewardsDistributed = stats.reduce(
    (acc, stat) => ({
      coins: acc.coins + stat.totalCoinsEarned,
      points: acc.points + stat.totalPointsEarned,
    }),
    { coins: 0, points: 0 }
  )

  // Get top patterns by completed tests
  const patternTestCounts = completedAssignments.reduce((acc, assignment) => {
    acc[assignment.patternId] = (acc[assignment.patternId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topPatterns = Object.entries(patternTestCounts)
    .map(([patternId, count]) => ({ patternId, completedTests: count }))
    .sort((a, b) => b.completedTests - a.completedTests)
    .slice(0, 5)

  return {
    totalTesters: stats.length,
    activeTesters,
    totalTests: assignments.length,
    completedTests: completedAssignments.length,
    averageCompletionRate:
      assignments.length > 0 ? (completedAssignments.length / assignments.length) * 100 : 0,
    totalRewardsDistributed,
    topPatterns,
  }
}
