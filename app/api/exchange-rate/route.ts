import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ExchangeRate } from "@/models/ExchangeRate"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentRate = await ExchangeRate.findOne().sort({ createdAt: -1 })

    if (!currentRate) {
      // Crear tasa inicial si no existe
      const initialRate = new ExchangeRate({
        rate: 36.5,
        updatedBy: "system",
        previousRate: 0,
        change: 0,
      })
      await initialRate.save()
      return NextResponse.json(initialRate)
    }

    return NextResponse.json(currentRate)
  } catch (error) {
    console.error("Error fetching exchange rate:", error)
    return NextResponse.json({ error: "Error al obtener la tasa de cambio" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { rate } = await request.json()

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: "Tasa inválida" }, { status: 400 })
    }

    // Obtener tasa anterior
    const previousRate = await ExchangeRate.findOne().sort({ createdAt: -1 })
    const prevRateValue = previousRate?.rate || 0
    const change = rate - prevRateValue

    const newRate = new ExchangeRate({
      rate,
      updatedBy: session.user.id,
      previousRate: prevRateValue,
      change,
    })

    await newRate.save()

    return NextResponse.json(newRate, { status: 201 })
  } catch (error) {
    console.error("Error updating exchange rate:", error)
    return NextResponse.json({ error: "Error al actualizar la tasa de cambio" }, { status: 500 })
  }
}
