import { Globe, MapPin, Send } from "lucide-react"
import Link from "next/link"
import siteConfig from "@/config/site"

export default function Footer() {
  return (
    <footer className="bg-[#948f30] text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold uppercase mb-2" style={{ fontFamily: 'sans-serif' }}>
            RIFAS CAMIGANGA
          </h2>
          <p className="text-lg uppercase" style={{ fontFamily: 'sans-serif' }}>
            RIFAS CAMIGANGA
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SECCIONES */}
          <div>
            <h3 className="text-xl font-bold uppercase mb-4" style={{ fontFamily: 'sans-serif' }}>
              SECCIONES
            </h3>
            <div className="space-y-3" style={{ fontFamily: 'sans-serif' }}>
              <Link 
                href="/" 
                className="block text-white hover:opacity-80 transition-opacity"
              >
                Inicio
              </Link>
              <Link 
                href="/tickets" 
                className="block text-white hover:opacity-80 transition-opacity"
              >
                Lista de Tickets
              </Link>
              <Link 
                href="/verify" 
                className="block text-white hover:opacity-80 transition-opacity"
              >
                Verificar mis Tickets
              </Link>
            </div>
          </div>

          {/* CONTACTO */}
          <div>
            <h3 className="text-xl font-bold uppercase mb-4" style={{ fontFamily: 'sans-serif' }}>
              CONTACTO
            </h3>
            <div className="space-y-3" style={{ fontFamily: 'sans-serif' }}>
              <div className="flex items-center gap-3 text-white">
                <Globe className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span>www.rifascamiganga.com</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Send className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span>04161724994</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
