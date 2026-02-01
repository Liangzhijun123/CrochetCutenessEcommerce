# Advertisement System Documentation

## Overview

The Advertisement System provides comprehensive advertisement management, targeting, tracking, and analytics capabilities for the Crochet Community Platform. It enables the platform to generate revenue through targeted advertisements while providing detailed performance metrics and billing management.

**Requirements Implemented:** 7.1, 7.3, 7.4, 7.5

## Features

### 1. Advertisement Management
- Create and manage advertisements with multiple formats (banner, video, sidebar, inline)
- Configure ad placements across different platform areas
- Set budgets and campaign durations
- Control ad status (draft, active, paused, completed, rejected)
- Priority-based ad serving

### 2. Advertiser Management
- Advertiser account creation and approval workflow
- Company profile and contact information management
- Billing address and payment method configuration
- Account status management (active, suspended, pending approval)
- Total spending tracking

### 3. Ad Targeting
- User role targeting (user, creator, admin)
- Category-based targeting
- Difficulty level targeting
- Interest-based targeting
- User exclusion lists
- Age range targeting (optional)

### 4. Performance Tracking
- Impression tracking
- Click tracking with cost-per-click (CPC) model
- Conversion tracking with value attribution
- Session-based analytics
- Real-time budget monitoring

### 5. Analytics & Reporting
- Individual ad performance metrics
  - Total impressions, clicks, conversions
  - Click-through rate (CTR)
  - Conversion rate
  - Cost per click (CPC)
  - Cost per conversion
  - Return on investment (ROI)
- Advertiser performance aggregation
- Platform-wide revenue reporting
- Date range filtering

### 6. Revenue Tracking
- Automatic cost calculation on clicks
- Advertiser spending updates
- Platform revenue aggregation
- Invoice generation (structure in place)
- Budget exhaustion detection

## Architecture

### Database Models

#### Advertisement
```typescript
{
  id: string
  advertiserId: string
  title: string
  description: string
  imageUrl: string
  clickUrl: string
  adType: 'banner' | 'video' | 'sidebar' | 'inline'
  placement: 'homepage' | 'marketplace' | 'pattern-detail' | 'sidebar' | 'footer'
  targeting: AdTargeting
  budget: number
  spent: number
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
  startDate: string
  endDate: string
  priority: number
  createdAt: string
  updatedAt: string
}
```

#### Advertiser
```typescript
{
  id: string
  userId: string
  companyName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  billingAddress: Address
  paymentMethod: PaymentMethod
  totalSpent: number
  status: 'active' | 'suspended' | 'pending_approval'
  createdAt: string
  updatedAt: string
}
```

#### AdImpression
```typescript
{
  id: string
  adId: string
  userId?: string
  sessionId: string
  placement: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
}
```

#### AdClick
```typescript
{
  id: string
  adId: string
  impressionId: string
  userId?: string
  sessionId: string
  timestamp: string
  clickUrl: string
}
```

#### AdConversion
```typescript
{
  id: string
  adId: string
  clickId: string
  userId?: string
  conversionType: 'purchase' | 'signup' | 'pattern_view' | 'custom'
  conversionValue: number
  timestamp: string
  metadata?: Record<string, any>
}
```

## API Endpoints

### Advertisement Endpoints

#### GET /api/advertisements
Get all advertisements with optional filtering.

**Query Parameters:**
- `placement` - Filter by placement location
- `advertiserId` - Filter by advertiser
- `active` - Get only active ads (true/false)

**Response:**
```json
{
  "advertisements": [...],
  "total": 10
}
```

#### POST /api/advertisements
Create a new advertisement.

**Request Body:**
```json
{
  "advertiserId": "advertiser-id",
  "title": "Ad Title",
  "description": "Ad description",
  "imageUrl": "https://example.com/image.jpg",
  "clickUrl": "https://example.com",
  "adType": "banner",
  "placement": "homepage",
  "budget": 500,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "priority": 5,
  "status": "draft",
  "targeting": {}
}
```

#### GET /api/advertisements/[id]
Get a specific advertisement by ID.

#### PUT /api/advertisements/[id]
Update an advertisement.

#### DELETE /api/advertisements/[id]
Delete an advertisement.

### Tracking Endpoints

#### POST /api/advertisements/impressions
Track an ad impression.

**Request Body:**
```json
{
  "adId": "ad-id",
  "sessionId": "session-id",
  "placement": "homepage",
  "userId": "user-id" // optional
}
```

#### POST /api/advertisements/clicks
Track an ad click.

**Request Body:**
```json
{
  "adId": "ad-id",
  "impressionId": "impression-id",
  "sessionId": "session-id",
  "clickUrl": "https://example.com",
  "userId": "user-id" // optional
}
```

### Analytics Endpoints

#### GET /api/advertisements/analytics
Get advertisement analytics.

**Query Parameters:**
- `adId` - Get metrics for specific ad
- `advertiserId` - Get metrics for advertiser
- `platform=true` - Get platform-wide revenue
- `startDate` - Filter start date
- `endDate` - Filter end date

**Response (Ad Metrics):**
```json
{
  "metrics": {
    "adId": "ad-id",
    "adTitle": "Ad Title",
    "totalImpressions": 1000,
    "totalClicks": 50,
    "totalConversions": 5,
    "clickThroughRate": 5.0,
    "conversionRate": 10.0,
    "spent": 25.00,
    "budget": 500.00,
    "costPerClick": 0.50,
    "costPerConversion": 5.00,
    "roi": 150.0
  }
}
```

### Advertiser Endpoints

#### GET /api/advertisers
Get all advertisers or by userId.

**Query Parameters:**
- `userId` - Get advertiser by user ID

#### POST /api/advertisers
Create a new advertiser account.

**Request Body:**
```json
{
  "userId": "user-id",
  "companyName": "Company Name",
  "contactEmail": "contact@company.com",
  "contactPhone": "555-1234",
  "website": "https://company.com",
  "billingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "ST",
    "postalCode": "12345",
    "country": "USA"
  },
  "paymentMethod": {
    "type": "credit_card",
    "lastFour": "4242",
    "expiryDate": "12/25"
  }
}
```

#### GET /api/advertisers/[id]
Get a specific advertiser.

#### PUT /api/advertisers/[id]
Update an advertiser.

## Admin Interface

### Advertisement Management Component
Location: `components/admin/advertisement-management.tsx`

Features:
- Create, edit, and delete advertisements
- Filter by status (all, active, draft, paused, completed)
- Pause/resume active campaigns
- View ad details and configuration
- Manage ad budgets and dates

### Advertisement Analytics Component
Location: `components/admin/advertisement-analytics.tsx`

Features:
- Platform revenue overview
- Individual ad performance metrics
- Date range filtering
- Key performance indicators (KPIs)
- ROI tracking
- Budget utilization monitoring

### Advertiser Management Component
Location: `components/admin/advertiser-management.tsx`

Features:
- View all advertisers
- Approve/reject advertiser applications
- Suspend/activate advertiser accounts
- View advertiser performance metrics
- Contact information management
- Total spending tracking

## Client-Side Integration

### Advertisement Display Component
Location: `components/advertisement-display.tsx`

Usage:
```tsx
import AdvertisementDisplay from '@/components/advertisement-display'

// In your page component
<AdvertisementDisplay 
  placement="homepage"
  userContext={{
    userId: currentUser?.id,
    role: currentUser?.role,
    interests: currentUser?.interests,
    viewingCategory: 'amigurumi'
  }}
/>
```

Features:
- Automatic ad fetching based on placement
- Impression tracking on view
- Click tracking with external link opening
- Session-based analytics
- User-dismissible ads
- Multiple ad format support

## Cost Model

### Current Implementation
- **Cost Per Click (CPC):** $0.50 per click
- Costs are deducted from ad budget on each click
- Advertiser total spending is updated automatically
- Ads pause when budget is exhausted

### Future Enhancements
- Cost Per Impression (CPM) model
- Cost Per Conversion (CPA) model
- Dynamic pricing based on targeting
- Bid-based ad serving

## Targeting System

### How Targeting Works

1. **Ad Creation:** Advertiser specifies targeting criteria
2. **Ad Request:** Client requests ads for specific placement
3. **Matching:** System filters ads based on:
   - Active status
   - Date range
   - Budget availability
   - Placement match
   - Targeting criteria match
4. **Priority Sorting:** Matching ads sorted by priority
5. **Ad Serving:** Highest priority ad is served

### Targeting Options

```typescript
{
  userRoles: ['user', 'creator', 'admin'],
  categories: ['amigurumi', 'baby', 'home'],
  difficultyLevels: ['beginner', 'intermediate', 'advanced'],
  interests: ['crochet', 'knitting', 'crafts'],
  excludeUsers: ['user-id-1', 'user-id-2'],
  minAge: 18,
  maxAge: 65
}
```

## Analytics Calculations

### Click-Through Rate (CTR)
```
CTR = (Total Clicks / Total Impressions) × 100
```

### Conversion Rate
```
Conversion Rate = (Total Conversions / Total Clicks) × 100
```

### Cost Per Click (CPC)
```
CPC = Total Spent / Total Clicks
```

### Cost Per Conversion
```
Cost Per Conversion = Total Spent / Total Conversions
```

### Return on Investment (ROI)
```
ROI = ((Total Conversion Value - Total Spent) / Total Spent) × 100
```

## Testing

### Unit Tests
Location: `lib/__tests__/advertisement-db.test.ts`

Test Coverage:
- Advertisement CRUD operations
- Advertiser management
- Impression tracking
- Click tracking with cost updates
- Conversion tracking
- Performance metrics calculation
- Platform revenue calculation
- Targeting logic

Run tests:
```bash
npm test lib/__tests__/advertisement-db.test.ts
```

## Security Considerations

1. **Admin-Only Operations:**
   - Advertisement approval/rejection
   - Advertiser account management
   - Platform analytics access

2. **Advertiser Permissions:**
   - Can only manage their own advertisements
   - Cannot view other advertisers' data
   - Require approval before account activation

3. **Data Privacy:**
   - User IDs in tracking are optional
   - IP addresses and user agents stored for fraud detection
   - Session-based tracking for anonymous users

4. **Fraud Prevention:**
   - Session ID tracking prevents duplicate impressions
   - Click validation against impressions
   - Budget limits prevent overspending

## Future Enhancements

1. **Advanced Features:**
   - A/B testing for ad creatives
   - Automated bid optimization
   - Real-time budget pacing
   - Frequency capping
   - Dayparting (time-based targeting)

2. **Reporting:**
   - Downloadable reports
   - Scheduled email reports
   - Custom date range comparisons
   - Cohort analysis

3. **Integration:**
   - Third-party ad networks
   - Programmatic advertising
   - Ad verification services
   - Fraud detection services

4. **Billing:**
   - Automated invoicing
   - Payment processing integration
   - Credit system
   - Prepaid budgets

## Troubleshooting

### Ads Not Displaying
1. Check ad status is "active"
2. Verify date range includes current date
3. Ensure budget is not exhausted
4. Check placement matches request
5. Verify targeting criteria

### Tracking Not Working
1. Verify session ID generation
2. Check API endpoint responses
3. Ensure impression created before click
4. Validate ad ID exists

### Analytics Discrepancies
1. Check date range filters
2. Verify data synchronization
3. Review calculation formulas
4. Check for data migration issues

## Support

For issues or questions about the advertisement system:
1. Check this documentation
2. Review test cases for examples
3. Check API endpoint responses
4. Contact platform administrators
