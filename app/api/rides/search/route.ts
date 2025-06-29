import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all future rides with available seats
    const rides = await prisma.ride.findMany({
      where: {
        availableSeats: { gt: 0 },
        departureTime: { gt: new Date() },
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
      orderBy: [{ departureTime: "asc" }],
    });

    const formattedRides = rides.map((ride:any) => ({
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
    }));

    return NextResponse.json({
      rides: formattedRides,
      total: formattedRides.length,
    });
  } catch (error) {
    console.error("Search rides error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff, time, date } = await request.json();

    const now = new Date();

    const whereClause: any = {
      availableSeats: { gt: 0 },
    };

    // Handle date and time filtering
    if (date && time) {
      // When both date and time are provided, filter ±30 min around that datetime
      const targetTime = new Date(`${date}T${time}:00Z`);
      const startTime = new Date(targetTime.getTime() - 30 * 60 * 1000);
      const endTime = new Date(targetTime.getTime() + 30 * 60 * 1000);

      whereClause.departureTime = {
        gte: startTime,
        lte: endTime,
      };
    } else if (date) {
      // Only date provided: whole day
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      whereClause.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      // No date: any future rides
      whereClause.departureTime = { gt: now };
    }

    // Filter by pickup location if provided
    if (pickup?.name) {
      whereClause.pickup = {
        contains: pickup.name,
        mode: "insensitive",
      };
    }

    const rides = await prisma.ride.findMany({
      where: whereClause,
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
      orderBy: [{ departureTime: "asc" }],
    });

    const formattedRides = rides.map((ride:any) => ({
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
    }));

    return NextResponse.json({
      rides: formattedRides,
      total: formattedRides.length,
    });
  } catch (error) {
    console.error("Search rides error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic"; // Ensure this route is always fresh
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
