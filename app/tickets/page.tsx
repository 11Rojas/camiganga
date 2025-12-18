"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MessageCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"

// Importar QR code dinámicamente para evitar problemas de SSR
const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), { ssr: false })

function TicketsContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")
  
  const [verifierInput, setVerifierInput] = useState(emailParam || "")
  const [verifierResult, setVerifierResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNumbersOnly, setShowNumbersOnly] = useState(false)

  // Si hay email en la URL, buscar automáticamente
  useEffect(() => {
    if (emailParam && verifierInput === emailParam) {
      handleVerifyTicket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam])

  const handleVerifyTicket = async () => {
    if (!verifierInput.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/verify?email=${encodeURIComponent(verifierInput.trim())}`)
      const data = await response.json()
      
      if (response.ok && data.purchases && data.purchases.length > 0) {
        setVerifierResult(data)
      } else {
        setVerifierResult(null)
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      setVerifierResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener todos los números de todas las compras
  const getAllNumbers = () => {
    if (!verifierResult?.purchases) return []
    const allNumbers: number[] = []
    verifierResult.purchases.forEach((purchase: any) => {
      if (purchase.numbers) {
        allNumbers.push(...purchase.numbers)
      }
    })
    return allNumbers.sort((a, b) => a - b)
  }

  const totalNumbers = getAllNumbers().length
  const firstName = verifierResult?.purchases?.[0]?.paymentData?.name?.split(" ")[0] || ""
  const lastName = verifierResult?.purchases?.[0]?.paymentData?.name?.split(" ").slice(1).join(" ") || ""
  
  // Generar datos para el QR code
  const qrData = verifierResult ? JSON.stringify({
    name: verifierResult.purchases[0]?.paymentData?.name || "",
    email: verifierResult.purchases[0]?.paymentData?.email || "",
    numbers: getAllNumbers(),
    total: verifierResult.purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0)
  }) : ""

  return (
    <div className="min-h-screen bg-white p-4 pb-20" id="tickets-page">
      <div className="max-w-md mx-auto space-y-4">
        {/* Card 1 - Verificador */}
        <Card className="bg-white shadow-md rounded-xl">
          <CardContent className="p-6">
            {/* Título */}
            <h1 className="text-3xl font-bold text-[#032a3d] text-center mb-6 uppercase" style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>
              VERIFICADOR DE BOLETOS
            </h1>

            {/* Input */}
            <div className="mb-2">
              <Input
                type="text"
                value={verifierInput}
                onChange={(e) => setVerifierInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyTicket()
                  }
                }}
                  placeholder="4225698635 o email@ejemplo.com"
                  className="h-16 text-2xl font-bold text-black text-center border-gray-300 rounded-lg bg-white"
                  style={{ fontFamily: 'sans-serif' }}
                />
              </div>

              {/* Label */}
              <p className="text-sm text-gray-600 text-center mb-6" style={{ fontFamily: 'sans-serif' }}>
                Número de Teléfono, Email o #Boleto
              </p>

            {/* Botón BUSCAR */}
            <Button
              onClick={handleVerifyTicket}
              disabled={!verifierInput.trim() || isLoading}
              className="w-full h-14 bg-[#032a3d] hover:bg-[#054a6d] text-white rounded-lg shadow-md"
              style={{ fontFamily: 'sans-serif', fontWeight: 900 }}
            >
              <Search className="w-6 h-6 mr-2" />
              {isLoading ? "BUSCANDO..." : "BUSCAR"}
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 - Resultado */}
        {verifierResult && verifierResult.purchases && verifierResult.purchases.length > 0 && (
          <Card className="bg-white shadow-md rounded-xl">
            <CardContent className="p-6">
              {/* Nombre */}
              <div className="mb-6">
                <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-xl font-bold text-[#032a3d]" style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>
                    {firstName} {lastName}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                {qrData && (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <QRCodeSVG
                      value={qrData}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}
              </div>

              {/* Total de números */}
              <p className="text-base text-gray-600 text-center mb-4" style={{ fontFamily: 'sans-serif' }}>
                Números en total: {totalNumbers}
              </p>

              {/* Toggle Switch */}
              <div className="flex items-center justify-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNumbersOnly}
                    onChange={(e) => setShowNumbersOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#032a3d] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#032a3d]"></div>
                </label>
                <span className="text-base text-gray-600" style={{ fontFamily: 'sans-serif' }}>
                  Sólo números
                </span>
              </div>

              {/* Lista de números (si está activado el toggle) */}
              {showNumbersOnly && (
                <div className="mt-6">
                  <div className="grid grid-cols-5 gap-2">
                    {getAllNumbers().map((number) => (
                      <div
                        key={number}
                        className="bg-gray-100 text-[#032a3d] font-bold text-center py-2 rounded-lg"
                        style={{ fontFamily: 'sans-serif' }}
                      >
                        {number.toString().padStart(4, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/584120548176"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-[#032a3d] hover:bg-[#054a6d] rounded-full shadow-lg transition-all duration-300"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </a>
      </div>
    </div>
  )
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>}>
      <TicketsContent />
    </Suspense>
  )
}

