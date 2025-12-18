'use client'

import Hero from "@/components/Hero"
import AvailableRaffles from "@/components/AvailableRaffles"

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden w-full max-w-full">
      {/* Hero Section - Siempre visible */}
      <Hero />
      
      {/* Sección de Rifas Disponibles */}
      <AvailableRaffles />
    </main>
  )
}
