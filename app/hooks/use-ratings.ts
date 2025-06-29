"use client"

import { useState } from "react"

interface Rating {
  id: string
  riderId: string
  driverId: string
  rideId: string
  rating: number
  comment?: string
  type: "driver_to_rider" | "rider_to_driver"
  createdAt: string
}

interface RatingStats {
  averageRating: number
  totalRatings: number
  ratingDistribution: { [key: number]: number }
}

interface SubmitRatingParams {
  rideId: string
  targetUserId: string
  rating: number
  comment?: string
  type: "driver_to_rider" | "rider_to_driver"
}

export function useRatings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitRating = async (params: SubmitRatingParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("unipool_token")}`,
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }

      const data = await response.json()
      return data.rating
    } catch (error) {
      console.error("Submit rating error:", error)
      setError("Failed to submit rating")

      // Mock success for demo
      const mockRating: Rating = {
        id: Date.now().toString(),
        riderId: params.type === "rider_to_driver" ? "current-user" : params.targetUserId,
        driverId: params.type === "driver_to_rider" ? "current-user" : params.targetUserId,
        rideId: params.rideId,
        rating: params.rating,
        comment: params.comment,
        type: params.type,
        createdAt: new Date().toISOString(),
      }
      return mockRating
    } finally {
      setIsLoading(false)
    }
  }

  const getUserRatings = async (userId: string): Promise<RatingStats> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/ratings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("unipool_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user ratings")
      }

      const data = await response.json()
      return data.stats
    } catch (error) {
      console.error("Get user ratings error:", error)

      // Mock stats for demo
      return {
        averageRating: 4.5,
        totalRatings: 23,
        ratingDistribution: {
          5: 15,
          4: 6,
          3: 2,
          2: 0,
          1: 0,
        },
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getRideRatings = async (rideId: string): Promise<Rating[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rides/${rideId}/ratings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("unipool_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch ride ratings")
      }

      const data = await response.json()
      return data.ratings
    } catch (error) {
      console.error("Get ride ratings error:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const autoRateNoShow = async (rideId: string, userId: string) => {
    return submitRating({
      rideId,
      targetUserId: userId,
      rating: 1,
      comment: "No-show - automatically rated",
      type: "driver_to_rider",
    })
  }

  const autoRateLateCancel = async (rideId: string, userId: string) => {
    return submitRating({
      rideId,
      targetUserId: userId,
      rating: 2,
      comment: "Late cancellation (< 1 hour) - automatically rated",
      type: "driver_to_rider",
    })
  }

  return {
    submitRating,
    getUserRatings,
    getRideRatings,
    autoRateNoShow,
    autoRateLateCancel,
    isLoading,
    error,
  }
}
