"use client"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  email: string
  name: string
  rollNumber: string
  avatar?: string
  preferences?: any
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, rollNumber: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const context = useContext(AuthContext)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      rollNumber: email.split("@")[0],
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setUser(mockUser)
    localStorage.setItem("unipool_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const register = async (email: string, password: string, name: string, rollNumber: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      email,
      name,
      rollNumber,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setUser(mockUser)
    localStorage.setItem("unipool_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("unipool_user")
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("unipool_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  if (!context) {
    return { user, login, register, logout, isLoading }
  }
  return context
}
