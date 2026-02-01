// Competition database models and functions for the crochet community platform
// Implements Requirements 5.1, 5.2, 5.3, 5.4, 5.5

import { 
  getItem, 
  setItem, 
  getUserById,
  type User 
} from "./local-storage-db"

// Competition types based on design document
export type Competition = {
  id: string
  title: string
  description: string
  rules: string
  startDate: string
  endDate: string
  prizeDescription: string
  status: "draft" | "active" | "voting" | "completed" | "cancelled"
  createdBy: string // Admin user ID
  createdAt: string
  updatedAt: string
  // Additional fields for management
  maxEntries?: number
  entryRequirements?: string
  votingStartDate?: string
  votingEndDate?: string
  winnerId?: string
  winnerAnnouncedAt?: string
}

export type CompetitionEntry = {
  id: string
  competitionId: string
  userId: string
  description: string
  photoUrl: string
  votes: number
  submittedAt: string
  // Additional fields
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
}

export type CompetitionVote = {
  id: string
  competitionId: string
  entryId: string
  userId: string
  votedAt: string
  ipAddress?: string // For fraud prevention
}

export type CompetitionParticipation = {
  id: string
  userId: string
  competitionId: string
  entryId: string
  participatedAt: string
  won: boolean
  prizeReceived?: boolean
  prizeReceivedAt?: string
}

// Storage keys
const COMPETITIONS_KEY = "crochet_competitions"
const COMPETITION_ENTRIES_KEY = "crochet_competition_entries"
const COMPETITION_VOTES_KEY = "crochet_competition_votes"
const COMPETITION_PARTICIPATION_KEY = "crochet_competition_participation"

// Competition CRUD operations
export const getCompetitions = (): Competition[] => {
  return getItem(COMPETITIONS_KEY, []) as Competition[]
}

export const getCompetitionById = (id: string): Competition | undefined => {
  const competitions = getCompetitions()
  return competitions.find((competition) => competition.id === id)
}

export const getActiveCompetitions = (): Competition[] => {
  const competitions = getCompetitions()
  const now = new Date()
  return competitions.filter((competition) => {
    const startDate = new Date(competition.startDate)
    const endDate = new Date(competition.endDate)
    return competition.status === "active" && startDate <= now && endDate >= now
  })
}

export const getCompetitionsByStatus = (status: Competition["status"]): Competition[] => {
  const competitions = getCompetitions()
  return competitions.filter((competition) => competition.status === status)
}

export const createCompetition = (
  competition: Omit<Competition, "id" | "createdAt" | "updatedAt">
): Competition => {
  const competitions = getCompetitions()
  
  // Validate creator is admin
  const creator = getUserById(competition.createdBy)
  if (!creator || creator.role !== "admin") {
    throw new Error("Only administrators can create competitions")
  }
  
  // Validate dates
  const startDate = new Date(competition.startDate)
  const endDate = new Date(competition.endDate)
  
  if (startDate >= endDate) {
    throw new Error("End date must be after start date")
  }
  
  if (competition.votingStartDate && competition.votingEndDate) {
    const votingStart = new Date(competition.votingStartDate)
    const votingEnd = new Date(competition.votingEndDate)
    
    if (votingStart >= votingEnd) {
      throw new Error("Voting end date must be after voting start date")
    }
    
    if (votingStart < endDate) {
      throw new Error("Voting cannot start before entry submission ends")
    }
  }
  
  const newCompetition: Competition = {
    id: crypto.randomUUID(),
    ...competition,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  competitions.push(newCompetition)
  setItem(COMPETITIONS_KEY, competitions)
  
  return newCompetition
}

export const updateCompetition = (
  id: string,
  updates: Partial<Competition>
): Competition => {
  const competitions = getCompetitions()
  const competitionIndex = competitions.findIndex((competition) => competition.id === id)
  
  if (competitionIndex === -1) {
    throw new Error("Competition not found")
  }
  
  // Validate date updates if provided
  const existingCompetition = competitions[competitionIndex]
  const startDate = new Date(updates.startDate || existingCompetition.startDate)
  const endDate = new Date(updates.endDate || existingCompetition.endDate)
  
  if (startDate >= endDate) {
    throw new Error("End date must be after start date")
  }
  
  const updatedCompetition = {
    ...existingCompetition,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  competitions[competitionIndex] = updatedCompetition
  setItem(COMPETITIONS_KEY, competitions)
  
  return updatedCompetition
}

export const deleteCompetition = (id: string): boolean => {
  const competitions = getCompetitions()
  const filteredCompetitions = competitions.filter((competition) => competition.id !== id)
  
  if (filteredCompetitions.length === competitions.length) {
    return false
  }
  
  setItem(COMPETITIONS_KEY, filteredCompetitions)
  return true
}

// Competition Entry operations
export const getCompetitionEntries = (): CompetitionEntry[] => {
  return getItem(COMPETITION_ENTRIES_KEY, []) as CompetitionEntry[]
}

export const getCompetitionEntryById = (id: string): CompetitionEntry | undefined => {
  const entries = getCompetitionEntries()
  return entries.find((entry) => entry.id === id)
}

export const getEntriesByCompetition = (competitionId: string): CompetitionEntry[] => {
  const entries = getCompetitionEntries()
  return entries
    .filter((entry) => entry.competitionId === competitionId && entry.status === "approved")
    .sort((a, b) => b.votes - a.votes)
}

export const getEntriesByUser = (userId: string): CompetitionEntry[] => {
  const entries = getCompetitionEntries()
  return entries.filter((entry) => entry.userId === userId)
}

export const getUserEntryForCompetition = (
  userId: string,
  competitionId: string
): CompetitionEntry | undefined => {
  const entries = getCompetitionEntries()
  return entries.find(
    (entry) => entry.userId === userId && entry.competitionId === competitionId
  )
}

export const createCompetitionEntry = (
  entry: Omit<CompetitionEntry, "id" | "submittedAt" | "votes" | "status">
): CompetitionEntry => {
  const entries = getCompetitionEntries()
  
  // Validate competition exists and is active
  const competition = getCompetitionById(entry.competitionId)
  if (!competition) {
    throw new Error("Competition not found")
  }
  
  if (competition.status !== "active") {
    throw new Error("Competition is not accepting entries")
  }
  
  // Check if competition is still open for entries
  const now = new Date()
  const endDate = new Date(competition.endDate)
  
  if (now > endDate) {
    throw new Error("Competition entry period has ended")
  }
  
  // Check if user already has an entry for this competition
  const existingEntry = getUserEntryForCompetition(entry.userId, entry.competitionId)
  if (existingEntry) {
    throw new Error("You have already submitted an entry for this competition")
  }
  
  // Check max entries limit if set
  if (competition.maxEntries) {
    const currentEntries = getEntriesByCompetition(entry.competitionId)
    if (currentEntries.length >= competition.maxEntries) {
      throw new Error("Competition has reached maximum number of entries")
    }
  }
  
  const newEntry: CompetitionEntry = {
    id: crypto.randomUUID(),
    ...entry,
    votes: 0,
    status: "approved", // Auto-approve for now, can add moderation later
    submittedAt: new Date().toISOString(),
  }
  
  entries.push(newEntry)
  setItem(COMPETITION_ENTRIES_KEY, entries)
  
  // Create participation record
  createCompetitionParticipation({
    userId: entry.userId,
    competitionId: entry.competitionId,
    entryId: newEntry.id,
    won: false,
  })
  
  return newEntry
}

export const updateCompetitionEntry = (
  id: string,
  updates: Partial<CompetitionEntry>
): CompetitionEntry => {
  const entries = getCompetitionEntries()
  const entryIndex = entries.findIndex((entry) => entry.id === id)
  
  if (entryIndex === -1) {
    throw new Error("Entry not found")
  }
  
  const updatedEntry = {
    ...entries[entryIndex],
    ...updates,
  }
  
  entries[entryIndex] = updatedEntry
  setItem(COMPETITION_ENTRIES_KEY, entries)
  
  return updatedEntry
}

export const deleteCompetitionEntry = (id: string, userId: string): boolean => {
  const entries = getCompetitionEntries()
  const entry = entries.find((e) => e.id === id)
  
  if (!entry) {
    return false
  }
  
  // Verify the user owns this entry
  if (entry.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own entries")
  }
  
  const filteredEntries = entries.filter((entry) => entry.id !== id)
  setItem(COMPETITION_ENTRIES_KEY, filteredEntries)
  
  return true
}

// Competition Vote operations
export const getCompetitionVotes = (): CompetitionVote[] => {
  return getItem(COMPETITION_VOTES_KEY, []) as CompetitionVote[]
}

export const getVotesByCompetition = (competitionId: string): CompetitionVote[] => {
  const votes = getCompetitionVotes()
  return votes.filter((vote) => vote.competitionId === competitionId)
}

export const getVotesByEntry = (entryId: string): CompetitionVote[] => {
  const votes = getCompetitionVotes()
  return votes.filter((vote) => vote.entryId === entryId)
}

export const getUserVoteForCompetition = (
  userId: string,
  competitionId: string
): CompetitionVote | undefined => {
  const votes = getCompetitionVotes()
  return votes.find(
    (vote) => vote.userId === userId && vote.competitionId === competitionId
  )
}

export const createCompetitionVote = (
  vote: Omit<CompetitionVote, "id" | "votedAt">
): CompetitionVote => {
  const votes = getCompetitionVotes()
  
  // Validate competition exists
  const competition = getCompetitionById(vote.competitionId)
  if (!competition) {
    throw new Error("Competition not found")
  }
  
  // Check if competition is in voting phase
  if (competition.status !== "voting" && competition.status !== "active") {
    throw new Error("Competition is not accepting votes")
  }
  
  // Check voting period if defined
  if (competition.votingStartDate && competition.votingEndDate) {
    const now = new Date()
    const votingStart = new Date(competition.votingStartDate)
    const votingEnd = new Date(competition.votingEndDate)
    
    if (now < votingStart || now > votingEnd) {
      throw new Error("Voting period is not active")
    }
  }
  
  // Validate entry exists and belongs to competition
  const entry = getCompetitionEntryById(vote.entryId)
  if (!entry || entry.competitionId !== vote.competitionId) {
    throw new Error("Invalid entry for this competition")
  }
  
  // Check if user already voted in this competition (fraud prevention)
  const existingVote = getUserVoteForCompetition(vote.userId, vote.competitionId)
  if (existingVote) {
    throw new Error("You have already voted in this competition")
  }
  
  // Prevent users from voting for their own entry
  if (entry.userId === vote.userId) {
    throw new Error("You cannot vote for your own entry")
  }
  
  const newVote: CompetitionVote = {
    id: crypto.randomUUID(),
    ...vote,
    votedAt: new Date().toISOString(),
  }
  
  votes.push(newVote)
  setItem(COMPETITION_VOTES_KEY, votes)
  
  // Update entry vote count
  updateCompetitionEntry(vote.entryId, {
    votes: entry.votes + 1,
  })
  
  return newVote
}

// Competition Participation operations
export const getCompetitionParticipations = (): CompetitionParticipation[] => {
  return getItem(COMPETITION_PARTICIPATION_KEY, []) as CompetitionParticipation[]
}

export const getParticipationsByUser = (userId: string): CompetitionParticipation[] => {
  const participations = getCompetitionParticipations()
  return participations.filter((participation) => participation.userId === userId)
}

export const getParticipationsByCompetition = (
  competitionId: string
): CompetitionParticipation[] => {
  const participations = getCompetitionParticipations()
  return participations.filter(
    (participation) => participation.competitionId === competitionId
  )
}

export const createCompetitionParticipation = (
  participation: Omit<CompetitionParticipation, "id" | "participatedAt">
): CompetitionParticipation => {
  const participations = getCompetitionParticipations()
  
  const newParticipation: CompetitionParticipation = {
    id: crypto.randomUUID(),
    ...participation,
    participatedAt: new Date().toISOString(),
  }
  
  participations.push(newParticipation)
  setItem(COMPETITION_PARTICIPATION_KEY, participations)
  
  return newParticipation
}

export const updateCompetitionParticipation = (
  id: string,
  updates: Partial<CompetitionParticipation>
): CompetitionParticipation => {
  const participations = getCompetitionParticipations()
  const participationIndex = participations.findIndex(
    (participation) => participation.id === id
  )
  
  if (participationIndex === -1) {
    throw new Error("Participation record not found")
  }
  
  const updatedParticipation = {
    ...participations[participationIndex],
    ...updates,
  }
  
  participations[participationIndex] = updatedParticipation
  setItem(COMPETITION_PARTICIPATION_KEY, participations)
  
  return updatedParticipation
}

// Winner selection and prize distribution
export const selectCompetitionWinner = (competitionId: string): CompetitionEntry => {
  const competition = getCompetitionById(competitionId)
  if (!competition) {
    throw new Error("Competition not found")
  }
  
  const entries = getEntriesByCompetition(competitionId)
  if (entries.length === 0) {
    throw new Error("No entries found for this competition")
  }
  
  // Get entry with highest votes
  const winningEntry = entries.reduce((prev, current) => 
    current.votes > prev.votes ? current : prev
  )
  
  // Update competition with winner
  updateCompetition(competitionId, {
    status: "completed",
    winnerId: winningEntry.userId,
    winnerAnnouncedAt: new Date().toISOString(),
  })
  
  // Update participation record
  const participations = getParticipationsByCompetition(competitionId)
  const winnerParticipation = participations.find(
    (p) => p.entryId === winningEntry.id
  )
  
  if (winnerParticipation) {
    updateCompetitionParticipation(winnerParticipation.id, {
      won: true,
    })
  }
  
  return winningEntry
}

export const markPrizeAsDistributed = (
  competitionId: string,
  userId: string
): CompetitionParticipation => {
  const participations = getParticipationsByCompetition(competitionId)
  const participation = participations.find(
    (p) => p.userId === userId && p.won === true
  )
  
  if (!participation) {
    throw new Error("Winner participation record not found")
  }
  
  return updateCompetitionParticipation(participation.id, {
    prizeReceived: true,
    prizeReceivedAt: new Date().toISOString(),
  })
}

// Helper functions
export const getCompetitionWithDetails = (competitionId: string) => {
  const competition = getCompetitionById(competitionId)
  if (!competition) {
    return null
  }
  
  const entries = getEntriesByCompetition(competitionId)
  const votes = getVotesByCompetition(competitionId)
  const participations = getParticipationsByCompetition(competitionId)
  
  // Get creator info
  const creator = getUserById(competition.createdBy)
  
  // Get winner info if competition is completed
  let winner: User | undefined
  if (competition.winnerId) {
    winner = getUserById(competition.winnerId)
  }
  
  return {
    competition,
    entries,
    totalVotes: votes.length,
    totalParticipants: participations.length,
    creator,
    winner,
  }
}

export const getCompetitionStats = (competitionId: string) => {
  const competition = getCompetitionById(competitionId)
  if (!competition) {
    return null
  }
  
  const entries = getEntriesByCompetition(competitionId)
  const votes = getVotesByCompetition(competitionId)
  const participations = getParticipationsByCompetition(competitionId)
  
  return {
    totalEntries: entries.length,
    totalVotes: votes.length,
    totalParticipants: participations.length,
    averageVotesPerEntry: entries.length > 0 ? votes.length / entries.length : 0,
    topEntry: entries.length > 0 ? entries[0] : null,
  }
}

export const getUserCompetitionHistory = (userId: string) => {
  const participations = getParticipationsByUser(userId)
  const entries = getEntriesByUser(userId)
  
  const history = participations.map((participation) => {
    const competition = getCompetitionById(participation.competitionId)
    const entry = entries.find((e) => e.id === participation.entryId)
    
    return {
      participation,
      competition,
      entry,
    }
  })
  
  return history
}
