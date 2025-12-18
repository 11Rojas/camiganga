"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative w-full overflow-x-hidden max-w-full">
      {/* Franja superior verde amarillento */}
      <div className="bg-[#948f30] h-2 w-full"></div>
      
      {/* Contenedor principal con fondo verde oliva oscuro */}
      <div className="bg-[#948f30] w-full overflow-x-hidden max-w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 w-full">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Card beige con logo */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <div className="bg-[#F5EEDC] rounded-3xl p-6 md:p-10 shadow-xl max-w-full">
                <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
                  <Image 
                    src="/logo.png" 
                    alt="CAMIGANGA" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Texto y botón al lado */}
            <div className="text-white space-y-3 text-center md:text-left w-full md:w-auto">
              {/* Ubicación */}
              <p className="text-white text-base md:text-lg font-sans mb-2">
                Carabobo, Venezuela
              </p>
              
              {/* Título principal */}
              <div className="space-y-0">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-sans uppercase leading-none break-words">
                  RIFAS
                </h1>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-sans uppercase leading-none mt-1 break-words">
                  CAMIGANGA
                </h1>
              </div>
              
              {/* Subtítulo */}
              <p className="text-white text-lg md:text-xl font-sans mt-4">
                RIFAS CAMIGANGA
              </p>
              
              {/* Botón */}
              <div className="pt-4 flex justify-center md:justify-start">
                <Link href="/eventos">
                  <Button 
                    className="bg-[#948f30] hover:bg-[#a39d40] text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl uppercase tracking-wide transition-colors font-sans text-sm md:text-base whitespace-nowrap"
                  >
                    LISTA DE DISPONIBLES
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Franja inferior verde amarillento */}
      <div className="bg-[#948f30] h-2 w-full"></div>
    </div>
  )
}

