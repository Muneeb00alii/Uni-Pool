import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json()

    // Mock AI suggestions based on location
    const suggestions = [
      `Popular route from ${location} to FCCU campus`,
      `Best departure times for ${location} area`,
      `Eco-friendly carpooling saves 40% on fuel costs`,
      `Join 500+ students already using UniPool`,
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("AI suggestions error:", error)
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 })
  }
}
