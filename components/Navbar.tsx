"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Home, CheckCircle, User } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative w-full">
      <nav className="sticky top-0 z-50 w-full overflow-x-hidden max-w-full relative">
        {/* Franja superior verde oliva oscura */}
        <div className="bg-[#948f30] h-1 w-full"></div>
        
        {/* Área blanca central */}
        <div className="bg-white w-full overflow-x-hidden max-w-full relative">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 w-full">
            {/* Desktop: Layout horizontal */}
            <div className="hidden md:flex items-center justify-between gap-2">
              {/* Logo y texto a la izquierda */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="CAMIGANGA" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Enlaces de navegación en el centro */}
              <div className="flex items-center space-x-6 flex-1 justify-center min-w-0">
                <Link
                  href="/"
                  className="text-black font-bold text-sm uppercase tracking-wide hover:opacity-80 transition-opacity whitespace-nowrap"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  INICIO
                </Link>
                <Link
                  href="/pagos"
                  className="text-black font-bold text-sm uppercase tracking-wide hover:opacity-80 transition-opacity whitespace-nowrap"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  CUENTAS DE PAGO
                </Link>
                <Link
                  href="/contacto"
                  className="text-black font-bold text-sm uppercase tracking-wide hover:opacity-80 transition-opacity whitespace-nowrap"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  CONTACTO
                </Link>
              </div>
              
              {/* Botón EVENTOS a la derecha */}
              <div className="flex-shrink-0">
                <Link href="/eventos">
                  <Button 
                    className="bg-[#948f30] hover:bg-[#a39d40] text-white font-bold px-4 py-1.5 rounded-lg uppercase tracking-wide transition-colors text-sm whitespace-nowrap"
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    EVENTOS
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile: Layout con botón de menú */}
            <div className="md:hidden flex items-center justify-between">
              {/* Logo a la izquierda */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="CAMIGANGA" 
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* Botón de menú naranja a la derecha */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded flex items-center justify-center transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <div className="grid grid-cols-3 gap-0.5 p-1">
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                    <div className="w-2 h-2 bg-[#948f30] rounded-sm"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Franja inferior */}
        <div className="bg-[#948f30] h-1 w-full relative"></div>
      </nav>

      {/* Menú móvil desplegable que baja desde el navbar */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-[#2C2C2C] z-40 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ top: '100%' }}
      >
        <div className={`flex flex-col space-y-4 p-6 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Opciones de menú verticales con iconos */}
          <div className="flex flex-col space-y-4 w-full">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 text-white font-bold text-base uppercase tracking-wide hover:opacity-80 transition-opacity py-2"
              style={{ fontFamily: 'sans-serif' }}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span>INICIO</span>
            </Link>
            <Link
              href="/verify"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 text-white font-bold text-base uppercase tracking-wide hover:opacity-80 transition-opacity py-2"
              style={{ fontFamily: 'sans-serif' }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>VERIFICADOR</span>
            </Link>
            <Link
              href="/contacto"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 text-white font-bold text-base uppercase tracking-wide hover:opacity-80 transition-opacity py-2"
              style={{ fontFamily: 'sans-serif' }}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span>CONTACTO</span>
            </Link>
          </div>
          
          {/* Botón COMPRAR TICKETS */}
          <div className="w-full pt-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button 
                className="w-full bg-[#948f30] hover:bg-[#a39d40] text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'sans-serif' }}
              >
                COMPRAR TICKETS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
