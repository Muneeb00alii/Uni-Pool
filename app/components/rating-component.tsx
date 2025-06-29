"use client"

import { useState } from "react"
import { Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRatings } from "../hooks/use-ratings"

interface RatingComponentProps {
  rideId: string
  targetUserId: string
  targetUserName: string
  type: "driver_to_rider" | "rider_to_driver"
  onRatingSubmitted?: () => void
}

export default function RatingComponent({
  rideId,
  targetUserId,
  targetUserName,
  type,
  onRatingSubmitted,
}: RatingComponentProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const { submitRating, isLoading } = useRatings()

  const handleSubmit = async () => {
    if (rating === 0) return

    try {
      await submitRating({
        rideId,
        targetUserId,
        rating,
        comment: comment.trim() || undefined,
        type,
      })

      onRatingSubmitted?.()
    } catch (error) {
      console.error("Failed to submit rating:", error)
    }
  }

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return "Rate your experience"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Rate {targetUserName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="text-center">
          <div className="flex justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 font-medium">{getRatingText(hoveredRating || rating)}</p>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            Comment (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="bg-white/80 backdrop-blur-sm border-white/50 rounded-xl resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 text-right">{comment.length}/200</p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl"
        >
          {isLoading ? "Submitting..." : "Submit Rating"}
        </Button>
      </CardContent>
    </Card>
  )
}
