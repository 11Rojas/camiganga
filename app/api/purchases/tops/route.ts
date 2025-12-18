import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // 1. Encontrar la última rifa activa
    const activeRaffles = await (Raffle as any).find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(1)
    
    const lastActiveRaffle = activeRaffles[0]

    if (!lastActiveRaffle) {
      return NextResponse.json(
        { topBuyers: [] },
        { status: 200 }
      )
    }

    // 2. Agregación optimizada para obtener datos agrupados por email
    const topBuyers = await Purchase.aggregate([
      { 
        $match: { 
          status: "approved",
          raffleId: lastActiveRaffle._id,
          "paymentData.email": { $exists: true, $ne: "" } // Solo emails no vacíos
        } 
      },
      {
        $group: {
          _id: "$paymentData.email", // Agrupamos por email
          totalNumbers: { $sum: { $size: "$numbers" } }, // Sumamos los números
          totalPurchases: { $sum: 1 }, // Contamos las compras
          totalAmount: { $sum: "$amount" }, // Sumamos el monto total
          name: { $first: "$paymentData.name" }, // Tomamos el primer nombre
          phone: { $first: "$paymentData.phone" } // Tomamos el primer teléfono
        }
      },
      { $sort: { totalNumbers: -1 } }, // Ordenamos por cantidad de números
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          email: "$_id",
          name: 1,
          phone: 1,
          totalNumbers: 1,
          totalPurchases: 1,
          totalAmount: 1
        }
      }
    ])

    return NextResponse.json({
      topBuyers
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { topBuyers: [], error: "Error al obtener datos" },
      { status: 500 }
    )
  }
}