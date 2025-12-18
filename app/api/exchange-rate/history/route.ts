import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ExchangeRate } from "@/models/ExchangeRate"

export async function GET() {
  try {
    await connectDB()

    const history = await ExchangeRate.find().populate("updatedBy", "name").sort({ createdAt: -1 }).limit(20)

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching exchange rate history:", error)
    return NextResponse.json({ error: "Error al obtener el historial" }, { status: 500 })
  }
}
