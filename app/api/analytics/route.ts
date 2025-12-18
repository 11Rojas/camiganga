import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"
import {Purchase }from "@/models/Purchase"

export async function GET() {
  try {
    await connectDB()

    // 1. Estadísticas básicas
// 1. Estadísticas básicas
const [activeRaffles, totalParticipants, pendingPayments] = await Promise.all([
  Raffle.countDocuments({ status: "active" }),
  Purchase.aggregate([
    { $group: { _id: "$userId" } }, // Agrupa por userId para obtener usuarios únicos
    { $count: "count" } // Cuenta los grupos (usuarios únicos)
  ]).then(res => res[0]?.count || 0), // Extrae el número o devuelve 0 si no hay resultados
  Purchase.countDocuments({ status: "pending" })
])

    // 2. Ingresos del mes actual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyRevenueResult = await Purchase.aggregate([
      {
        $match: {
          status: "approved",
          createdAt: { $gte: firstDay, $lte: now }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0

    // 3. Actividad reciente (combinando múltiples fuentes)
    const recentActivity = await getRecentActivity()

    // 4. Rifas con mejor desempeño (top 3)
    const topRaffles = await Raffle.aggregate([
      { $match: { status: "active" } },
      { 
        $project: {
          title: 1,
          ticketPrice: 1,
          totalNumbers: 1,
          soldCount: { $size: "$soldNumbers" },
          completionPercentage: {
            $multiply: [
              { $divide: [{ $size: "$soldNumbers" }, "$totalNumbers"] },
              100
            ]
          }
        }
      },
      { $sort: { completionPercentage: -1 } },
      { $limit: 3 }
    ])

    return NextResponse.json({
      stats: {
        activeRaffles,
        totalParticipants,
        monthlyRevenue,
        pendingPayments,
        growthParticipants: await calculateGrowth('participants'),
        growthRevenue: await calculateGrowth('revenue')
      },
      recentActivity,
      topRaffles
    })

  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Error al obtener analíticas" },
      { status: 500 }
    )
  }
}

async function getRecentActivity(limit = 4) {
  const [payments, raffles, winners] = await Promise.all([
    Purchase.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('raffleId', 'title'),
    Raffle.find()
      .sort({ updatedAt: -1 })
      .limit(limit),
    Raffle.find({ 'winner.userId': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
  ])

  const activities = []

  // Pagos

payments.forEach(payment => {
  const raffleTitle = payment.raffleId?.title || 'Rifa desconocida';
  activities.push({
    type: "payment",
    message: `Pago ${payment.status === 'approved' ? 'aprobado' : 'rechazado'} - ${raffleTitle}`,
    time: formatTimeAgo(payment.updatedAt)
  })
})

  // Rifas
  raffles.forEach(raffle => {
    const isNew = raffle.createdAt.getTime() === raffle.updatedAt.getTime()
    activities.push({
      type: "raffle",
      message: `Rifa ${isNew ? 'creada' : 'actualizada'}: ${raffle.title}`,
      time: formatTimeAgo(raffle.updatedAt)
    })
  })

  // Ganadores
  winners.forEach(raffle => {
    activities.push({
      type: "winner",
      message: `Ganador seleccionado para ${raffle.title}`,
      time: formatTimeAgo(raffle.updatedAt)
    })
  })

  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit)
}



async function calculateGrowth(type: 'participants' | 'revenue') {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  if (type === 'participants') {
    const [current, previous] = await Promise.all([
      Purchase.aggregate([
        { 
          $match: { 
            createdAt: { $gte: currentMonth, $lte: now } 
          } 
        },
        { $group: { _id: "$userId" } },
        { $count: "count" }
      ]),
      Purchase.aggregate([
        { 
          $match: { 
            createdAt: { $gte: lastMonth, $lt: currentMonth } 
          } 
        },
        { $group: { _id: "$userId" } },
        { $count: "count" }
      ])
    ])

    const currentCount = current[0]?.count || 0
    const previousCount = previous[0]?.count || 0
    
    return previousCount > 0 ? 
      Math.round(((currentCount - previousCount) / previousCount) * 100) : 100
  } else {
    const [current, previous] = await Promise.all([
      Purchase.aggregate([
        { 
          $match: { 
            status: "approved",
            createdAt: { $gte: currentMonth, $lte: now } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Purchase.aggregate([
        { 
          $match: { 
            status: "approved",
            createdAt: { $gte: lastMonth, $lt: currentMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ])
    const currentTotal = current[0]?.total || 0
    const previousTotal = previous[0]?.total || 0
    return previousTotal > 0 ? 
      Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 100
  }
}

function formatTimeAgo(date: Date) {
  // Implementación similar a la anterior
  // ...
}