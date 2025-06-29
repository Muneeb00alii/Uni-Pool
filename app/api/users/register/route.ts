import { getJwtSecret } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"; // ✅ Correct import

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.endsWith("@formanite.fccollege.edu.pk") && normalizedEmail.includes("@");
}

function validateRollNumber(rollNumber: string): boolean {
  if (!rollNumber || typeof rollNumber !== "string") return false;
  const normalized = rollNumber.trim();
  return normalized.length === 9 && normalized.startsWith("2");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, rollNumber } = await request.json();

    if (!email || !password || !name || !rollNumber) {
      return NextResponse.json(
        { error: "All fields are required (email, password, name, roll number)" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please use your FCCU email address (must end with @formanite.fccollege.edu.pk)" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const normalizedRollNumber = rollNumber.trim().toUpperCase();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid full name (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (!validateRollNumber(normalizedRollNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid roll number (e.g., 261XXXXXX)" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: trimmedName,
        rollNumber: normalizedRollNumber,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Account created successfully! Welcome to UniPool.",
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
    });
  } catch (error: unknown) { // ✅ Explicitly unknown
    console.error("Registration error:", error);

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target || []) as string[];
      const field = target[0];

      let message = "An account with this email or roll number already exists.";
      if (field === "email") {
        message = "An account with this email already exists.";
      } else if (field === "rollNumber") {
        message = "An account with this roll number already exists.";
      }

      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "An error occurred while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
