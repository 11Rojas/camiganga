"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Raffle } from "@/lib/types"

interface RaffleNavigatorProps {
  currentRaffleId: string
  onRaffleChange: (raffle: Raffle) => void
}

export default function RaffleNavigator({ currentRaffleId, onRaffleChange }: RaffleNavigatorProps) {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/raffles/active")
        if (response.ok) {
          const rafflesData = await response.json()
          setRaffles(rafflesData)
          
          // Encontrar el índice de la rifa actual
          const index = rafflesData.findIndex((r: Raffle) => r._id === currentRaffleId)
          setCurrentIndex(index >= 0 ? index : 0)
        }
      } catch (error) {
        console.error("Error fetching raffles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaffles()
  }, [currentRaffleId])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      onRaffleChange(raffles[newIndex])
    }
  }

  const handleNext = () => {
    if (currentIndex < raffles.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      onRaffleChange(raffles[newIndex])
    }
  }

  if (loading || raffles.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Anterior</span>
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Rifa {currentIndex + 1} de {raffles.length}
        </p>
        <p className="text-xs text-gray-500">
          {raffles[currentIndex]?.title}
        </p>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentIndex === raffles.length - 1}
        className="flex items-center space-x-2"
      >
        <span>Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
