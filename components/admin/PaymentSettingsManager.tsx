"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, Save, CreditCard } from "lucide-react"

interface PaymentSettings {
  _id: string
  phone: string
  ci: string
  bank: string
  bankName: string
  updatedBy: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function PaymentSettingsManager() {
  const [currentSettings, setCurrentSettings] = useState<PaymentSettings | null>(null)
  const [formData, setFormData] = useState({
    phone: "",
    ci: "",
    bank: "",
    bankName: "",
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/payment-settings")
      const data = await response.json()
      setCurrentSettings(data)
      setFormData({
        phone: data.phone || "",
        ci: data.ci || "",
        bank: data.bank || "",
        bankName: data.bankName || "BANCO VENEZOLANO DE CREDITO",
      })
    } catch (error) {
      console.error("Error fetching payment settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    if (!formData.phone || !formData.ci || !formData.bank) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    setUpdating(true)
    try {
      const response = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchSettings()
        alert("Configuración de pago actualizada correctamente")
      } else {
        const error = await response.json()
        alert(error.error || "Error al actualizar la configuración")
      }
    } catch (error) {
      console.error("Error updating payment settings:", error)
      alert("Error al actualizar la configuración")
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configuración de Pago Móvil</h1>
          <p className="text-sm sm:text-base text-gray-600">Administra los datos de pago móvil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Settings */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Configuración Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {currentSettings ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs sm:text-sm mb-1">Teléfono</div>
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">{currentSettings.phone}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs sm:text-sm mb-1">Cédula</div>
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">{currentSettings.ci}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs sm:text-sm mb-1">Banco</div>
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">{currentSettings.bankName}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs sm:text-sm mb-1">Código del Banco</div>
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">{currentSettings.bank}</div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-gray-500 text-xs">
                    Última actualización: {new Date(currentSettings.updatedAt).toLocaleString("es-VE", { timeZone: "America/Caracas" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No hay configuración guardada</div>
            )}
          </CardContent>
        </Card>

        {/* Update Form */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Actualizar Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-black text-sm sm:text-base font-semibold">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base mt-1"
                  placeholder="04128393072"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ci" className="text-black text-sm sm:text-base font-semibold">
                  Cédula *
                </Label>
                <Input
                  id="ci"
                  type="text"
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base mt-1"
                  placeholder="15903799"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bankName" className="text-black text-sm sm:text-base font-semibold">
                  Nombre del Banco
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base mt-1"
                  placeholder="BANCO VENEZOLANO DE CREDITO"
                />
              </div>

              <div>
                <Label htmlFor="bank" className="text-black text-sm sm:text-base font-semibold">
                  Código del Banco *
                </Label>
                <Input
                  id="bank"
                  type="text"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base mt-1"
                  placeholder="0104"
                  required
                />
              </div>

              <Button
                onClick={handleUpdateSettings}
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                {updating ? "Actualizando..." : "Actualizar Configuración"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


