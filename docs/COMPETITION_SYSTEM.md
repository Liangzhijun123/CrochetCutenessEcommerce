# Competition System Documentation

## Overview

The Competition System allows administrators to create and manage community competitions where users can submit entries and vote for their favorites. This implements Requirements 5.1, 5.2, 5.3, 5.4, and 5.5 from the project specifications.

## Features

### 1. Competition Management (Requirement 5.1)
- **Admin-only creation**: Only administrators can create competitions
- **Competition lifecycle**: Draft → Active → Voting → Completed
- **Flexible configuration**: Set entry periods, voting periods, prizes, and rules
- **Status management**: Track competition progress through different phases

### 2. Competition Creation and Configuration (Requirement 5.2)
- **Rich competition details**: Title, description, rules, and prize information
- **Date management**: Separate entry and voting periods
- **Entry limits**: Optional maximum number of entries
- **Status control**: Draft, active, voting, completed, or cancelled states

### 3. Entry Submission with Photo Uploads (Requirement 5.3)
- **Photo uploads**: Users can upload images of their crochet work
- **Entry descriptions**: Detailed descriptions of projects and techniques
- **Validation**: File size limits (5MB), image format validation
- **One entry per user**: Prevents duplicate submissions
- **Auto-approval**: Entries are automatically approved (can be extended with moderation)

### 4. Voting System with Fraud Prevention (Requirement 5.4)
- **One vote per user**: Users can only vote once per competition
- **Self-vote prevention**: Users cannot vote for their own entries
- **IP tracking**: Optional IP address logging for fraud detection
- **Vote counting**: Real-time vote tallies for each entry
- **Voting periods**: Configurable voting start and end dates

### 5. Winner Selection and Prize Distribution (Requirement 5.5)
- **Automatic winner selection**: Based on highest vote count
- **Winner announcement**: Competition status updated to completed
- **Prize tracking**: Mark prizes as distributed
- **Participation history**: Track user competition participation and wins

## Database Schema

### Competition
```typescript
{
  id: string
  title: string
  description: string
  rules: string
  startDate: string
  endDate: string
  prizeDescription: string
  status: "draft" | "active" | "voting" | "completed" | "cancelled"
  votingStartDate?: string
  votingEndDate?: string
  maxEntries?: number
  winnerId?: string
  winnerAnnouncedAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

### CompetitionEntry
```typescript
{
  id: string
  competitionId: string
  userId: string
  description: string
  photoUrl: string
  votes: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}
```

### CompetitionVote
```typescript
{
  id: string
  competitionId: string
  entryId: string
  userId: string
  votedAt: string
  ipAddress?: string
}
```

### CompetitionParticipation
```typescript
{
  id: string
  userId: string
  competitionId: string
  entryId: string
  participatedAt: string
  won: boolean
  prizeReceived?: boolean
  prizeReceivedAt?: string
}
```

## API Endpoints

### Competition Management

#### GET /api/competitions
Get all competitions or filter by status
- Query params: `status`, `active`
- Returns: List of competitions with creator info

#### POST /api/competitions
Create a new competition (Admin only)
- Body: Competition data
- Returns: Created competition

#### GET /api/competitions/[id]
Get competition details
- Query params: `details=true` for full details, `stats=true` for statistics
- Returns: Competition with optional details/stats

#### PUT /api/competitions/[id]
Update competition (Admin only)
- Body: Updated fields
- Returns: Updated competition

#### DELETE /api/competitions/[id]
Delete competition (Admin only)
- Query params: `adminId`
- Returns: Success message

### Entry Management

#### GET /api/competitions/[id]/entries
Get all entries for a competition
- Returns: List of entries with user info

#### POST /api/competitions/[id]/entries
Submit an entry to a competition
- Body: `{ userId, description, photoUrl }`
- Returns: Created entry

### Voting

#### POST /api/competitions/[id]/vote
Vote for an entry
- Body: `{ userId, entryId }`
- Returns: Vote confirmation

#### GET /api/competitions/[id]/vote
Check if user has voted
- Query params: `userId`
- Returns: Vote status

### Winner Selection

#### POST /api/competitions/[id]/winner
Select winner (Admin only)
- Body: `{ adminId }`
- Returns: Winner information

#### PUT /api/competitions/[id]/winner
Mark prize as distributed (Admin only)
- Body: `{ adminId, userId }`
- Returns: Updated participation record

### User History

#### GET /api/competitions/user/[userId]
Get user's competition history
- Returns: Participation history and statistics

## Frontend Components

### User-Facing Components

#### CompetitionList
- Displays all competitions with filtering
- Shows competition status, dates, and prizes
- Links to competition details

#### CompetitionDetail
- Full competition information
- Entry submission form
- Rules and guidelines
- Entry gallery with voting

#### CompetitionEntryForm
- Photo upload interface
- Description input
- Validation and error handling

#### CompetitionEntries
- Grid display of all entries
- Vote buttons (when voting is active)
- Entry details and vote counts

### Admin Components

#### CompetitionManagement
- Create/edit/delete competitions
- Set competition parameters
- Select winners
- Track competition status

## Usage Examples

### Creating a Competition (Admin)
```typescript
const competition = await fetch('/api/competitions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Summer Crochet Challenge',
    description: 'Show off your summer-themed projects',
    rules: 'Competition rules here...',
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    votingStartDate: '2024-07-01T00:00:00Z',
    votingEndDate: '2024-07-07T23:59:59Z',
    prizeDescription: '$100 gift card',
    status: 'active',
    createdBy: adminUserId
  })
})
```

### Submitting an Entry
```typescript
const entry = await fetch(`/api/competitions/${competitionId}/entries`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUserId,
    description: 'My beautiful summer blanket...',
    photoUrl: uploadedPhotoUrl
  })
})
```

### Voting for an Entry
```typescript
const vote = await fetch(`/api/competitions/${competitionId}/vote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUserId,
    entryId: selectedEntryId
  })
})
```

### Selecting a Winner (Admin)
```typescript
const winner = await fetch(`/api/competitions/${competitionId}/winner`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: adminUserId
  })
})
```

## Fraud Prevention

The system includes several fraud prevention measures:

1. **One Vote Per User**: Each user can only vote once per competition
2. **Self-Vote Prevention**: Users cannot vote for their own entries
3. **IP Address Logging**: Optional IP tracking for vote analysis
4. **Entry Validation**: Users can only submit one entry per competition
5. **Admin Controls**: Only administrators can create competitions and select winners

## Future Enhancements

Potential improvements for the competition system:

1. **Entry Moderation**: Admin approval required before entries are visible
2. **Multiple Winners**: Support for 1st, 2nd, 3rd place
3. **Categories**: Different competition categories or themes
4. **Notifications**: Email/push notifications for competition updates
5. **Advanced Fraud Detection**: Machine learning-based vote fraud detection
6. **Entry Comments**: Allow users to comment on entries
7. **Share Features**: Social media sharing for entries
8. **Leaderboards**: Top participants and winners showcase
9. **Recurring Competitions**: Templates for monthly/seasonal competitions
10. **Entry Editing**: Allow users to update their entries before deadline

## Testing

The competition system includes comprehensive tests:

- Unit tests for database functions
- API endpoint tests
- Fraud prevention validation
- Winner selection logic
- Entry submission validation

Run tests with:
```bash
npm test lib/__tests__/competition-db.test.ts
```

## Security Considerations

1. **Admin-Only Actions**: Competition creation, editing, and winner selection require admin role
2. **Input Validation**: All user inputs are validated for type, length, and format
3. **File Upload Security**: Image uploads are validated for size and type
4. **SQL Injection Prevention**: Using parameterized queries (when using real database)
5. **XSS Prevention**: User-generated content is sanitized
6. **Rate Limiting**: Consider adding rate limits for voting and entry submission

## Performance Considerations

1. **Image Optimization**: Uploaded images should be optimized and resized
2. **Caching**: Competition data can be cached for better performance
3. **Pagination**: Large entry lists should be paginated
4. **Lazy Loading**: Images should be lazy-loaded in entry galleries
5. **Database Indexing**: Index competition status, dates, and user IDs

## Accessibility

The competition system follows accessibility best practices:

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: Meets WCAG AA standards
4. **Focus Indicators**: Clear focus states for all interactive elements
5. **Alt Text**: All images have descriptive alt text
