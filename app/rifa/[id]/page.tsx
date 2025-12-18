'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import NewRaffleInterface from "@/components/NewRaffleInterface"
import RaffleNavigator from "@/components/RaffleNavigator"
import type { Raffle } from "@/lib/types"

export default function RafflePage() {
  const params = useParams()
  const raffleId = params?.id as string
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [exchangeRate, setExchangeRate] = useState(36)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get raffle by ID
        const raffleResponse = await fetch(`/api/raffles/${raffleId}`)
        if (!raffleResponse.ok) {
          throw new Error("Rifa no encontrada")
        }
        const raffleData = await raffleResponse.json()
        setRaffle(raffleData)

        // Get exchange rate
        const exchangeResponse = await fetch("/api/exchange-rate")
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json()
          setExchangeRate(exchangeData.rate || 36)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error al cargar la rifa")
      } finally {
        setLoading(false)
      }
    }

    if (raffleId) {
      fetchData()
    }
  }, [raffleId])

  const handleRaffleChange = (newRaffle: Raffle) => {
    setRaffle(newRaffle)
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full max-w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando...</p>
        </div>
      </main>
    )
  }

  if (error || !raffle) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full max-w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-lg mb-4">{error || "Rifa no encontrada"}</p>
          <a href="/" className="text-blue-600 hover:underline">Volver al inicio</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden w-full max-w-full">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RaffleNavigator 
          currentRaffleId={raffle._id} 
          onRaffleChange={handleRaffleChange}
        />
      </div>
      <NewRaffleInterface 
        raffle={raffle} 
        exchangeRate={exchangeRate} 
        onRaffleChange={handleRaffleChange}
      />
    </main>
  )
}

