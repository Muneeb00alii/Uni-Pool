"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Car,
  Search,
  Plus,
  Menu,
  User,
  History,
  LogOut,
  Navigation,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "./contexts/auth-context"
import { useRides } from "./hooks/use-rides"
import { useAI } from "./hooks/use-ai"
import { RideCard } from "./components/ride-card"
import LeafletMap from "./components/leaflet-map"
import { LocationSearch } from "./components/location-search"
import { ProfileModal } from "./components/profile-modal"
import { RideHistoryModal } from "./components/ride-history-modal"
import { SetupBanner } from "./components/setup-banner"

interface Location {
  lat: number
  lng: number
  name: string
}

export default function UniPoolApp() {
  const { user, login, register, logout, isAuthenticated, isLoading: authLoading, validateEmail } = useAuth()
  const { rides, isLoading, error, needsSetup, searchRides, createRide, bookRide, loadAllRides } = useRides()
  const { suggestions, getSuggestions, isLoadingSuggestions } = useAI()

  // UI State
  const [activeTab, setActiveTab] = useState("find")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)

  // Search State
  const [searchPickup, setSearchPickup] = useState<Location | null>(null)
  const [searchDropoff, setSearchDropoff] = useState<Location | null>(null)
  const [searchTime, setSearchTime] = useState("")
  const [searchDate, setSearchDate] = useState("")

  // Create Ride State
  const [createPickup, setCreatePickup] = useState<Location | null>(null)
  const [createDropoff, setCreateDropoff] = useState<Location | null>(null)
  const [createTime, setCreateTime] = useState("")
  const [createDate, setCreateDate] = useState("")
  const [createSeats, setCreateSeats] = useState("1")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDays, setRecurringDays] = useState<string[]>([])

  // Auth Form State
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authName, setAuthName] = useState("")
  const [authRollNumber, setAuthRollNumber] = useState("")
  const [authErrors, setAuthErrors] = useState<string[]>([])
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)

  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.4504, 74.3587]) // FCCU coordinates

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsAuthModalOpen(true)
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (searchPickup) {
      getSuggestions(searchPickup.name)
    }
  }, [searchPickup, getSuggestions])

  // Real-time email validation
  useEffect(() => {
    if (authEmail) {
      const errors: string[] = []
      if (!validateEmail(authEmail)) {
        errors.push("Email must be a valid FCCU email (ending with @formanite.fccollege.edu.pk)")
      }
      setAuthErrors(errors)
    } else {
      setAuthErrors([])
    }
  }, [authEmail, validateEmail])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthSubmitting(true)
    setAuthErrors([])

    try {
      if (authMode === "login") {
        await login(authEmail, authPassword)
        toast.success("Welcome back to UniPool!")
      } else {
        await register(authEmail, authPassword, authName, authRollNumber)
        toast.success("Welcome to UniPool! Your account has been created.")
      }
      setIsAuthModalOpen(false)
      resetAuthForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      setAuthErrors([errorMessage])
      toast.error(errorMessage)
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  const resetAuthForm = () => {
    setAuthEmail("")
    setAuthPassword("")
    setAuthName("")
    setAuthRollNumber("")
    setAuthErrors([])
    setShowPassword(false)
  }

  const handleSearch = async () => {
    if (!searchPickup) {
      toast.error("Please select a pickup location")
      return
    }

    try {
      await searchRides({
        pickup: searchPickup,
        dropoff: searchDropoff || { lat: 0, lng: 0, name: "" },
        time: searchTime,
        date: searchDate,
      })
      toast.success("Search completed!")
    } catch (error) {
      toast.error("Search failed")
    }
  }

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!createPickup || !createDropoff || !createTime || !createDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createRide({
        pickup: createPickup,
        dropoff: createDropoff,
        departureTime: createTime,
        rideDate: createDate,
        availableSeats: Number.parseInt(createSeats),
        isRecurring,
        recurringDays,
      })

      toast.success("Ride created successfully!")
      resetCreateForm()
      setActiveTab("find")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ride")
    }
  }

  const resetCreateForm = () => {
    setCreatePickup(null)
    setCreateDropoff(null)
    setCreateTime("")
    setCreateDate("")
    setCreateSeats("1")
    setIsRecurring(false)
    setRecurringDays([])
  }

  const handleBookRide = async (rideId: string) => {
    try {
      await bookRide(rideId)
      toast.success("Ride booked successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to book ride")
    }
  }

  const handleMapLocationSelect = (location: Location) => {
    if (activeTab === "find") {
      if (!searchPickup) {
        setSearchPickup(location)
      } else if (!searchDropoff) {
        setSearchDropoff(location)
      }
    } else if (activeTab === "offer") {
      if (!createPickup) {
        setCreatePickup(location)
      } else if (!createDropoff) {
        setCreateDropoff(location)
      }
    }
  }

  const handleRecurringDayToggle = (day: string) => {
    setRecurringDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleShowAllRides = () => {
    setSearchPickup(null)
    setSearchDropoff(null)
    setSearchTime("")
    setSearchDate("")
    loadAllRides()
    toast.success("Showing all available rides")
  }

  const handleAuthModeSwitch = () => {
    setAuthMode(authMode === "login" ? "register" : "login")
    setAuthErrors([])
    setShowPassword(false)
  }

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            UniPool
          </h1>
          <p className="text-gray-600">Loading your ride-sharing experience...</p>
        </div>
      </div>
    )
  }

  // Get Started screen (Authentication Modal)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Dialog open={isAuthModalOpen} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Car className="h-8 w-8 text-blue-600" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    UniPool
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{authMode === "login" ? "Welcome Back!" : "Get Started"}</h2>
                  <p className="text-sm text-gray-600">
                    {authMode === "login"
                      ? "Sign in to your account to continue"
                      : "Create your account to start ride-sharing"}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Display validation errors */}
            {authErrors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <ul className="space-y-1">
                    {authErrors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">FCCU Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@formanite.fccollege.edu.pk"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className={authEmail && !validateEmail(authEmail) ? "border-red-300 focus:border-red-500" : ""}
                  required
                />
                {authEmail && validateEmail(authEmail) && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-3 w-3" />
                    Valid FCCU email
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {authMode === "register" && (
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                )}
              </div>

              {authMode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      placeholder="261XXXXXX"
                      value={authRollNumber}
                      onChange={(e) => setAuthRollNumber(e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-gray-500">Format: 261XXXXXX</p>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isAuthSubmitting || (!!authEmail && !validateEmail(authEmail))}
              >
                {isAuthSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {authMode === "login" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : authMode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center">
                <Button type="button" variant="link" onClick={handleAuthModeSwitch} disabled={isAuthSubmitting}>
                  {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </form>

            {/* Additional info for new users */}
            {authMode === "register" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">About UniPool</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share rides with fellow FCCU students</li>
                  <li>• Safe and verified community</li>
                  <li>• Reduce travel costs and make friends</li>
                  <li>• Eco-friendly transportation solution</li>
                </ul>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UniPool
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsHistoryModalOpen(true)}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Menu</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsHistoryModalOpen(true)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Ride History
                    </Button>
                    <Separator />
                    <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {needsSetup && <SetupBanner />}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
                <TabsTrigger value="find" className="data-[state=active]:bg-white">
                  <Search className="h-4 w-4 mr-2" />
                  Find a Ride
                </TabsTrigger>
                <TabsTrigger value="offer" className="data-[state=active]:bg-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Offer a Ride
                </TabsTrigger>
              </TabsList>

              <TabsContent value="find" className="space-y-4">
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Find Your Ride
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pickup Location</Label>
                      <LocationSearch
                        placeholder="Where are you starting from?"
                        onLocationSelect={setSearchPickup}
                        selectedLocation={searchPickup}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Destination (Optional)</Label>
                      <LocationSearch
                        placeholder="Where are you going?"
                        onLocationSelect={setSearchDropoff}
                        selectedLocation={searchDropoff}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search-time">Time (Optional)</Label>
                        <Input
                          id="search-time"
                          type="time"
                          value={searchTime}
                          onChange={(e) => setSearchTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="search-date">Date (Optional)</Label>
                        <Input
                          id="search-date"
                          type="date"
                          value={searchDate}
                          onChange={(e) => setSearchDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search Rides
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleShowAllRides} disabled={isLoading}>
                        Show All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Sparkles className="h-5 w-5" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="p-3 bg-white/60 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="offer" className="space-y-4">
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Offer a Ride
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateRide} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pickup Location *</Label>
                        <LocationSearch
                          placeholder="Where will you pick up passengers?"
                          onLocationSelect={setCreatePickup}
                          selectedLocation={createPickup}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Destination *</Label>
                        <LocationSearch
                          placeholder="Where are you going?"
                          onLocationSelect={setCreateDropoff}
                          selectedLocation={createDropoff}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="create-time">Departure Time *</Label>
                          <Input
                            id="create-time"
                            type="time"
                            value={createTime}
                            onChange={(e) => setCreateTime(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-date">Date *</Label>
                          <Input
                            id="create-date"
                            type="date"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seats">Available Seats *</Label>
                        <Select value={createSeats} onValueChange={setCreateSeats}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} seat{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="recurring"
                            checked={isRecurring}
                            onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                          />
                          <Label htmlFor="recurring">Recurring ride</Label>
                        </div>

                        {isRecurring && (
                          <div className="space-y-2">
                            <Label>Select days:</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                (day) => (
                                  <Button
                                    key={day}
                                    type="button"
                                    variant={recurringDays.includes(day) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleRecurringDayToggle(day)}
                                  >
                                    {day.slice(0, 3)}
                                  </Button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Ride
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Map */}
          <div className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <LeafletMap
                    center={mapCenter}
                    onLocationSelect={handleMapLocationSelect}
                    pickupLocation={activeTab === "find" ? searchPickup : createPickup}
                    dropoffLocation={activeTab === "find" ? searchDropoff : createDropoff}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Rides */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Available Rides
                {rides.length > 0 && <Badge variant="secondary">{rides.length}</Badge>}
              </div>
              <Button variant="outline" size="sm" onClick={loadAllRides} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadAllRides} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading rides...</p>
              </div>
            )}

            {!isLoading && !error && rides.length === 0 && (
              <div className="text-center py-8">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No rides available at the moment</p>
                <Button onClick={loadAllRides} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}

            {!isLoading && !error && rides.length > 0 && (
              <div className="grid gap-4">
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} onBook={() => handleBookRide(ride.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
      <RideHistoryModal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} />
    </div>
  )
}
