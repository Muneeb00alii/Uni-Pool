import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { getJwtSecret } from "@/lib/auth";

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false
  const normalizedEmail = email.trim().toLowerCase()
  return normalizedEmail.endsWith("@formanite.fccollege.edu.pk") && normalizedEmail.includes("@")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Normalize and validate email
    const normalizedEmail = email.trim().toLowerCase()
    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          error: "Please use your FCCU email address (must end with @formanite.fccollege.edu.pk)",
        },
        { status: 400 },
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "No account found with this email address. Please check your email or create a new account.",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: "Incorrect password. Please try again.",
        },
        { status: 401 },
      )
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
      expiresIn: "7d",
    })

    return NextResponse.json({
      message: "Login successful! Welcome back to UniPool.",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rollNumber: user.rollNumber,
        avatar: user.avatar,
        rating: user.rating,
        totalRides: user.totalRides,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "An error occurred while signing in. Please try again.",
      },
      { status: 500 },
    )
  }
}
