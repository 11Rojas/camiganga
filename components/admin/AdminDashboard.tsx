"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, DollarSign, Clock, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardStat {
  title: string
  value: string | number
  change: string
  icon: any
  color: string
}

interface RecentActivity {
  type: "payment" | "raffle" | "winner"
  message: string
  time: string
}

interface RafflePerformance {
  name: string
  sold: number
  total: number
  revenue: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topRaffles, setTopRaffles] = useState<RafflePerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()

        // Formatear estadísticas
        const formattedStats: DashboardStat[] = [
          {
            title: "Rifas Activas",
            value: data.stats.activeRaffles,
            change: "+2 esta semana", // Puedes obtener esto de la API si lo necesitas
            icon: Trophy,
            color: "from-blue-400 to-blue-600",
          },
          {
            title: "Total Participantes",
            value: data.stats.totalParticipants.toLocaleString(),
            change: `${data.stats.growthParticipants >= 0 ? '+' : ''}${data.stats.growthParticipants}% este mes`,
            icon: Users,
            color: "from-green-400 to-green-600",
          },
          {
            title: "Ingresos del Mes",
            value: `$${data.stats.monthlyRevenue.toLocaleString()}`,
            change: `${data.stats.growthRevenue >= 0 ? '+' : ''}${data.stats.growthRevenue}% vs mes anterior`,
            icon: DollarSign,
            color: "from-yellow-400 to-yellow-600",
          },
          {
            title: "Pagos Pendientes",
            value: data.stats.pendingPayments,
            change: "Requieren revisión",
            icon: Clock,
            color: "from-red-400 to-red-600",
          },
        ]

        // Formatear rifas con mejor desempeño
        const formattedRaffles: RafflePerformance[] = data.topRaffles.map((raffle: any) => ({
          name: raffle.title,
          sold: raffle.soldCount,
          total: raffle.totalNumbers,
          revenue: `$${(raffle.soldCount * raffle.ticketPrice).toLocaleString()}`
        }))

        setStats(formattedStats)
        setRecentActivity(data.recentActivity)
        setTopRaffles(formattedRaffles)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Resumen general del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="bg-white border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">{stat.title}</CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                      activity.type === "payment"
                        ? "bg-green-400"
                        : activity.type === "raffle"
                          ? "bg-blue-400"
                          : activity.type === "winner"
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-xs sm:text-sm leading-tight">{activity.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rifas Performance */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-gray-800 text-base sm:text-lg">Rendimiento de Rifas Activas</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {topRaffles.map((raffle, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                  <h4 className="text-gray-800 font-semibold text-sm sm:text-base leading-tight">{raffle.name}</h4>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">{raffle.revenue}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                  <span>
                    {raffle.sold} / {raffle.total} vendidos
                  </span>
                  <span>{((raffle.sold / raffle.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(raffle.sold / raffle.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}