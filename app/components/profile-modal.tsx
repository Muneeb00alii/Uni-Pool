"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Upload, User, Mail, Hash, Calendar } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import { toast } from "sonner"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    avatar: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        rollNumber: user.rollNumber || "",
        avatar: user.avatar || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("unipool_token")
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const data = await response.json()
      updateUser(data.user)
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, avatar: data.url }))
        toast.success("Avatar uploaded successfully!")
      } else {
        toast.error("Failed to upload avatar")
      }
    } catch (error) {
      toast.error("Failed to upload avatar")
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={isEditing ? formData.avatar : user.avatar || ""} />
                <AvatarFallback className="text-lg">{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                  <Upload className="h-3 w-3" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg">{user.name || "No name set"}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{user.rating.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-1 text-blue-500" />
                  Total Rides
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{user.totalRides}</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="Enter your roll number"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-gray-600">{user.name || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Roll Number</p>
                    <p className="text-sm text-gray-600">{user.rollNumber || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isVerified ? "default" : "secondary"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1" disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
