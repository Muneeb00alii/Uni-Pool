"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

export function SetupBanner() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setIsSetupComplete(true)
        // Refresh the page after a short delay to load the data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSetupComplete) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Database setup completed successfully! The page will refresh shortly.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <span>Database tables not found. Click to create the required tables.</span>
          <Button onClick={handleSetup} disabled={isLoading} size="sm" className="ml-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating tables...
              </>
            ) : (
              "Create Tables"
            )}
          </Button>
        </div>
        {error && <div className="mt-2 text-red-600 text-sm">Error: {error}</div>}
      </AlertDescription>
    </Alert>
  )
}
