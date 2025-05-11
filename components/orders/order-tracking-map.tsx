"use client"

import { useEffect, useState } from "react"
import { MapPin, Truck } from "lucide-react"

interface TrackingLocation {
  lat: number
  lng: number
  timestamp: string
  status: string
}

interface TrackingDetails {
  currentLocation: TrackingLocation
  origin: {
    lat: number
    lng: number
    name: string
  }
  destination: {
    lat: number
    lng: number
    name: string
  }
  stops?: TrackingLocation[]
}

export default function OrderTrackingMap({ trackingDetails }: { trackingDetails: TrackingDetails }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // In a real app, you would use a mapping library like Google Maps, Mapbox, or Leaflet
  // For this demo, we'll create a simplified visual representation

  // Calculate progress percentage (distance traveled / total distance)
  const calculateProgress = () => {
    // This is a simplified calculation - in a real app you would use proper geospatial calculations
    const originPoint = trackingDetails.origin
    const destinationPoint = trackingDetails.destination
    const currentPoint = trackingDetails.currentLocation

    // Calculate total distance (simplified)
    const totalDistance = Math.sqrt(
      Math.pow(destinationPoint.lat - originPoint.lat, 2) + Math.pow(destinationPoint.lng - originPoint.lng, 2),
    )

    // Calculate traveled distance (simplified)
    const traveledDistance = Math.sqrt(
      Math.pow(currentPoint.lat - originPoint.lat, 2) + Math.pow(currentPoint.lng - originPoint.lng, 2),
    )

    // Calculate progress percentage
    return Math.min(100, Math.max(0, (traveledDistance / totalDistance) * 100))
  }

  const progress = calculateProgress()

  if (!isClient) {
    return <div className="h-40 bg-gray-100 rounded-md animate-pulse"></div>
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="font-medium mb-4">Shipment Location</h3>

      <div className="relative h-20 mb-4">
        {/* Origin */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <MapPin className="h-6 w-6 text-gray-500" />
          <span className="text-xs text-gray-500 mt-1">{trackingDetails.origin.name}</span>
        </div>

        {/* Progress bar */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded">
          <div className="h-full bg-rose-600 rounded" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Truck icon at current position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${8 + progress * 0.84}%` }}
        >
          <Truck className="h-6 w-6 text-rose-600" />
        </div>

        {/* Destination */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <MapPin className="h-6 w-6 text-rose-600" />
          <span className="text-xs text-gray-500 mt-1">{trackingDetails.destination.name}</span>
        </div>
      </div>

      <div className="text-sm">
        <p className="font-medium">Current Status:</p>
        <p className="text-gray-600">
          {trackingDetails.currentLocation.status} -{" "}
          {new Date(trackingDetails.currentLocation.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
