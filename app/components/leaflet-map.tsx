"use client"

import { useEffect, useRef } from "react"
import type L from "leaflet"

interface Location {
  lat: number
  lng: number
  name: string
}

interface LeafletMapProps {
  center?: [number, number]
  onLocationSelect: (location: Location) => void
  pickupLocation?: Location | null
  dropoffLocation?: Location | null
  height?: string
}

export default function LeafletMap({
  center = [31.4504, 74.3587],
  onLocationSelect,
  pickupLocation,
  dropoffLocation,
  height = "400px",
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const dropoffMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (!mapRef.current) {
        const map = L.map("map").setView(center, 12)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Add dropoff marker (FCCU)
        const dropoffIcon = L.divIcon({
          html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        if (dropoffLocation) {
          dropoffMarkerRef.current = L.marker([dropoffLocation.lat, dropoffLocation.lng], { icon: dropoffIcon })
            .addTo(map)
            .bindPopup(`<b>Destination:</b><br>${dropoffLocation.name}`)
        }

        // Add pickup marker if exists
        if (pickupLocation) {
          const pickupIcon = L.divIcon({
            html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          pickupMarkerRef.current = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: pickupIcon })
            .addTo(map)
            .bindPopup(`<b>Pickup:</b><br>${pickupLocation.name}`)
        }

        // Handle map clicks
        map.on("click", async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng

          try {
            // Reverse geocoding using Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            )
            const data = await response.json()

            const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

            const newLocation: Location = {
              lat,
              lng,
              name: locationName,
            }

            onLocationSelect(newLocation)

            // Update pickup marker
            if (pickupMarkerRef.current) {
              map.removeLayer(pickupMarkerRef.current)
            }

            const pickupIcon = L.divIcon({
              html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            pickupMarkerRef.current = L.marker([lat, lng], { icon: pickupIcon })
              .addTo(map)
              .bindPopup(`<b>Pickup:</b><br>${locationName}`)
          } catch (error) {
            console.error("Geocoding error:", error)
            const newLocation: Location = {
              lat,
              lng,
              name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            }
            onLocationSelect(newLocation)
          }
        })

        mapRef.current = map
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && pickupLocation) {
      const L = require("leaflet")

      // Remove existing pickup marker
      if (pickupMarkerRef.current) {
        mapRef.current.removeLayer(pickupMarkerRef.current)
      }

      // Add new pickup marker
      const pickupIcon = L.divIcon({
        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      pickupMarkerRef.current = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: pickupIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>Pickup:</b><br>${pickupLocation.name}`)
    }
  }, [pickupLocation])

  return <div id="map" style={{ height, width: "100%", borderRadius: "1rem" }} />
}
