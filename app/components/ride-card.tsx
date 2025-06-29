"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Users, Star, Verified, Calendar } from "lucide-react"
import { format } from "date-fns"

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

interface RideCardProps {
  ride: Ride
  onBook: () => void
  currentUserId?: string
}

export function RideCard({ ride, onBook, currentUserId }: RideCardProps) {
  const isOwnRide = currentUserId === ride.driverId
  const departureDate = new Date(ride.departureTime)
  const isToday = new Date().toDateString() === departureDate.toDateString()

  const formatLocation = (location: Location) => {
    return location.name.split(",")[0] || location.name
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={ride.driverAvatar || "/placeholder.svg"} alt={ride.driverName} />
              <AvatarFallback>{ride.driverName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{ride.driverName}</h3>
                {ride.verified && <Verified className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{ride.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{ride.totalRides} rides</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
              <Calendar className="h-3 w-3" />
              <span>{isToday ? "Today" : format(departureDate, "MMM dd")}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{format(departureDate, "HH:mm")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{formatLocation(ride.pickup)}</p>
              <p className="text-xs text-gray-500 truncate">{ride.pickup.name}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{formatLocation(ride.dropoff)}</p>
              <p className="text-xs text-gray-500 truncate">{ride.dropoff.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {ride.availableSeats}/{ride.totalSeats} seats
              </span>
            </div>
            {ride.price > 0 && (
              <Badge variant="secondary" className="text-xs">
                ₹{ride.price}
              </Badge>
            )}
            {ride.isRecurring && (
              <Badge variant="outline" className="text-xs">
                Recurring
              </Badge>
            )}
          </div>

          {!isOwnRide && (
            <Button
              onClick={onBook}
              size="sm"
              disabled={ride.availableSeats === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {ride.availableSeats === 0 ? "Full" : "Book Ride"}
            </Button>
          )}

          {isOwnRide && (
            <Badge variant="secondary" className="text-xs">
              Your Ride
            </Badge>
          )}
        </div>

        {ride.isRecurring && ride.recurringDays.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Recurring: {ride.recurringDays.join(", ")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
