import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Buscar rifas completadas, ordenadas por fecha de sorteo descendente
    const query = { status: "completed" }
    const allCompletedRaffles = await (Raffle as any).find(query)
    const completedRaffles = allCompletedRaffles
      .sort((a: any, b: any) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime())
      .slice(skip, skip + limit)

    // Contar el total de rifas completadas
    const totalCompleted = allCompletedRaffles.length

    // Transformar los datos para incluir información adicional
    const transformedRaffles = completedRaffles.map((raffle: any) => ({
      _id: raffle._id,
      title: raffle.title,
      description: raffle.description,
      image: raffle.image,
      ticketPrice: raffle.ticketPrice,
      totalNumbers: raffle.totalNumbers,
      soldNumbers: raffle.soldNumbers,
      drawDate: raffle.drawDate,
      status: raffle.status,
      winner: raffle.winner,
      createdAt: raffle.createdAt,
      updatedAt: raffle.updatedAt,
      // Información adicional calculada
      soldCount: raffle.soldNumbers ? raffle.soldNumbers.length : 0,
      soldPercentage: raffle.totalNumbers > 0 ? 
        Math.round(((raffle.soldNumbers ? raffle.soldNumbers.length : 0) / raffle.totalNumbers) * 100) : 0
    }))

    return NextResponse.json({
      success: true,
      raffles: transformedRaffles,
      pagination: {
        page,
        limit,
        total: totalCompleted,
        totalPages: Math.ceil(totalCompleted / limit),
        hasNext: page < Math.ceil(totalCompleted / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error("Error fetching completed raffles:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los sorteos completados"
      },
      { status: 500 }
    )
  }
}
