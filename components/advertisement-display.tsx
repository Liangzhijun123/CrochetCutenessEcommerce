"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Advertisement = {
  id: string
  title: string
  description: string
  imageUrl: string
  clickUrl: string
  adType: 'banner' | 'video' | 'sidebar' | 'inline'
  placement: string
}

type AdvertisementDisplayProps = {
  placement: 'homepage' | 'marketplace' | 'pattern-detail' | 'sidebar' | 'footer'
  className?: string
  userContext?: {
    userId?: string
    role?: string
    interests?: string[]
    viewingCategory?: string
  }
}

export default function AdvertisementDisplay({ 
  placement, 
  className = "",
  userContext 
}: AdvertisementDisplayProps) {
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [impressionId, setImpressionId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('ad_session_id')
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
        sessionStorage.setItem('ad_session_id', sid)
      }
      return sid
    }
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  })

  useEffect(() => {
    fetchAd()
  }, [placement])

  useEffect(() => {
    if (ad && isVisible) {
      trackImpression()
    }
  }, [ad, isVisible])

  const fetchAd = async () => {
    try {
      const response = await fetch(`/api/advertisements?active=true&placement=${placement}`)
      const data = await response.json()
      
      if (data.advertisements && data.advertisements.length > 0) {
        // Select a random ad from the available ones (or use targeting logic)
        const randomAd = data.advertisements[0] // For now, just take the first one
        setAd(randomAd)
      }
    } catch (error) {
      console.error("Error fetching advertisement:", error)
    }
  }

  const trackImpression = async () => {
    if (!ad) return

    try {
      const response = await fetch("/api/advertisements/impressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          sessionId,
          placement,
          userId: userContext?.userId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        }),
      })

      const data = await response.json()
      if (data.impression) {
        setImpressionId(data.impression.id)
      }
    } catch (error) {
      console.error("Error tracking impression:", error)
    }
  }

  const trackClick = async () => {
    if (!ad || !impressionId) return

    try {
      await fetch("/api/advertisements/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          impressionId,
          sessionId,
          clickUrl: ad.clickUrl,
          userId: userContext?.userId,
        }),
      })
    } catch (error) {
      console.error("Error tracking click:", error)
    }
  }

  const handleAdClick = () => {
    trackClick()
    window.open(ad?.clickUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!ad || !isVisible) {
    return null
  }

  // Render different ad types
  if (ad.adType === 'banner') {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="cursor-pointer"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
        >
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-auto object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg">{ad.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Sponsored</p>
          </div>
        </div>
      </Card>
    )
  }

  if (ad.adType === 'sidebar') {
    return (
      <Card className={`relative ${className}`}>
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="cursor-pointer p-4"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
        >
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-auto object-cover rounded-md mb-3"
          />
          <h4 className="font-semibold text-sm">{ad.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>
          <p className="text-xs text-muted-foreground mt-2">Sponsored</p>
        </div>
      </Card>
    )
  }

  if (ad.adType === 'inline') {
    return (
      <div className={`relative border rounded-lg p-4 bg-muted/30 ${className}`}>
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="flex gap-4 cursor-pointer"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
        >
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-24 h-24 object-cover rounded-md"
          />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Sponsored</p>
            <h4 className="font-semibold">{ad.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
          </div>
        </div>
      </div>
    )
  }

  // Default rendering
  return null
}
