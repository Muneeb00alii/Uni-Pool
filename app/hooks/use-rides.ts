"use client"

import { useState, useEffect } from "react"

interface Location {
  lat: number
  lng: number
  name: string
}

interface Ride {
  id: string
  driverId: string
  driverName: string
  driverAvatar: string
  rating: number
  totalRides: number
  pickup: Location
  dropoff: Location
  departureTime: string
  availableSeats: number
  totalSeats: number
  price: number
  verified: boolean
  route: string
  isRecurring: boolean
  recurringDays: string[]
  createdAt: string
}

interface SearchParams {
  pickup: Location
  dropoff: Location
  time?: string
  date?: string
}

interface CreateRideParams {
  pickup: Location
  dropoff: Location
  departureTime: string
  rideDate: string
  availableSeats: number
  isRecurring: boolean
  recurringDays?: string[]
}

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    loadAllRides()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("unipool_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const loadAllRides = async () => {
    setIsLoading(true)
    setError(null)
    setNeedsSetup(false)

    try {
      const response = await fetch("/api/rides/search", {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to load rides")
      }

      const data = await response.json()

      if (data.error && data.error.includes("Database not initialized")) {
        setNeedsSetup(true)
        setRides([])
      } else {
        setRides(data.rides || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Load rides error:", err)
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchRides = async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)
    setNeedsSetup(false)

    try {
      const response = await fetch("/api/rides/search", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error("Failed to search rides")
      }

      const data = await response.json()

      if (data.error && data.error.includes("Database not initialized")) {
        setNeedsSetup(true)
        setRides([])
      } else {
        setRides(data.rides || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Search rides error:", err)
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  const createRide = async (params: CreateRideParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rides/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create ride")
      }

      const data = await response.json()
      setRides((prevRides) => [data.ride, ...prevRides])
      return data.ride
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Create ride error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const bookRide = async (rideId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rides/${rideId}/book`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book ride")
      }

      setRides(
        (prevRides) =>
          prevRides
            .map((ride) => {
              if (ride.id === rideId) {
                const newAvailableSeats = ride.availableSeats - 1
                return newAvailableSeats > 0 ? { ...ride, availableSeats: newAvailableSeats } : null
              }
              return ride
            })
            .filter(Boolean) as Ride[],
      )

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Book ride error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    rides,
    isLoading,
    error,
    needsSetup,
    searchRides,
    createRide,
    bookRide,
    loadAllRides,
  }
}
