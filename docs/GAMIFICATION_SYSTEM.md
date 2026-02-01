# Gamification System Documentation

## Overview

The Crochet Community Platform includes a comprehensive gamification system that rewards users for engagement and purchases. The system consists of two main currencies (coins and points), a rewards shop, analytics tracking, and admin management tools.

## Features Implemented

### 1. Daily Coin Claiming System ✅
- **Location**: `/app/gamification` page, Coins tab
- **Components**: `components/profile/coins-dashboard.tsx`
- **API Endpoints**:
  - `GET /api/coins/balance` - Get user's coin balance and recent transactions
  - `POST /api/coins/claim` - Claim daily coins
  - `GET /api/coins/history` - Get coin transaction history with calendar

**Features**:
- Daily coin claiming with calendar interface
- Login streak tracking with bonus rewards
- Visual calendar showing claimed days, missed days, and today
- Streak bonuses: 3+ days = +1 coin, 7+ days = +2 coins
- Base daily reward: 3 coins
- Transaction history with detailed descriptions

### 2. Points Calculation Based on Purchase Activity ✅
- **Location**: Automatic on purchases
- **Components**: `components/profile/points-dashboard.tsx`
- **API Endpoints**:
  - `GET /api/points/balance` - Get user's points balance
  - `GET /api/points/history` - Get points transaction history

**Features**:
- Automatic points award on purchases (1 point per $1 spent)
- Loyalty tier system (Bronze, Silver, Gold, Platinum)
- Tier-based benefits and perks
- Points transaction history
- Tier progress tracking

**Loyalty Tiers**:
- **Bronze**: 0-199 points (default)
- **Silver**: 200-499 points (free shipping on $35+, early access to sales)
- **Gold**: 500-999 points (free shipping on all orders, VIP support)
- **Platinum**: 1000+ points (1.5x points multiplier, priority testing access)

### 3. Coin and Points Transaction History ✅
- **Location**: `/app/gamification` page
- **Components**: Both dashboards include transaction history
- **API Endpoints**: History endpoints for both coins and points

**Features**:
- Detailed transaction logs with timestamps
- Transaction type categorization
- Amount tracking (positive for earnings, negative for spending)
- Descriptions for each transaction
- Sortable and filterable views

### 4. Reward System with Bonus Calculations ✅
- **Location**: `/app/gamification` page, Rewards tab
- **Components**: `components/gamification/rewards-shop.tsx`
- **API Endpoints**:
  - `GET /api/gamification/rewards` - Get available rewards
  - `POST /api/gamification/rewards` - Redeem a reward

**Available Rewards**:

**Points Rewards**:
- $5 Discount (100 points)
- $10 Discount (200 points)
- Free Shipping (50 points)
- Exclusive Pattern (200 points)
- VIP Support (300 points)

**Coins Rewards**:
- Small Coin Pack: 50 coins (100 points)
- Medium Coin Pack: 150 coins (250 points)
- Large Coin Pack: 400 coins (500 points)

**Features**:
- Real-time balance checking
- Affordability indicators
- Confirmation dialogs before redemption
- Automatic balance updates
- Transaction logging for all redemptions

### 5. Gamification Analytics and User Engagement Tracking ✅
- **Location**: `/app/gamification` page, Analytics tab
- **Components**: `components/gamification/gamification-analytics.tsx`
- **API Endpoints**:
  - `GET /api/gamification/analytics` - Get comprehensive analytics

**Analytics Features**:
- **Engagement Score**: 0-100 score based on multiple factors
  - Current streak (30 points max)
  - Total days claimed (20 points max)
  - Total coins earned (20 points max)
  - Total points earned (20 points max)
  - Recent activity (10 points max)

- **Activity Timeline**: 30-day chart showing:
  - Daily coins earned
  - Daily points earned
  - Claim activity

- **Transaction Breakdown**: Pie charts showing:
  - Coins by source (daily claims, bonuses, purchases, etc.)
  - Points by source (purchases, reviews, referrals, etc.)

- **Milestones System**:
  - Streak milestones (7, 14, 30, 60, 100 days)
  - Claim milestones (10, 30, 60, 100, 365 days)
  - Coin milestones (100, 500, 1000, 5000 coins)
  - Points milestones (100, 500, 1000, 5000 points)
  - Progress tracking for each milestone
  - Completion badges

### 6. Admin Gamification Management ✅
- **Location**: `/admin-dashboard` page, Gamification tab
- **Components**: `components/admin/gamification-management.tsx`
- **API Endpoints**:
  - `GET /api/admin/gamification` - Get platform-wide statistics
  - `POST /api/admin/gamification` - Perform admin actions

**Admin Features**:
- **Platform Overview**:
  - Total users and active users
  - Total coins/points in circulation
  - Total coins/points issued
  - Average streak and daily claim rate

- **Tier Distribution**: Visual breakdown of users by loyalty tier

- **Leaderboards**:
  - Top users by coins
  - Top users by points
  - Quick actions to adjust balances

- **Recent Activity**: Real-time transaction monitoring

- **Admin Actions**:
  - Add/remove coins from user accounts
  - Add/remove points from user accounts
  - Reset login streaks
  - Set loyalty tiers manually
  - All actions logged with reasons

## Database Schema

### User Fields (Extended)
```typescript
{
  coins: number              // Current coin balance
  points: number             // Current points balance
  loginStreak: number        // Current consecutive login days
  lastLogin: string          // Last login timestamp
  lastCoinClaim: string      // Last coin claim timestamp
  loyaltyTier: string        // bronze | silver | gold | platinum
  isActive: boolean          // Account status
}
```

### DailyCoinClaim
```typescript
{
  id: string
  userId: string
  claimDate: string          // YYYY-MM-DD format
  coinsAwarded: number
  claimedAt: string
}
```

### CoinTransaction
```typescript
{
  id: string
  userId: string
  type: string               // daily_claim | purchase_bonus | streak_bonus | admin_adjustment
  amount: number
  description: string
  createdAt: string
}
```

### PointsTransaction
```typescript
{
  id: string
  userId: string
  type: string               // purchase | review | referral | admin_adjustment
  amount: number
  description: string
  orderId?: string
  createdAt: string
}
```

## API Endpoints Summary

### User Endpoints
- `GET /api/coins/balance` - Get coin balance and recent transactions
- `POST /api/coins/claim` - Claim daily coins
- `GET /api/coins/history` - Get coin history with calendar
- `GET /api/points/balance` - Get points balance and tier info
- `GET /api/points/history` - Get points transaction history
- `GET /api/gamification/rewards` - Get available rewards
- `POST /api/gamification/rewards` - Redeem a reward
- `GET /api/gamification/analytics` - Get user analytics

### Admin Endpoints
- `GET /api/admin/gamification` - Get platform statistics
- `POST /api/admin/gamification` - Perform admin actions

## Usage Examples

### For Users

#### Claiming Daily Coins
1. Navigate to `/gamification`
2. Click on the "Coins" tab
3. Click "CLAIM COINS" button (available once per day)
4. View updated balance and streak

#### Redeeming Rewards
1. Navigate to `/gamification`
2. Click on the "Rewards" tab
3. Browse available rewards
4. Click "Redeem" on desired reward
5. Confirm redemption in dialog

#### Viewing Analytics
1. Navigate to `/gamification`
2. Click on the "Analytics" tab
3. View engagement score, activity charts, and milestones

### For Admins

#### Adjusting User Balances
1. Navigate to `/admin-dashboard`
2. Click on "Gamification" tab
3. Find user in leaderboards
4. Click + or - button next to their balance
5. Enter amount and reason
6. Confirm adjustment

#### Monitoring Platform Activity
1. Navigate to `/admin-dashboard`
2. Click on "Gamification" tab
3. View overview cards for key metrics
4. Check tier distribution
5. Monitor recent transactions

## Integration Points

### Purchase Integration
When a purchase is completed:
```typescript
// In payment processing
import { addPointsForPurchase } from '@/lib/local-storage-db'

// Award points
addPointsForPurchase(userId, purchaseAmount, orderId)
```

### Login Integration
When a user logs in:
```typescript
// In authentication
import { updateUserLoginStreak } from '@/lib/local-storage-db'

// Update streak
updateUserLoginStreak(userId)
```

## Future Enhancements

Potential additions to the gamification system:
1. **Seasonal Events**: Special coin bonuses during holidays
2. **Achievements System**: Badges for specific accomplishments
3. **Referral Program**: Bonus points for referring friends
4. **Social Sharing**: Coins for sharing patterns on social media
5. **Challenges**: Weekly/monthly challenges with rewards
6. **Leaderboards**: Public leaderboards with prizes
7. **Reward Expiration**: Time-limited rewards
8. **Tiered Rewards**: Different rewards for different tiers
9. **Coin Marketplace**: Use coins to purchase patterns
10. **Points Redemption**: Redeem points for real discounts

## Testing

### Manual Testing Checklist
- [ ] Claim daily coins successfully
- [ ] Verify streak bonus calculation
- [ ] Check calendar displays correctly
- [ ] Earn points from purchase
- [ ] Verify tier progression
- [ ] Redeem rewards successfully
- [ ] View analytics charts
- [ ] Complete milestones
- [ ] Admin: Adjust user balances
- [ ] Admin: View platform statistics

### Test Scenarios
1. **New User**: Should start with 0 coins, 0 points, Bronze tier
2. **Daily Claim**: Should award 3 coins, increase streak
3. **Missed Day**: Should reset streak to 1
4. **Purchase**: Should award points equal to purchase amount
5. **Tier Upgrade**: Should happen automatically at thresholds
6. **Reward Redemption**: Should deduct cost and apply benefit
7. **Admin Adjustment**: Should update balance and create transaction

## Troubleshooting

### Common Issues

**Issue**: Daily coins button disabled
- **Solution**: Check if coins already claimed today (lastCoinClaim date)

**Issue**: Points not awarded after purchase
- **Solution**: Verify purchase completion and check points transaction log

**Issue**: Analytics not loading
- **Solution**: Check browser console for API errors, verify authentication

**Issue**: Rewards not appearing
- **Solution**: Verify user has sufficient balance, check reward definitions

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Admin endpoints check for admin role
3. **Rate Limiting**: Consider adding rate limits to prevent abuse
4. **Validation**: All inputs validated on server side
5. **Transaction Logging**: All balance changes logged for audit trail

## Performance Considerations

1. **Caching**: Consider caching user balances
2. **Pagination**: Transaction history should be paginated for large datasets
3. **Indexing**: Database indexes on userId and createdAt fields
4. **Aggregation**: Pre-calculate statistics for admin dashboard

## Maintenance

### Regular Tasks
- Monitor coin/point inflation
- Review and adjust reward costs
- Analyze engagement metrics
- Update milestone targets
- Review admin action logs

### Database Cleanup
- Archive old transactions (>1 year)
- Clean up inactive user data
- Optimize transaction tables

## Support

For issues or questions:
- Check this documentation first
- Review API endpoint responses
- Check browser console for errors
- Contact development team with specific error messages

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready
