"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"

interface Location {
  lat: number
  lng: number
  name: string
}

interface LocationSearchProps {
  placeholder: string
  onLocationSelect: (location: Location) => void
  selectedLocation?: Location | null
}

export function LocationSearch({ placeholder, onLocationSelect, selectedLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.name)
      setShowSuggestions(false)
    }
  }, [selectedLocation])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length > 2) {
      debounceRef.current = setTimeout(() => {
        searchLocations(query)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const searchLocations = async (searchQuery: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Lahore, Pakistan",
        )}&limit=5&addressdetails=1`,
      )

      const data = await response.json()

      const locations: Location[] = data.map((item: any) => ({
        lat: Number.parseFloat(item.lat),
        lng: Number.parseFloat(item.lon),
        name: item.display_name,
      }))

      setSuggestions(locations)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Error searching locations:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (location: Location) => {
    setQuery(location.name)
    setShowSuggestions(false)
    onLocationSelect(location)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (e.target.value !== selectedLocation?.name) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((location, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50"
              onClick={() => handleLocationSelect(location)}
            >
              <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{location.name}</span>
            </Button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
