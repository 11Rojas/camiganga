import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import  Raffle from "@/models/Raffle"

export async function GET() {
  try {
    await connectDB()

    // Obtener rifas activas ordenadas por fecha de creación (más recientes primero)
    const activeRaffles = await Raffle.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(6) // Limitar a 6 rifas para la página principal

    return NextResponse.json(activeRaffles)
  } catch (error) {
    console.error("Error fetching active raffles:", error)
    return NextResponse.json(
      { error: "Error al obtener las rifas activas" },
      { status: 500 }
    )
  }
}
