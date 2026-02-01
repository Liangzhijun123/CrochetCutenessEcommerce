// Advertisement database models and functions for the crochet community platform
// Implements Requirements 7.1, 7.3, 7.4, 7.5

import { v4 as uuidv4 } from 'uuid'
import { getItem, setItem, getUserById } from './local-storage-db'

// Advertisement types
export type Advertisement = {
  id: string
  advertiserId: string
  title: string
  description: string
  imageUrl: string
  clickUrl: string
  adType: 'banner' | 'video' | 'sidebar' | 'inline'
  placement: 'homepage' | 'marketplace' | 'pattern-detail' | 'sidebar' | 'footer'
  targeting: AdTargeting
  budget: number // Total budget in dollars
  spent: number // Amount spent so far
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
  startDate: string
  endDate: string
  priority: number // Higher priority ads shown first
  createdAt: string
  updatedAt: string
}

export type AdTargeting = {
  userRoles?: ('user' | 'creator' | 'admin')[]
  categories?: string[] // Pattern categories to target
  difficultyLevels?: ('beginner' | 'intermediate' | 'advanced')[]
  minAge?: number
  maxAge?: number
  interests?: string[]
  excludeUsers?: string[] // User IDs to exclude
}

export type AdImpression = {
  id: string
  adId: string
  userId?: string // Optional - may be anonymous
  sessionId: string
  placement: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
}

export type AdClick = {
  id: string
  adId: string
  impressionId: string
  userId?: string
  sessionId: string
  timestamp: string
  clickUrl: string
}

export type AdConversion = {
  id: string
  adId: string
  clickId: string
  userId?: string
  conversionType: 'purchase' | 'signup' | 'pattern_view' | 'custom'
  conversionValue: number // Value in dollars
  timestamp: string
  metadata?: Record<string, any>
}

export type Advertiser = {
  id: string
  userId: string // Links to platform user account
  companyName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  billingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: {
    type: 'credit_card' | 'bank_transfer' | 'paypal'
    lastFour?: string
    expiryDate?: string
  }
  totalSpent: number
  status: 'active' | 'suspended' | 'pending_approval'
  createdAt: string
  updatedAt: string
}

export type AdInvoice = {
  id: string
  advertiserId: string
  adId: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidDate?: string
  invoiceNumber: string
  createdAt: string
}

// Storage keys
const ADVERTISEMENTS_KEY = 'crochet_advertisements'
const AD_IMPRESSIONS_KEY = 'crochet_ad_impressions'
const AD_CLICKS_KEY = 'crochet_ad_clicks'
const AD_CONVERSIONS_KEY = 'crochet_ad_conversions'
const ADVERTISERS_KEY = 'crochet_advertisers'
const AD_INVOICES_KEY = 'crochet_ad_invoices'

// Advertisement operations
export const getAdvertisements = (): Advertisement[] => {
  return getItem(ADVERTISEMENTS_KEY, []) as Advertisement[]
}

export const getAdvertisementById = (id: string): Advertisement | null => {
  const ads = getAdvertisements()
  return ads.find(ad => ad.id === id) || null
}

export const getActiveAdvertisements = (placement?: string): Advertisement[] => {
  const ads = getAdvertisements()
  const now = new Date()
  
  return ads.filter(ad => {
    const isActive = ad.status === 'active'
    const isInDateRange = new Date(ad.startDate) <= now && new Date(ad.endDate) >= now
    const hasbudget = ad.spent < ad.budget
    const matchesPlacement = !placement || ad.placement === placement
    
    return isActive && isInDateRange && hasbudget && matchesPlacement
  }).sort((a, b) => b.priority - a.priority)
}

export const getAdvertisementsByAdvertiser = (advertiserId: string): Advertisement[] => {
  const ads = getAdvertisements()
  return ads.filter(ad => ad.advertiserId === advertiserId)
}

export const createAdvertisement = (data: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'spent'>): Advertisement => {
  const ads = getAdvertisements()
  const now = new Date().toISOString()
  
  const advertisement: Advertisement = {
    id: uuidv4(),
    spent: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  }

  ads.push(advertisement)
  setItem(ADVERTISEMENTS_KEY, ads)
  
  return advertisement
}

export const updateAdvertisement = (id: string, updates: Partial<Advertisement>): Advertisement | null => {
  const ads = getAdvertisements()
  const index = ads.findIndex(ad => ad.id === id)
  
  if (index === -1) return null
  
  ads[index] = {
    ...ads[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  setItem(ADVERTISEMENTS_KEY, ads)
  return ads[index]
}

export const deleteAdvertisement = (id: string): boolean => {
  const ads = getAdvertisements()
  const filtered = ads.filter(ad => ad.id !== id)
  
  if (filtered.length === ads.length) return false
  
  setItem(ADVERTISEMENTS_KEY, filtered)
  return true
}

// Ad impression operations
export const getAdImpressions = (): AdImpression[] => {
  return getItem(AD_IMPRESSIONS_KEY, []) as AdImpression[]
}

export const getAdImpressionsByAd = (adId: string): AdImpression[] => {
  const impressions = getAdImpressions()
  return impressions.filter(imp => imp.adId === adId)
}

export const createAdImpression = (data: Omit<AdImpression, 'id' | 'timestamp'>): AdImpression => {
  const impressions = getAdImpressions()
  
  const impression: AdImpression = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...data,
  }

  impressions.push(impression)
  setItem(AD_IMPRESSIONS_KEY, impressions)
  
  return impression
}

// Ad click operations
export const getAdClicks = (): AdClick[] => {
  return getItem(AD_CLICKS_KEY, []) as AdClick[]
}

export const getAdClicksByAd = (adId: string): AdClick[] => {
  const clicks = getAdClicks()
  return clicks.filter(click => click.adId === adId)
}

export const createAdClick = (data: Omit<AdClick, 'id' | 'timestamp'>): AdClick => {
  const clicks = getAdClicks()
  
  const click: AdClick = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...data,
  }

  clicks.push(click)
  setItem(AD_CLICKS_KEY, clicks)
  
  // Update ad spent (simple cost-per-click model)
  const ad = getAdvertisementById(data.adId)
  if (ad) {
    const costPerClick = 0.50 // $0.50 per click
    updateAdvertisement(ad.id, {
      spent: ad.spent + costPerClick
    })
    
    // Update advertiser total spent
    const advertiser = getAdvertiserById(ad.advertiserId)
    if (advertiser) {
      updateAdvertiser(advertiser.id, {
        totalSpent: advertiser.totalSpent + costPerClick
      })
    }
  }
  
  return click
}

// Ad conversion operations
export const getAdConversions = (): AdConversion[] => {
  return getItem(AD_CONVERSIONS_KEY, []) as AdConversion[]
}

export const getAdConversionsByAd = (adId: string): AdConversion[] => {
  const conversions = getAdConversions()
  return conversions.filter(conv => conv.adId === adId)
}

export const createAdConversion = (data: Omit<AdConversion, 'id' | 'timestamp'>): AdConversion => {
  const conversions = getAdConversions()
  
  const conversion: AdConversion = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...data,
  }

  conversions.push(conversion)
  setItem(AD_CONVERSIONS_KEY, conversions)
  
  return conversion
}

// Advertiser operations
export const getAdvertisers = (): Advertiser[] => {
  return getItem(ADVERTISERS_KEY, []) as Advertiser[]
}

export const getAdvertiserById = (id: string): Advertiser | null => {
  const advertisers = getAdvertisers()
  return advertisers.find(adv => adv.id === id) || null
}

export const getAdvertiserByUserId = (userId: string): Advertiser | null => {
  const advertisers = getAdvertisers()
  return advertisers.find(adv => adv.userId === userId) || null
}

export const createAdvertiser = (data: Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent'>): Advertiser => {
  const advertisers = getAdvertisers()
  const now = new Date().toISOString()
  
  // Check if user already has an advertiser account
  const existing = getAdvertiserByUserId(data.userId)
  if (existing) {
    throw new Error('User already has an advertiser account')
  }
  
  const advertiser: Advertiser = {
    id: uuidv4(),
    totalSpent: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  }

  advertisers.push(advertiser)
  setItem(ADVERTISERS_KEY, advertisers)
  
  return advertiser
}

export const updateAdvertiser = (id: string, updates: Partial<Advertiser>): Advertiser | null => {
  const advertisers = getAdvertisers()
  const index = advertisers.findIndex(adv => adv.id === id)
  
  if (index === -1) return null
  
  advertisers[index] = {
    ...advertisers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  setItem(ADVERTISERS_KEY, advertisers)
  return advertisers[index]
}

// Invoice operations
export const getAdInvoices = (): AdInvoice[] => {
  return getItem(AD_INVOICES_KEY, []) as AdInvoice[]
}

export const getAdInvoicesByAdvertiser = (advertiserId: string): AdInvoice[] => {
  const invoices = getAdInvoices()
  return invoices.filter(inv => inv.advertiserId === advertiserId)
}

export const createAdInvoice = (data: Omit<AdInvoice, 'id' | 'createdAt' | 'invoiceNumber'>): AdInvoice => {
  const invoices = getAdInvoices()
  
  const invoice: AdInvoice = {
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(),
    createdAt: new Date().toISOString(),
    ...data,
  }

  invoices.push(invoice)
  setItem(AD_INVOICES_KEY, invoices)
  
  return invoice
}

export const updateAdInvoice = (id: string, updates: Partial<AdInvoice>): AdInvoice | null => {
  const invoices = getAdInvoices()
  const index = invoices.findIndex(inv => inv.id === id)
  
  if (index === -1) return null
  
  invoices[index] = {
    ...invoices[index],
    ...updates,
  }
  
  setItem(AD_INVOICES_KEY, invoices)
  return invoices[index]
}

// Analytics functions
export const getAdPerformanceMetrics = (adId: string) => {
  const impressions = getAdImpressionsByAd(adId)
  const clicks = getAdClicksByAd(adId)
  const conversions = getAdConversionsByAd(adId)
  const ad = getAdvertisementById(adId)
  
  if (!ad) return null
  
  const totalImpressions = impressions.length
  const totalClicks = clicks.length
  const totalConversions = conversions.length
  const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const costPerClick = totalClicks > 0 ? ad.spent / totalClicks : 0
  const costPerConversion = totalConversions > 0 ? ad.spent / totalConversions : 0
  const totalConversionValue = conversions.reduce((sum, conv) => sum + conv.conversionValue, 0)
  const roi = ad.spent > 0 ? ((totalConversionValue - ad.spent) / ad.spent) * 100 : 0
  
  return {
    adId,
    adTitle: ad.title,
    totalImpressions,
    totalClicks,
    totalConversions,
    clickThroughRate: Number(clickThroughRate.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    spent: ad.spent,
    budget: ad.budget,
    budgetRemaining: ad.budget - ad.spent,
    costPerClick: Number(costPerClick.toFixed(2)),
    costPerConversion: Number(costPerConversion.toFixed(2)),
    totalConversionValue,
    roi: Number(roi.toFixed(2)),
    status: ad.status,
  }
}

export const getAdvertiserPerformanceMetrics = (advertiserId: string) => {
  const ads = getAdvertisementsByAdvertiser(advertiserId)
  const advertiser = getAdvertiserById(advertiserId)
  
  if (!advertiser) return null
  
  const metrics = ads.map(ad => getAdPerformanceMetrics(ad.id)).filter(Boolean)
  
  const totalImpressions = metrics.reduce((sum, m) => sum + (m?.totalImpressions || 0), 0)
  const totalClicks = metrics.reduce((sum, m) => sum + (m?.totalClicks || 0), 0)
  const totalConversions = metrics.reduce((sum, m) => sum + (m?.totalConversions || 0), 0)
  const totalSpent = advertiser.totalSpent
  const totalConversionValue = metrics.reduce((sum, m) => sum + (m?.totalConversionValue || 0), 0)
  const averageCTR = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m?.clickThroughRate || 0), 0) / metrics.length 
    : 0
  const averageConversionRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m?.conversionRate || 0), 0) / metrics.length
    : 0
  const roi = totalSpent > 0 ? ((totalConversionValue - totalSpent) / totalSpent) * 100 : 0
  
  return {
    advertiserId,
    companyName: advertiser.companyName,
    totalAds: ads.length,
    activeAds: ads.filter(ad => ad.status === 'active').length,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalSpent,
    totalConversionValue,
    averageCTR: Number(averageCTR.toFixed(2)),
    averageConversionRate: Number(averageConversionRate.toFixed(2)),
    roi: Number(roi.toFixed(2)),
    adMetrics: metrics,
  }
}

export const getPlatformAdRevenue = (startDate?: Date, endDate?: Date) => {
  const ads = getAdvertisements()
  const now = new Date()
  const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endDate || now
  
  const filteredAds = ads.filter(ad => {
    const adDate = new Date(ad.createdAt)
    return adDate >= start && adDate <= end
  })
  
  const totalRevenue = filteredAds.reduce((sum, ad) => sum + ad.spent, 0)
  const totalImpressions = filteredAds.reduce((sum, ad) => {
    return sum + getAdImpressionsByAd(ad.id).length
  }, 0)
  const totalClicks = filteredAds.reduce((sum, ad) => {
    return sum + getAdClicksByAd(ad.id).length
  }, 0)
  
  return {
    totalRevenue,
    totalAds: filteredAds.length,
    totalImpressions,
    totalClicks,
    averageRevenuePerAd: filteredAds.length > 0 ? totalRevenue / filteredAds.length : 0,
  }
}

// Utility functions
const generateInvoiceNumber = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-AD-${timestamp}-${random}`
}

// Ad targeting helper
export const matchesTargeting = (ad: Advertisement, userContext: {
  userId?: string
  role?: string
  interests?: string[]
  viewingCategory?: string
}): boolean => {
  const { targeting } = ad
  
  // Check user role targeting
  if (targeting.userRoles && targeting.userRoles.length > 0) {
    if (!userContext.role || !targeting.userRoles.includes(userContext.role as any)) {
      return false
    }
  }
  
  // Check category targeting
  if (targeting.categories && targeting.categories.length > 0) {
    if (!userContext.viewingCategory || !targeting.categories.includes(userContext.viewingCategory)) {
      return false
    }
  }
  
  // Check excluded users
  if (targeting.excludeUsers && userContext.userId) {
    if (targeting.excludeUsers.includes(userContext.userId)) {
      return false
    }
  }
  
  // Check interests
  if (targeting.interests && targeting.interests.length > 0 && userContext.interests) {
    const hasMatchingInterest = targeting.interests.some(interest => 
      userContext.interests?.includes(interest)
    )
    if (!hasMatchingInterest) {
      return false
    }
  }
  
  return true
}
