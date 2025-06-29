"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Navigation } from "lucide-react"

interface MapComponentProps {
  pickup?: { lat: number; lng: number; name: string } | null
  dropoff?: { lat: number; lng: number; name: string } | null
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void
}

export default function MapComponent({ pickup, dropoff, onLocationSelect }: MapComponentProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simulate map interaction
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationSelect) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert click position to approximate coordinates (Lahore area)
    const lat = 31.5204 + (0.5 - y / rect.height) * 0.2
    const lng = 74.3587 + (x / rect.width - 0.5) * 0.3

    setSelectedLocation({ lat, lng })

    // Simulate reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()
      const name = data.display_name?.split(",")[0] || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`

      onLocationSelect({ lat, lng, name })
    } catch (error) {
      console.error("Geocoding error:", error)
      onLocationSelect({
        lat,
        lng,
        name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      })
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Background */}
      <div
        className="absolute inset-0 cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)
          `,
        }}
      >
        {/* Grid overlay to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Roads simulation */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 0 60% L 100% 40%" stroke="#6b7280" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 30% 0 L 70% 100%" stroke="#6b7280" strokeWidth="2" fill="none" opacity="0.4" />
        </svg>
      </div>

      {/* Location Markers */}
      {pickup && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${((pickup.lng - 74.2587) / 0.3) * 100 + 50}%`,
            top: `${(0.5 - (pickup.lat - 31.4204) / 0.2) * 100}%`,
          }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
              {pickup.name}
            </div>
          </div>
        </div>
      )}

      {dropoff && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${((dropoff.lng - 74.2587) / 0.3) * 100 + 50}%`,
            top: `${(0.5 - (dropoff.lat - 31.4204) / 0.2) * 100}%`,
          }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <Navigation className="w-3 h-3 text-white" />
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
              {dropoff.name}
            </div>
          </div>
        </div>
      )}

      {/* Route line */}
      {pickup && dropoff && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={`M ${((pickup.lng - 74.2587) / 0.3) * 100 + 50}% ${(0.5 - (pickup.lat - 31.4204) / 0.2) * 100}% L ${((dropoff.lng - 74.2587) / 0.3) * 100 + 50}% ${(0.5 - (dropoff.lat - 31.4204) / 0.2) * 100}%`}
            stroke="#6366f1"
            strokeWidth="3"
            strokeDasharray="8,4"
            fill="none"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Click instruction */}
      {onLocationSelect && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <p className="text-xs text-gray-600 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            Click to select location
          </p>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">Lahore Map</div>
    </div>
  )
}
