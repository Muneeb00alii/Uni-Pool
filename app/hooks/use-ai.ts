"use client"

import { useState, useCallback } from "react"

export function useAI() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const getSuggestions = useCallback(async (location: string) => {
    setIsLoadingSuggestions(true)

    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  return {
    suggestions,
    isLoadingSuggestions,
    getSuggestions,
  }
}
