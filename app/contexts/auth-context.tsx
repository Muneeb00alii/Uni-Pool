"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string | null
  rollNumber: string | null
  avatar: string | null
  rating: number
  totalRides: number
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, rollNumber: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  validateEmail: (email: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Email validation function
  const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") return false

    // Normalize email - trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase()

    // Check if email ends with @formanite.fccollege.edu.pk
    return normalizedEmail.endsWith("@formanite.fccollege.edu.pk")
  }

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem("unipool_token")
    const userData = localStorage.getItem("unipool_user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("unipool_token")
        localStorage.removeItem("unipool_user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Validate email format before making API call
    if (!validateEmail(email)) {
      throw new Error("Please use your FCCU email address (ending with @formanite.fccollege.edu.pk)")
    }

    const normalizedEmail = email.trim().toLowerCase()

    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()

    localStorage.setItem("unipool_token", data.token)
    localStorage.setItem("unipool_user", JSON.stringify(data.user))

    setUser(data.user)
    setIsAuthenticated(true)
  }

  const register = async (email: string, password: string, name: string, rollNumber: string) => {
    // Validate email format before making API call
    if (!validateEmail(email)) {
      throw new Error("Please use your FCCU email address (ending with @formanite.fccollege.edu.pk)")
    }

    if (!name.trim()) {
      throw new Error("Please enter your full name")
    }

    if (!rollNumber.trim()) {
      throw new Error("Please enter your roll number")
    }

    const normalizedEmail = email.trim().toLowerCase()

    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()

    localStorage.setItem("unipool_token", data.token)
    localStorage.setItem("unipool_user", JSON.stringify(data.user))

    setUser(data.user)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("unipool_token")
    localStorage.removeItem("unipool_user")
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("unipool_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        validateEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
