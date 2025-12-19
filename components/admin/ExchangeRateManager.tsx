"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, History, Save } from "lucide-react"

interface ExchangeRate {
  _id: string
  rate: number
  updatedBy: {
    _id: string
    name: string
  }
  previousRate: number
  change: number
  createdAt: string
  updatedAt: string
}

export default function ExchangeRateManager() {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null)
  const [newRate, setNewRate] = useState("")
  const [history, setHistory] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchCurrentRate()
    fetchHistory()
  }, [])

  const fetchCurrentRate = async () => {
    try {
      const response = await fetch("/api/exchange-rate")
      const data = await response.json()
      setCurrentRate(data)
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/exchange-rate/history")
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error("Error fetching history:", error)
    }
  }

  const handleUpdateRate = async () => {
    if (!newRate || Number.parseFloat(newRate) <= 0) return

    setUpdating(true)
    try {
      const response = await fetch("/api/exchange-rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rate: Number.parseFloat(newRate) }),
      })

      if (response.ok) {
        fetchCurrentRate()
        fetchHistory()
        setNewRate("")
        alert("Tasa actualizada correctamente")
      } else {
        alert("Error al actualizar la tasa")
      }
    } catch (error) {
      console.error("Error updating rate:", error)
      alert("Error al actualizar la tasa")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-gray-800 text-center">Cargando...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tasa de Cambio</h1>
          <p className="text-sm sm:text-base text-gray-600">Administra la tasa de cambio USD a Bolívares</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Rate */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Tasa Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-2">{currentRate?.rate?.toFixed(2) || "0.00"}</div>
              <div className="text-gray-400 text-sm sm:text-base">Bolívares por USD</div>
              {currentRate && currentRate.change !== 0 && (
                <div className={`text-xs sm:text-sm mt-2 ${currentRate.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  {currentRate.change > 0 ? "+" : ""}
                  {currentRate.change?.toFixed(2)} desde la última actualización
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="newRate" className="text-gray-800 text-sm sm:text-base">
                  Nueva Tasa
                </Label>
                <Input
                  id="newRate"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 36.75"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="bg-white border-gray-300 text-gray-800 text-sm sm:text-base"
                />
              </div>

              <Button
                onClick={handleUpdateRate}
                disabled={!newRate || Number.parseFloat(newRate) <= 0 || updating}
                className="w-full btn-gold text-sm sm:text-base"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {updating ? "Actualizando..." : "Actualizar Tasa"}
              </Button>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
              <h4 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">⚠️ Importante</h4>
              <p className="text-black text-xs sm:text-sm">
                Al actualizar la tasa de cambio, todos los nuevos pagos en Bolívares utilizarán esta nueva tasa. Los
                pagos pendientes mantendrán la tasa con la que fueron creados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rate Calculator */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 text-base sm:text-lg">Calculadora de Conversión</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="usdAmount" className="text-gray-800 text-sm sm:text-base">
                  Monto en USD
                </Label>
                <Input
                  id="usdAmount"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 5.00"
                  className="bg-white border-gray-300 text-gray-800 text-sm sm:text-base"
                  onChange={(e) => {
                    const usd = Number.parseFloat(e.target.value) || 0
                    const bs = usd * (currentRate?.rate || 0)
                    const bsElement = document.getElementById("bsResult")
                    if (bsElement) {
                      bsElement.textContent = `Bs ${bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                    }
                  }}
                />
              </div>

              <div className="text-center py-3 sm:py-4">
                <div className="text-xl sm:text-2xl text-gray-400">×</div>
                <div className="text-lg sm:text-xl font-bold text-yellow-400">{currentRate?.rate?.toFixed(2) || "0.00"}</div>
                <div className="text-xs sm:text-sm text-gray-400">Tasa actual</div>
              </div>

              <div>
                <Label className="text-gray-800 text-sm sm:text-base">Equivalente en Bolívares</Label>
                <div className="mt-1 p-2.5 sm:p-3 bg-gray-800 rounded-lg border border-gray-600">
                  <div id="bsResult" className="text-lg sm:text-2xl font-bold text-green-400">
                    Bs 0.00
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-6">
                {[1, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="btn-gold-outline text-xs sm:text-sm bg-transparent"
                    onClick={() => {
                      const usdInput = document.getElementById("usdAmount") as HTMLInputElement
                      const bsElement = document.getElementById("bsResult")
                      if (usdInput && bsElement) {
                        usdInput.value = amount.toString()
                        const bs = amount * (currentRate?.rate || 0)
                        bsElement.textContent = `Bs ${bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                      }
                    }}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate History */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
            <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-2 sm:space-y-3">
            {history.map((entry, index) => (
              <div key={entry._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">{entry.rate.toFixed(2)} Bs</div>
                  {entry.change !== 0 && (
                    <div
                      className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                        entry.change > 0 ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                      }`}
                    >
                      {entry.change > 0 ? "+" : ""}
                      {entry.change.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-gray-400 text-xs sm:text-sm">{new Date(entry.createdAt).toLocaleString("es-VE", { timeZone: "America/Caracas" })}</div>
                  <div className="text-gray-500 text-xs">por {entry.updatedBy?.name || "Sistema"}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
