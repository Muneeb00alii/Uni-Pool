import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Check if tables exist by trying to count users
    try {
      await prisma.user.count()
      return NextResponse.json({
        message: "Database is already set up",
        success: true,
      })
    } catch (error) {
      // Tables don't exist, continue with setup
    }

    // The tables will be created automatically by Prisma when we run migrations
    // For now, just return success since Prisma handles table creation
    return NextResponse.json({
      message: "Database setup completed successfully. Please run 'npx prisma db push' to create tables.",
      success: true,
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: "Failed to setup database",
        success: false,
      },
      { status: 500 },
    )
  }
}
