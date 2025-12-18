'use client'

import { useState, useEffect } from "react"
import Hero from "@/components/Hero"
import NewRaffleInterface from "@/components/NewRaffleInterface"
import type { Raffle } from "@/lib/types"

export default function HomePage() {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [exchangeRate, setExchangeRate] = useState(36)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener la primera rifa activa
        const raffleResponse = await fetch("/api/raffles/active")
        if (raffleResponse.ok) {
          const raffles = await raffleResponse.json()
          if (raffles.length > 0) {
            setRaffle(raffles[0])
          }
        }

        // Obtener tasa de cambio
        const exchangeResponse = await fetch("/api/exchange-rate")
        if (exchangeResponse.ok) {
          const data = await exchangeResponse.json()
          setExchangeRate(data.rate || 36)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRaffleChange = (newRaffle: Raffle) => {
    setRaffle(newRaffle)
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full max-w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#948f30] mx-auto mb-4"></div>
          <p className="text-[#948f30] text-lg">Cargando...</p>
        </div>
      </main>
    )
  }

  if (!raffle) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full max-w-full">
        <Hero />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-700 text-lg">No hay rifas disponibles en este momento</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden w-full max-w-full">
      {/* Hero Section */}
      <Hero />
      
      {/* Componente de Compra - Directamente en la página raíz */}
      <NewRaffleInterface 
        raffle={raffle} 
        exchangeRate={exchangeRate} 
        onRaffleChange={handleRaffleChange}
      />
    </main>
  )
}
