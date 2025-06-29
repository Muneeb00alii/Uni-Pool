import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { getJwtSecret } from "@/lib/auth";

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    return decoded
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pickup, dropoff, departureTime, rideDate, availableSeats, isRecurring, recurringDays } =
      await request.json()

    // Validate required fields
    if (!pickup || !dropoff || !departureTime || !rideDate || !availableSeats) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate seat count
    if (availableSeats < 1 || availableSeats > 8) {
      return NextResponse.json({ error: "Available seats must be between 1 and 8" }, { status: 400 })
    }

    // Validate date is not in the past
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().split(" ")[0].substring(0, 5)

    if (rideDate < currentDate || (rideDate === currentDate && departureTime <= currentTime)) {
      return NextResponse.json({ error: "Cannot create rides for past dates/times" }, { status: 400 })
    }

    // Generate route description
    const route = `${pickup.name.split(",")[0]} → ${dropoff.name.split(",")[0]}`

    // Create ride
    const ride = await prisma.ride.create({
      data: {
        driverId: user.userId,
        pickup: JSON.stringify(pickup),
        dropoff: JSON.stringify(dropoff),
        departureTime: new Date(`${rideDate}T${departureTime}:00Z`),
        availableSeats,
        totalSeats: availableSeats,
        price: 0,
        route,
        isRecurring: isRecurring || false,
        recurringDays: recurringDays || [],
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            totalRides: true,
            isVerified: true,
          },
        },
      },
    })

    const formattedRide = {
      id: ride.id,
      driverId: ride.driverId,
      driverName: ride.driver.name || "Unknown Driver",
      driverAvatar: ride.driver.avatar || "/placeholder.svg?height=48&width=48",
      rating: ride.driver.rating || 5.0,
      totalRides: ride.driver.totalRides || 0,
      pickup: safeParseLocation(ride.pickup),
      dropoff: safeParseLocation(ride.dropoff),
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      totalSeats: ride.totalSeats,
      price: ride.price || 0,
      verified: ride.driver.isVerified || false,
      route: ride.route,
      isRecurring: ride.isRecurring,
      recurringDays: ride.recurringDays,
      createdAt: ride.createdAt,
    }

    return NextResponse.json({
      message: "Ride created successfully",
      ride: formattedRide,
    })
  } catch (error) {
    console.error("Create ride error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function safeParseLocation(json: string | null): {
  name: string;
  [key: string]: any;
} {
  if (!json) return { name: "Unknown" };
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && parsed.name) {
      return parsed;
    }
    return { name: "Unknown" };
  } catch {
    return { name: "Unknown" };
  }
}
