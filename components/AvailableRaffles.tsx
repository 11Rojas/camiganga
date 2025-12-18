"use client"

import { useState, useEffect } from "react"
import RaffleCard from "./RaffleCard"
import type { Raffle } from "@/lib/types"
//g
export default function AvailableRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/raffles/active")
        if (response.ok) {
          const data = await response.json()
          setRaffles(data)
        }
      } catch (error) {
        console.error("Error fetching raffles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaffles()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#F5EEDC] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#948f30] mx-auto mb-4"></div>
            <p className="text-[#948f30]">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (raffles.length === 0) {
    return null
  }

  return (
    <div className="bg-[#F5EEDC] py-12 overflow-x-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#948f30] mb-2 break-words">
            ¡ Participa !
          </h2>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#948f30] break-words">
            DISPONIBLES
          </h3>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle._id} raffle={raffle} />
          ))}
        </div>
      </div>
    </div>
  )
}

