"use client"

import Image from "next/image"

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
          </div>
        </div>
      </div>
      
      {/* Franja inferior verde amarillento */}
      <div className="bg-[#948f30] h-2 w-full"></div>
    </div>
  )
}

