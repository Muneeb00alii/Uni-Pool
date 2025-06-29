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

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get rides offered by the user
    const offeredRides = await prisma.ride.findMany({
      where: { driverId: user.userId },
      include: {
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get rides booked by the user
    const bookedRides = await prisma.booking.findMany({
      where: { passengerId: user.userId },
      include: {
        ride: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Format offered rides
    interface FormattedBooking {
      id: string;
      passengerId: string;
      passengerName: string;
      passengerAvatar: string;
      status: string;
      bookedAt: Date;
    }

    interface FormattedOfferedRide {
      id: string;
      pickup: { name: string; [key: string]: any };
      dropoff: { name: string; [key: string]: any };
      departureTime: Date;
      availableSeats: number;
      totalSeats: number;
      price: number;
      route: string;
      isRecurring: boolean;
      recurringDays: string[] | null;
      createdAt: Date;
      bookings: FormattedBooking[];
    }

    const formattedOfferedRides: FormattedOfferedRide[] = offeredRides.map((ride:any): FormattedOfferedRide => ({
      id: ride.id,
      pickup: safeParseLocation(ride.pickup),
      dropoff: safeParseLocation(ride.dropoff),
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      totalSeats: ride.totalSeats,
      price: ride.price || 0,
      route: ride.route,
      isRecurring: ride.isRecurring,
      recurringDays: ride.recurringDays,
      createdAt: ride.createdAt,
      bookings: ride.bookings.map((booking: {
        id: string;
        passengerId: string;
        passenger: { name?: string; avatar?: string };
        status: string;
        createdAt: Date;
      }): FormattedBooking => ({
        id: booking.id,
        passengerId: booking.passengerId,
        passengerName: booking.passenger.name || "Unknown",
        passengerAvatar: booking.passenger.avatar || "/placeholder.svg",
        status: booking.status,
        bookedAt: booking.createdAt,
      })),
    }));

    // Format booked rides
    const formattedBookedRides = bookedRides.map((booking:any) => ({
      bookingId: booking.id,
      status: booking.status,
      bookedAt: booking.createdAt,
      ride: {
        id: booking.ride.id,
        driverId: booking.ride.driverId,
        driverName: booking.ride.driver.name || "Unknown Driver",
        driverAvatar: booking.ride.driver.avatar || "/placeholder.svg",
        rating: booking.ride.driver.rating || 5.0,
        totalRides: booking.ride.driver.totalRides || 0,
        pickup: safeParseLocation(booking.ride.pickup),
        dropoff: safeParseLocation(booking.ride.dropoff),
        departureTime: booking.ride.departureTime,
        availableSeats: booking.ride.availableSeats,
        totalSeats: booking.ride.totalSeats,
        price: booking.ride.price || 0,
        verified: booking.ride.driver.isVerified || false,
        route: booking.ride.route,
        isRecurring: booking.ride.isRecurring,
        recurringDays: booking.ride.recurringDays,
        createdAt: booking.ride.createdAt,
      },
    }))

    return NextResponse.json({
      offeredRides: formattedOfferedRides,
      bookedRides: formattedBookedRides,
    })
  } catch (error) {
    console.error("Fetch ride history error:", error)
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
