"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import type { Raffle } from "@/lib/types"

interface RaffleCardProps {
  raffle: Raffle
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  // Calcular progreso
  const totalNumbers = raffle.totalNumbers || 100
  const soldNumbers = raffle.soldNumbers?.length || 0
  const baseProgress = totalNumbers > 0 ? (soldNumbers / totalNumbers) * 100 : 0
  const progress = Math.max(baseProgress, 36)

  // Formatear fecha
  const drawDate = new Date(raffle.drawDate)
  const formattedDate = drawDate.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas"
  })

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Imagen de la rifa */}
      <div className="relative w-full h-64">
        <Image
          src={raffle.image || "/placeholder.svg"}
          alt={raffle.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6 space-y-4">
        {/* Título con emojis */}
        <h3 className="text-2xl font-bold text-gray-800">
          {raffle.title} 😊 🏅 🏆
        </h3>

        {/* Fecha con icono */}
        <div className="flex items-center gap-2 text-gray-600">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border border-gray-300">
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <span className="font-semibold text-lg">{drawDate.getDate()}</span>
          <span>{formattedDate}</span>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#948f30] h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-center items-center text-sm text-gray-600">
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
        </div>

        {/* Botón */}
        <a href={`/rifa/${raffle._id}`}>
          <Button 
            className="w-full bg-[#948f30] hover:bg-[#a39d40] text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors"
          >
            COMPRAR TICKETS
          </Button>
        </a>
      </div>
    </div>
  )
}

