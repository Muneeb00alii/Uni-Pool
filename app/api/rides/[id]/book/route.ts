import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/auth";

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.id;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.driverId === user.userId) {
      return NextResponse.json({ error: "Cannot book your own ride" }, { status: 400 });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: {
        rideId_passengerId: {
          rideId,
          passengerId: user.userId,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "You have already booked this ride" }, { status: 400 });
    }

    // Use transaction with atomic update
    const [booking, updatedRide] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          rideId,
          passengerId: user.userId,
          status: "confirmed",
        },
      }),
      prisma.ride.updateMany({
        where: {
          id: rideId,
          availableSeats: { gt: 0 },
        },
        data: {
          availableSeats: { decrement: 1 },
        },
      }),
    ]);

    // Check if seat decrement succeeded
    if (updatedRide.count === 0) {
      return NextResponse.json({ error: "No seats available" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Ride booked successfully",
      booking: {
        id: booking.id,
        rideId: booking.rideId,
        passengerId: booking.passengerId,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Book ride error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
