// Seed data for advertisement system testing and development

import {
  createAdvertisement,
  createAdvertiser,
  createAdImpression,
  createAdClick,
  createAdConversion,
} from './advertisement-db'

export function seedAdvertisementData() {
  try {
    console.log('Seeding advertisement data...')

    // Create sample advertisers
    const advertiser1 = createAdvertiser({
      userId: 'admin-user-id', // Should be a real user ID from your system
      companyName: 'Yarn Paradise',
      contactEmail: 'contact@yarnparadise.com',
      contactPhone: '555-0100',
      website: 'https://yarnparadise.com',
      billingAddress: {
        street: '123 Craft Lane',
        city: 'Knit City',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
      },
      paymentMethod: {
        type: 'credit_card',
        lastFour: '4242',
        expiryDate: '12/25',
      },
      status: 'active',
    })

    console.log('Created advertiser:', advertiser1.companyName)

    // Create sample advertisements
    const now = new Date()
    const futureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days from now

    const ad1 = createAdvertisement({
      advertiserId: advertiser1.id,
      title: 'Premium Yarn Sale - 30% Off',
      description: 'Get 30% off all premium yarns this month. Perfect for your next crochet project!',
      imageUrl: '/placeholder.svg?height=400&width=800&text=Yarn+Sale',
      clickUrl: 'https://yarnparadise.com/sale',
      adType: 'banner',
      placement: 'homepage',
      budget: 500,
      startDate: now.toISOString(),
      endDate: futureDate.toISOString(),
      priority: 8,
      status: 'active',
      targeting: {
        userRoles: ['user', 'creator'],
        categories: ['amigurumi', 'baby', 'home'],
        interests: ['crochet', 'knitting'],
      },
    })

    console.log('Created advertisement:', ad1.title)

    const ad2 = createAdvertisement({
      advertiserId: advertiser1.id,
      title: 'New Crochet Hooks Collection',
      description: 'Discover our ergonomic crochet hooks designed for comfort and precision.',
      imageUrl: '/placeholder.svg?height=300&width=300&text=Crochet+Hooks',
      clickUrl: 'https://yarnparadise.com/hooks',
      adType: 'sidebar',
      placement: 'marketplace',
      budget: 300,
      startDate: now.toISOString(),
      endDate: futureDate.toISOString(),
      priority: 5,
      status: 'active',
      targeting: {
        difficultyLevels: ['beginner', 'intermediate'],
      },
    })

    console.log('Created advertisement:', ad2.title)

    const ad3 = createAdvertisement({
      advertiserId: advertiser1.id,
      title: 'Free Shipping on Orders Over $50',
      description: 'Shop now and get free shipping on all orders over $50. Limited time offer!',
      imageUrl: '/placeholder.svg?height=200&width=600&text=Free+Shipping',
      clickUrl: 'https://yarnparadise.com/shipping',
      adType: 'inline',
      placement: 'pattern-detail',
      budget: 200,
      startDate: now.toISOString(),
      endDate: futureDate.toISOString(),
      priority: 3,
      status: 'active',
      targeting: {},
    })

    console.log('Created advertisement:', ad3.title)

    // Create some sample impressions and clicks for demo purposes
    const sessionId = `session_${Date.now()}`
    
    const impression1 = createAdImpression({
      adId: ad1.id,
      sessionId,
      placement: 'homepage',
    })

    console.log('Created sample impression')

    const click1 = createAdClick({
      adId: ad1.id,
      impressionId: impression1.id,
      sessionId,
      clickUrl: ad1.clickUrl,
    })

    console.log('Created sample click')

    const conversion1 = createAdConversion({
      adId: ad1.id,
      clickId: click1.id,
      conversionType: 'purchase',
      conversionValue: 75.00,
    })

    console.log('Created sample conversion')

    console.log('Advertisement seed data created successfully!')
    
    return {
      advertisers: [advertiser1],
      advertisements: [ad1, ad2, ad3],
      impressions: [impression1],
      clicks: [click1],
      conversions: [conversion1],
    }
  } catch (error) {
    console.error('Error seeding advertisement data:', error)
    throw error
  }
}

// Function to clear advertisement data
export function clearAdvertisementData() {
  const { setItem } = require('./local-storage-db')
  
  setItem('crochet_advertisements', [])
  setItem('crochet_advertisers', [])
  setItem('crochet_ad_impressions', [])
  setItem('crochet_ad_clicks', [])
  setItem('crochet_ad_conversions', [])
  setItem('crochet_ad_invoices', [])
  
  console.log('Advertisement data cleared')
}
