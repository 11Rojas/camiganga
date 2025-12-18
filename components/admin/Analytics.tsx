"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign, Trophy, Calendar } from "lucide-react"

export default function Analytics() {
  const monthlyData = [
    { month: "Ene", revenue: 12500, participants: 450, raffles: 8 },
    { month: "Feb", revenue: 15200, participants: 520, raffles: 10 },
    { month: "Mar", revenue: 18900, participants: 680, raffles: 12 },
    { month: "Abr", revenue: 22100, participants: 780, raffles: 15 },
    { month: "May", revenue: 19800, participants: 720, raffles: 13 },
    { month: "Jun", revenue: 25400, participants: 890, raffles: 18 },
  ]

  const topRaffles = [
    { name: "iPhone 15 Pro Max", participants: 234, revenue: "$1,170", completion: 85 },
    { name: "PlayStation 5", participants: 456, revenue: "$1,368", completion: 57 },
    { name: "MacBook Air M3", participants: 187, revenue: "$1,496", completion: 37 },
    { name: "AirPods Pro", participants: 678, revenue: "$2,034", completion: 92 },
    { name: "Samsung Galaxy S24", participants: 345, revenue: "$1,725", completion: 68 },
  ]

  const paymentMethods = [
    { method: "Zelle", count: 145, percentage: 45 },
    { method: "Pago Móvil", count: 98, percentage: 30 },
    { method: "Mercado Pago", count: 82, percentage: 25 },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analíticas</h1>
          <p className="text-sm sm:text-base text-gray-600">Estadísticas y métricas del rendimiento</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-gray-600">Período</p>
          <p className="text-gray-800 font-semibold text-sm sm:text-base">Últimos 6 meses</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Ingresos Totales</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">$113,900</p>
                <p className="text-green-400 text-xs sm:text-sm">+23% vs período anterior</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Participantes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">4,040</p>
                <p className="text-blue-400 text-xs sm:text-sm">+18% vs período anterior</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Rifas Completadas</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">76</p>
                <p className="text-yellow-400 text-xs sm:text-sm">+15% vs período anterior</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Tasa de Conversión</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">68.5%</p>
                <p className="text-purple-400 text-xs sm:text-sm">+5.2% vs período anterior</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white flex items-center text-base sm:text-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-white font-medium w-6 sm:w-8 text-sm sm:text-base">{data.month}</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 sm:h-3 rounded-full"
                          style={{ width: `${(data.revenue / 25400) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm sm:text-base">${data.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Raffles */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white flex items-center text-base sm:text-lg">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
              Rifas Más Exitosas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {topRaffles.map((raffle, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                    <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">{raffle.name}</h4>
                    <span className="text-yellow-400 font-bold text-sm sm:text-base">{raffle.revenue}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-2">
                    <span>{raffle.participants} participantes</span>
                    <span>{raffle.completion}% completado</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${raffle.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payment Methods Distribution */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white text-base sm:text-lg">Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                        method.method === "Zelle"
                          ? "bg-blue-500"
                          : method.method === "Pago Móvil"
                            ? "bg-green-500"
                            : "bg-purple-500"
                      }`}
                    />
                    <span className="text-white text-sm sm:text-base">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm sm:text-base">{method.count}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">{method.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white flex items-center text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm sm:text-base">Nuevos participantes hoy</span>
                <span className="text-green-400 font-bold text-sm sm:text-base">+47</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm sm:text-base">Pagos procesados hoy</span>
                <span className="text-blue-400 font-bold text-sm sm:text-base">23</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm sm:text-base">Rifas creadas esta semana</span>
                <span className="text-yellow-400 font-bold text-sm sm:text-base">3</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm sm:text-base">Ganadores esta semana</span>
                <span className="text-purple-400 font-bold text-sm sm:text-base">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
