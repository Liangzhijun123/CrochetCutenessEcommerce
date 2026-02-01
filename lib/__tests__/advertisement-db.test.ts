import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  getActiveAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
  createAdvertiser,
  getAdvertiserById,
  createAdImpression,
  createAdClick,
  createAdConversion,
  getAdPerformanceMetrics,
  getAdvertiserPerformanceMetrics,
  getPlatformAdRevenue,
  matchesTargeting,
} from '../advertisement-db'
import { setItem } from '../local-storage-db'

describe('Advertisement Database', () => {
  beforeEach(() => {
    // Clear all advertisement data before each test
    setItem('crochet_advertisements', [])
    setItem('crochet_advertisers', [])
    setItem('crochet_ad_impressions', [])
    setItem('crochet_ad_clicks', [])
    setItem('crochet_ad_conversions', [])
  })

  describe('Advertisement CRUD Operations', () => {
    it('should create a new advertisement', () => {
      const adData = {
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Test advertisement description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner' as const,
        placement: 'homepage' as const,
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active' as const,
        targeting: {},
      }

      const ad = createAdvertisement(adData)

      expect(ad).toBeDefined()
      expect(ad.id).toBeDefined()
      expect(ad.title).toBe('Test Ad')
      expect(ad.spent).toBe(0)
      expect(ad.createdAt).toBeDefined()
    })

    it('should get all advertisements', () => {
      createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Ad 1',
        description: 'Description 1',
        imageUrl: 'https://example.com/ad1.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Ad 2',
        description: 'Description 2',
        imageUrl: 'https://example.com/ad2.jpg',
        clickUrl: 'https://example.com',
        adType: 'sidebar',
        placement: 'marketplace',
        budget: 300,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 3,
        status: 'draft',
        targeting: {},
      })

      const ads = getAdvertisements()
      expect(ads).toHaveLength(2)
    })

    it('should get advertisement by id', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const retrieved = getAdvertisementById(ad.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(ad.id)
      expect(retrieved?.title).toBe('Test Ad')
    })

    it('should get only active advertisements', () => {
      const now = new Date()
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Active Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: now.toISOString(),
        endDate: future.toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Draft Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: now.toISOString(),
        endDate: future.toISOString(),
        priority: 5,
        status: 'draft',
        targeting: {},
      })

      const activeAds = getActiveAdvertisements()
      expect(activeAds).toHaveLength(1)
      expect(activeAds[0].title).toBe('Active Ad')
    })

    it('should update an advertisement', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Original Title',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const updated = updateAdvertisement(ad.id, {
        title: 'Updated Title',
        status: 'paused',
      })

      expect(updated).toBeDefined()
      expect(updated?.title).toBe('Updated Title')
      expect(updated?.status).toBe('paused')
    })

    it('should delete an advertisement', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const deleted = deleteAdvertisement(ad.id)
      expect(deleted).toBe(true)

      const retrieved = getAdvertisementById(ad.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('Advertiser Operations', () => {
    it('should create a new advertiser', () => {
      const advertiserData = {
        userId: 'user-1',
        companyName: 'Test Company',
        contactEmail: 'contact@test.com',
        contactPhone: '555-1234',
        website: 'https://test.com',
        billingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'USA',
        },
        paymentMethod: {
          type: 'credit_card' as const,
          lastFour: '4242',
          expiryDate: '12/25',
        },
        status: 'active' as const,
      }

      const advertiser = createAdvertiser(advertiserData)

      expect(advertiser).toBeDefined()
      expect(advertiser.id).toBeDefined()
      expect(advertiser.companyName).toBe('Test Company')
      expect(advertiser.totalSpent).toBe(0)
    })

    it('should not allow duplicate advertiser for same user', () => {
      const advertiserData = {
        userId: 'user-1',
        companyName: 'Test Company',
        contactEmail: 'contact@test.com',
        billingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'USA',
        },
        paymentMethod: {
          type: 'credit_card' as const,
        },
        status: 'active' as const,
      }

      createAdvertiser(advertiserData)

      expect(() => createAdvertiser(advertiserData)).toThrow(
        'User already has an advertiser account'
      )
    })
  })

  describe('Ad Tracking', () => {
    it('should track ad impressions', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const impression = createAdImpression({
        adId: ad.id,
        sessionId: 'session-123',
        placement: 'homepage',
        userId: 'user-1',
      })

      expect(impression).toBeDefined()
      expect(impression.id).toBeDefined()
      expect(impression.adId).toBe(ad.id)
      expect(impression.timestamp).toBeDefined()
    })

    it('should track ad clicks and update spent amount', () => {
      const advertiser = createAdvertiser({
        userId: 'user-1',
        companyName: 'Test Company',
        contactEmail: 'contact@test.com',
        billingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'USA',
        },
        paymentMethod: {
          type: 'credit_card' as const,
        },
        status: 'active' as const,
      })

      const ad = createAdvertisement({
        advertiserId: advertiser.id,
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const impression = createAdImpression({
        adId: ad.id,
        sessionId: 'session-123',
        placement: 'homepage',
      })

      const click = createAdClick({
        adId: ad.id,
        impressionId: impression.id,
        sessionId: 'session-123',
        clickUrl: 'https://example.com',
      })

      expect(click).toBeDefined()
      expect(click.adId).toBe(ad.id)

      // Check that spent amount was updated
      const updatedAd = getAdvertisementById(ad.id)
      expect(updatedAd?.spent).toBeGreaterThan(0)

      // Check that advertiser total spent was updated
      const updatedAdvertiser = getAdvertiserById(advertiser.id)
      expect(updatedAdvertiser?.totalSpent).toBeGreaterThan(0)
    })

    it('should track ad conversions', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      const impression = createAdImpression({
        adId: ad.id,
        sessionId: 'session-123',
        placement: 'homepage',
      })

      const click = createAdClick({
        adId: ad.id,
        impressionId: impression.id,
        sessionId: 'session-123',
        clickUrl: 'https://example.com',
      })

      const conversion = createAdConversion({
        adId: ad.id,
        clickId: click.id,
        conversionType: 'purchase',
        conversionValue: 50,
      })

      expect(conversion).toBeDefined()
      expect(conversion.adId).toBe(ad.id)
      expect(conversion.conversionValue).toBe(50)
    })
  })

  describe('Analytics', () => {
    it('should calculate ad performance metrics', () => {
      const ad = createAdvertisement({
        advertiserId: 'advertiser-1',
        title: 'Test Ad',
        description: 'Description',
        imageUrl: 'https://example.com/ad.jpg',
        clickUrl: 'https://example.com',
        adType: 'banner',
        placement: 'homepage',
        budget: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5,
        status: 'active',
        targeting: {},
      })

      // Create impressions
      for (let i = 0; i < 100; i++) {
        createAdImpression({
          adId: ad.id,
          sessionId: `session-${i}`,
          placement: 'homepage',
        })
      }

      // Create clicks (10% CTR)
      for (let i = 0; i < 10; i++) {
        const impression = createAdImpression({
          adId: ad.id,
          sessionId: `session-click-${i}`,
          placement: 'homepage',
        })
        
        createAdClick({
          adId: ad.id,
          impressionId: impression.id,
          sessionId: `session-click-${i}`,
          clickUrl: 'https://example.com',
        })
      }

      const metrics = getAdPerformanceMetrics(ad.id)

      expect(metrics).toBeDefined()
      expect(metrics?.totalImpressions).toBeGreaterThan(0)
      expect(metrics?.totalClicks).toBe(10)
      expect(metrics?.clickThroughRate).toBeGreaterThan(0)
      expect(metrics?.spent).toBeGreaterThan(0)
    })

    it('should calculate platform ad revenue', () => {
      // Create multiple ads with spending
      for (let i = 0; i < 3; i++) {
        const ad = createAdvertisement({
          advertiserId: 'advertiser-1',
          title: `Test Ad ${i}`,
          description: 'Description',
          imageUrl: 'https://example.com/ad.jpg',
          clickUrl: 'https://example.com',
          adType: 'banner',
          placement: 'homepage',
          budget: 500,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 5,
          status: 'active',
          targeting: {},
        })

        // Generate some clicks to create revenue
        const impression = createAdImpression({
          adId: ad.id,
          sessionId: `session-${i}`,
          placement: 'homepage',
        })

        createAdClick({
          adId: ad.id,
          impressionId: impression.id,
          sessionId: `session-${i}`,
          clickUrl: 'https://example.com',
        })
      }

      const revenue = getPlatformAdRevenue()

      expect(revenue).toBeDefined()
      expect(revenue.totalRevenue).toBeGreaterThan(0)
      expect(revenue.totalAds).toBe(3)
      expect(revenue.totalClicks).toBe(3)
    })
  })

  describe('Ad Targeting', () => {
    it('should match user role targeting', () => {
      const ad = {
        targeting: {
          userRoles: ['creator' as const],
        },
      } as any

      expect(matchesTargeting(ad, { role: 'creator' })).toBe(true)
      expect(matchesTargeting(ad, { role: 'user' })).toBe(false)
    })

    it('should match category targeting', () => {
      const ad = {
        targeting: {
          categories: ['amigurumi', 'baby'],
        },
      } as any

      expect(matchesTargeting(ad, { viewingCategory: 'amigurumi' })).toBe(true)
      expect(matchesTargeting(ad, { viewingCategory: 'home' })).toBe(false)
    })

    it('should exclude specific users', () => {
      const ad = {
        targeting: {
          excludeUsers: ['user-1', 'user-2'],
        },
      } as any

      expect(matchesTargeting(ad, { userId: 'user-1' })).toBe(false)
      expect(matchesTargeting(ad, { userId: 'user-3' })).toBe(true)
    })

    it('should match interests', () => {
      const ad = {
        targeting: {
          interests: ['crochet', 'knitting'],
        },
      } as any

      expect(matchesTargeting(ad, { interests: ['crochet', 'sewing'] })).toBe(true)
      expect(matchesTargeting(ad, { interests: ['cooking', 'baking'] })).toBe(false)
    })
  })
})
