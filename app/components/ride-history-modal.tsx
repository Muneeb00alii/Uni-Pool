"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Location {
  lat: number
  lng: number
  name: string
}

interface OfferedRide {
  id: string
  pickup: Location
  dropoff: Location
  departureTime: string
  availableSeats: number
  totalSeats: number
  price: number
  route: string
  isRecurring: boolean
  recurringDays: string[]
  createdAt: string
  bookings: Array<{
    id: string
    passengerId: string
    passengerName: string
    passengerAvatar: string
    status: string
    bookedAt: string
  }>
}

interface BookedRide {
  bookingId: string
  status: string
  bookedAt: string
  ride: {
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
}

interface RideHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RideHistoryModal({ open, onOpenChange }: RideHistoryModalProps) {
  const [offeredRides, setOfferedRides] = useState<OfferedRide[]>([])
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchRideHistory()
    }
  }, [open])

  const fetchRideHistory = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("unipool_token")
      const response = await fetch("/api/rides/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOfferedRides(data.offeredRides || [])
        setBookedRides(data.bookedRides || [])
      } else {
        toast.error("Failed to fetch ride history")
      }
    } catch (error) {
      toast.error("Failed to fetch ride history")
    } finally {
      setIsLoading(false)
    }
  }

  const formatLocation = (location: Location) => {
    return location.name.split(",")[0] || location.name
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Ride History</DialogTitle>
            <Button variant="outline" size="sm" onClick={fetchRideHistory} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="offered" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offered">Offered Rides ({offeredRides.length})</TabsTrigger>
            <TabsTrigger value="booked">Booked Rides ({bookedRides.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="offered" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading offered rides...</p>
              </div>
            ) : offeredRides.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No rides offered yet</p>
              </div>
            ) : (
              offeredRides.map((ride) => (
                <Card key={ride.id} className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ride.route}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {ride.bookings.length} booking{ride.bookings.length !== 1 ? "s" : ""}
                        </Badge>
                        {ride.isRecurring && <Badge variant="secondary">Recurring</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(ride.departureTime), "MMM dd, HH:mm")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {ride.availableSeats}/{ride.totalSeats} seats available
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{formatLocation(ride.pickup)}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{formatLocation(ride.dropoff)}</p>
                        </div>
                      </div>
                    </div>

                    {ride.bookings.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium mb-2">Passengers:</p>
                        <div className="space-y-2">
                          {ride.bookings.map((booking) => (
                            <div key={booking.id} className="flex items-center space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={booking.passengerAvatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{booking.passengerName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{booking.passengerName}</span>
                              <Badge variant="outline" className="text-xs">
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="booked" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading booked rides...</p>
              </div>
            ) : bookedRides.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No rides booked yet</p>
              </div>
            ) : (
              bookedRides.map((booking) => (
                <Card key={booking.bookingId} className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{booking.ride.route}</CardTitle>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.ride.driverAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{booking.ride.driverName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.ride.driverName}</p>
                        <p className="text-sm text-gray-600">
                          {booking.ride.rating.toFixed(1)} ★ • {booking.ride.totalRides} rides
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(booking.ride.departureTime), "MMM dd, HH:mm")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Booked {format(new Date(booking.bookedAt), "MMM dd")}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{formatLocation(booking.ride.pickup)}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{formatLocation(booking.ride.dropoff)}</p>
                        </div>
                      </div>
                    </div>

                    {booking.ride.price > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          Price: <span className="font-medium">₹{booking.ride.price}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
