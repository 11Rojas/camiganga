 "use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Upload, Copy, User, CreditCard, CheckCircle, Clock, XCircle, Check, MessageCircle } from "lucide-react"
import siteConfig from "@/config/site"
import type { Raffle } from "@/lib/types"
import TicketVerifier from "@/components/TicketVerifier"

interface NewRaffleInterfaceProps {
  raffle: Raffle
  exchangeRate: number
  onRaffleChange?: (raffle: Raffle) => void
  initialEmail?: string
}

export default function NewRaffleInterface({ raffle, exchangeRate, onRaffleChange, initialEmail }: NewRaffleInterfaceProps) {
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [personalData, setPersonalData] = useState({
    names: "",
    id: "",
    phone: "",
    paymentRef: "",
    accountHolder: "",
    email: ""
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("pago-movil")
  const [showVerifier, setShowVerifier] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [searchedTicket, setSearchedTicket] = useState<{
    number: string
    status: 'available' | 'sold' | 'pending' | 'approved' | 'rejected'
    purchaseData?: any
  } | null>(null)
  const [otherRaffles, setOtherRaffles] = useState<Raffle[]>([])
  const [loadingOtherRaffles, setLoadingOtherRaffles] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successEmail, setSuccessEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailFromUrl, setEmailFromUrl] = useState<string>("")

  const totalPrice = (raffle.ticketPrice * ticketQuantity) * exchangeRate

  // Leer email de la URL y hacer scroll al componente de boletos
  useEffect(() => {
    const checkUrlForEmail = () => {
      // Verificar si hay un hash con email
      const hash = window.location.hash
      if (hash.includes('email=')) {
        const emailMatch = hash.match(/email=([^&]+)/)
        if (emailMatch) {
          const email = decodeURIComponent(emailMatch[1])
          setEmailFromUrl(email)
          
          // Hacer scroll al componente de boletos
          setTimeout(() => {
            const element = document.getElementById('tickets-page')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        }
      }
      
      // También verificar searchParams por si acaso
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email')
      if (emailParam) {
        setEmailFromUrl(emailParam)
        setTimeout(() => {
          const element = document.getElementById('tickets-page')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }

    checkUrlForEmail()
    
    // Escuchar cambios en el hash
    const handleHashChange = () => {
      checkUrlForEmail()
    }
    
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Cargar otras rifas
  useEffect(() => {
    const fetchOtherRaffles = async () => {
      try {
        setLoadingOtherRaffles(true)
        const response = await fetch("/api/raffles/active")
        if (response.ok) {
          const allRaffles = await response.json()
          // Filtrar la rifa actual y tomar las demás
          const filteredRaffles = allRaffles.filter((r: Raffle) => r._id !== raffle._id)
          setOtherRaffles(filteredRaffles.slice(0, 6)) // Máximo 6 rifas adicionales
        }
      } catch (error) {
        console.error("Error fetching other raffles:", error)
      } finally {
        setLoadingOtherRaffles(false)
      }
    }

    fetchOtherRaffles()
  }, [raffle._id])

  // Generar números de boletos disponibles basado en la rifa
  const totalTickets = raffle.totalNumbers || 100
  const soldTickets = raffle.soldNumbers || []
  const availableTickets = Array.from({ length: totalTickets }, (_, i) => i + 1)
    .filter(num => !soldTickets.includes(num))

  // Función para generar números aleatorios
  const generateRandomTickets = (quantity: number): number[] => {
    if (availableTickets.length < quantity) {
      return []
    }
    // Mezclar todos los boletos disponibles de forma aleatoria
    const shuffled = [...availableTickets].sort(() => Math.random() - 0.5)
    // Tomar los primeros N boletos de la lista mezclada
    return shuffled.slice(0, quantity).sort((a, b) => a - b)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }


  const handleSubmit = async () => {
    // Prevenir doble envío
    if (isSubmitting) {
      return
    }

    if (ticketQuantity <= 0) {
      alert("Debes seleccionar al menos un boleto")
      return
    }

    if (availableTickets.length < ticketQuantity) {
      alert(`Solo hay ${availableTickets.length} boletos disponibles`)
      return
    }

    if (!personalData.names || !personalData.id || !personalData.phone || !personalData.paymentRef || !personalData.email) {
      alert("Debes completar todos los campos obligatorios")
      return
    }

    if (!paymentProof) {
      alert("Debes subir el comprobante de pago")
      return
    }

    setIsSubmitting(true)

    // Generar números aleatorios
    const randomTickets = generateRandomTickets(ticketQuantity)

    const formData = new FormData()
    formData.append("raffleId", raffle._id)
    formData.append("quantity", ticketQuantity.toString())
    formData.append("selectedNumbers", JSON.stringify(randomTickets.map(num => num.toString().padStart(4, '0'))))
    formData.append("paymentMethod", selectedPaymentMethod)
    formData.append("paymentData", JSON.stringify({
      name: personalData.names,
      email: personalData.email,
      phone: personalData.phone,
      id: personalData.id,
      reference: personalData.paymentRef,
      accountHolder: personalData.accountHolder
    }))
    formData.append("receipt", paymentProof)

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        body: formData
      })

      // Leer el body una sola vez
      let result
      try {
        const text = await response.text()
        result = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        result = {}
      }

      // Verificar si la respuesta es exitosa (200-299)
      if (response.ok || response.status === 201) {
        setSuccessEmail(personalData.email)
        setShowSuccessModal(true)
        // Reset form
        setTicketQuantity(1)
        setPersonalData({
          names: "",
          id: "",
          phone: "",
          paymentRef: "",
          accountHolder: "",
          email: ""
        })
        setPaymentProof(null)
      } else {
        // Obtener el mensaje de error del resultado ya parseado
        const errorMessage = result.error || result.message || `Error ${response.status}: ${response.statusText}`
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al registrar la compra. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentMethods = [
    { id: "pago-movil", name: "Pago Móvil", logo: "/bancodevenezuela.png", selected: true },
  ]

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden w-full max-w-full">
      {/* Header */}
    

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 w-full overflow-x-hidden">
        <div className="space-y-6">
          {/* Raffle Info and Ticket Selection */}
          <div className="space-y-4">
            {/* Raffle Information */}
            <Card className="bg-white shadow-lg overflow-hidden">
              {/* Total Bar */}
            
              
              {/* Date Bar */}
           

              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Prize Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-full lg:w-64 h-48 rounded-lg overflow-hidden">
                      <Image
                        src={raffle.image || "/placeholder.svg"}
                        alt={raffle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Raffle Details */}
                  <div className="flex-1 space-y-3">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                         {raffle.title} 
                      </h2>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>JUEGA:</strong> {new Date(raffle.drawDate).toLocaleDateString("es-VE", { 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric",
                        timeZone: "America/Caracas"
                      })} POR EL SORTEO {new Date(raffle.drawDate).toLocaleTimeString("es-VE", { 
                        hour: "2-digit", 
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "America/Caracas"
                      })}</p>
                      
                      <div>
                        <p className="font-semibold">PREMIO PRINCIPAL:</p>
                        <pre className="whitespace-pre-wrap">{raffle.description}</pre>
                      </div>

                      <div>
                        <p className="font-semibold">VALOR DEL BOLETO:</p>
                        <p>USD ${raffle.ticketPrice.toFixed(2)} (Bs {(raffle.ticketPrice * exchangeRate).toLocaleString("es-VE")})</p>
                      </div>

                     
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Selection */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                {/* Título */}
                <h3 className="text-3xl text-[#948f30] text-center mb-6" style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>CANTIDAD DE BOLETOS</h3>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {/* Botón menos - circular gris claro */}
                  <button
                    onClick={() => {
                      if (ticketQuantity > 1) {
                        setTicketQuantity(prev => prev - 1)
                      }
                    }}
                    disabled={ticketQuantity <= 1}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold text-lg"
                  >
                    -
                  </button>

                  {/* Número central con "BOLETO" debajo */}
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-[#948f30]" style={{ fontFamily: 'sans-serif' }}>
                      {ticketQuantity}
                    </span>
                    <span className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'sans-serif' }}>BOLETO{ticketQuantity !== 1 ? 'S' : ''}</span>
                  </div>

                  {/* Botón más - circular azul oscuro */}
                  <button
                    onClick={() => {
                      if (availableTickets.length > ticketQuantity) {
                        setTicketQuantity(prev => prev + 1)
                      }
                    }}
                    disabled={availableTickets.length <= ticketQuantity}
                    className="w-10 h-10 rounded-full bg-[#948f30] hover:bg-[#a39d40] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-[#948f30]" style={{ fontFamily: 'sans-serif' }}>
                    Total: USD {(raffle.ticketPrice * ticketQuantity).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'sans-serif' }}>
                    Los números se asignarán aleatoriamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Data and Payment */}
          <div className="space-y-4">
            {/* Personal Data Form */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-[#948f30] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#948f30]">DATOS PERSONALES</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Nombres y Apellidos *
                    </Label>
                    <Input
                      value={personalData.names}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, names: e.target.value }))}
                      className="h-10 text-sm placeholder:text-white"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Cédula *
                    </Label>
                    <Input
                      value={personalData.id}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, id: e.target.value }))}
                      className="h-10 text-sm placeholder:text-white"
                      placeholder="Ingresa tu cédula"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Teléfono *
                    </Label>
                    <div className="flex items-center space-x-2">
                 
                      <Input
                        value={personalData.phone}
                        onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 h-10 text-sm placeholder:text-white"
                        placeholder="Número de teléfono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Referencia de Pago (últimos 6 dígitos) *
                    </Label>
                    <Input
                      value={personalData.paymentRef}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, paymentRef: e.target.value }))}
                      className="h-10 text-sm placeholder:text-white"
                      placeholder="Últimos 6 dígitos de la referencia"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Titular de la cuenta
                    </Label>
                    <Input
                      value={personalData.accountHolder}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, accountHolder: e.target.value }))}
                      className="h-10 text-sm placeholder:text-white"
                      placeholder="Nombre del titular de la cuenta"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 block mb-2">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-10 text-sm placeholder:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="w-5 h-5 text-[#948f30]" />
                  <h3 className="text-lg font-bold text-[#948f30]">MODOS DE PAGO</h3>
                </div>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-[#948f30] bg-[#948f30]/10"
                          : "border-gray-200 hover:border-[#948f30]/50"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <Image
                          src={method.logo}
                          alt={method.name}
                          width={50}
                          height={25}
                          className="object-contain"
                        />
                      </div>
                      <p className="text-center text-sm font-semibold text-gray-700">{method.name}</p>
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  {selectedPaymentMethod === "pago-movil" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">TELÉFONO</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-black px-2 py-1 rounded">
                          04161724994
                          </span>
                          <Button 
                            size="sm" 
                            className="w-6 h-6 rounded-full bg-[#948f30] hover:bg-[#a39d40] p-0"
                            onClick={() => copyToClipboard("04161724994")}
                          >
                            <Copy className="w-2 h-2 text-white" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">C.I</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-black px-2 py-1 rounded">
                            17589148
                          </span>
                          <Button 
                            size="sm" 
                            className="w-6 h-6 rounded-full bg-[#948f30] hover:bg-[#a39d40] p-0"
                            onClick={() => copyToClipboard("17589148")}
                          >
                            <Copy className="w-2 h-2 text-white" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">BANCO VENEZOLANO DE CREDITO</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-black px-2 py-1 rounded">
                            0104
                          </span>
                          <Button 
                            size="sm" 
                            className="w-6 h-6 rounded-full bg-[#948f30] hover:bg-[#a39d40] p-0"
                            onClick={() => copyToClipboard("0104")}
                          >
                            <Copy className="w-2 h-2 text-white" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Total Amount */}
                  <div className="bg-[#948f30] text-white p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-base">Total: Bs {totalPrice.toLocaleString("es-VE")}</span>
                      <span className="text-xs">Bolívares</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Upload className="w-5 h-5 text-[#948f30]" />
                  <h3 className="text-lg font-bold text-[#948f30]">COMPROBANTE DE PAGO</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-[#948f30] rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentProof(e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="flex flex-col items-center space-y-2 cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-[#948f30]" />
                      <div className="text-xs text-gray-600">
                        {paymentProof ? paymentProof.name : "Subir Foto/Captura de Pantalla"}
                      </div>
                    </label>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center justify-center space-x-2 ${
                      ticketQuantity > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span>{ticketQuantity > 0 ? '✓' : '○'}</span>
                      <span>Boletos: {ticketQuantity}</span>
                    </div>
                    <div className={`flex items-center justify-center space-x-2 ${
                      paymentProof ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span>{paymentProof ? '✓' : '○'}</span>
                      <span>Comprobante de pago: {paymentProof ? 'Subido' : 'Pendiente'}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 text-center">
                    Al confirmar aceptas el uso de tus datos personales.
                  </p>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || ticketQuantity <= 0 || !paymentProof}
                    className="w-full h-10 text-base font-bold rounded-lg bg-[#948f30] hover:bg-[#a39d40] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "PROCESANDO..." : "CONFIRMAR COMPRA"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ticket Verifier */}
        <div id="tickets-page" className="mt-6 scroll-mt-20">
          <TicketVerifier raffleId={raffle._id} initialEmail={initialEmail || emailFromUrl} />
        </div>
      </main>

      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-xl">
          <div className="text-center py-6 px-6">
            {/* Icono circular con checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#948f30] flex items-center justify-center">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-4xl font-bold text-[#333333] mb-6" style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>
              Boletos registrados correctamente!
            </h2>

            {/* Información del evento */}
            <div className="mb-8">
              <p className="text-lg text-[#333333] leading-relaxed" style={{ fontFamily: 'sans-serif' }}>
                El evento se transmitirá el día{" "}
                <span className="font-semibold">
                  {new Date(raffle.drawDate).toLocaleDateString("es-VE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "America/Caracas"
                  }).toUpperCase().replace(/\./g, "")}
                </span>
                {" a las "}
                <span className="font-semibold">
                  {new Date(raffle.drawDate).toLocaleTimeString("es-VE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "America/Caracas"
                  }).toUpperCase()}
                </span>
              </p>
              <p className="text-lg text-[#333333] mt-2" style={{ fontFamily: 'sans-serif' }}>
                Por los Resultados de Camiganga
              </p>
            </div>

            {/* Botón */}
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                // Actualizar el hash con el email
                window.location.hash = `tickets-page?email=${encodeURIComponent(successEmail)}`
                // Establecer el email en el estado para que se pase al TicketVerifier
                setEmailFromUrl(successEmail)
                // Hacer scroll al componente de boletos
                setTimeout(() => {
                  const element = document.getElementById('tickets-page')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
              className="w-full h-14 bg-[#948f30] hover:bg-[#a39d40] text-white text-xl font-bold rounded-full px-8 shadow-md"
              style={{ fontFamily: 'sans-serif', fontWeight: 900 }}
            >
              VER MIS BOLETOS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Info Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="max-w-md p-0 bg-white border-0 shadow-lg overflow-y-auto max-h-[90vh] [&>button]:hidden">
          <style dangerouslySetInnerHTML={{__html: `
                #ticketsContain * {
                  -webkit-font-smoothing: antialiased;
                  box-sizing: border-box;
                }
                #ticketsContain .container_ticket {
                  max-width: 320px;
                  margin: 0 auto;
                }
                #ticketsContain .--flex-column {
                  display: flex;
                  flex-direction: column;
                }
                #ticketsContain .--flex-row-j\\!sb {
                  display: flex;
                  flex-direction: row;
                  justify-content: space-between;
                }
                #ticketsContain .ticket-widget {
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                  position: relative;
                }
                #ticketsContain .top {
                  position: relative;
                  padding: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                }
                #ticketsContain .buy, #ticketsContain .status {
                  position: absolute;
                  top: 15px;
                  width: 35px;
                  height: 35px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  background: rgba(255,255,255,0.2);
                  backdrop-filter: blur(10px);
                }
                #ticketsContain .buy {
                  right: 15px;
                }
                #ticketsContain .status {
                  right: 60px;
                }
                #ticketsContain .status.pending {
                  background: rgba(255,193,7,0.3);
                }
                #ticketsContain .status.approved {
                  background: rgba(40,167,69,0.3);
                }
                #ticketsContain .status.rejected {
                  background: rgba(220,53,69,0.3);
                }
                #ticketsContain .bandname {
                  text-align: center;
                  margin: 20px 0;
                  font-weight: bold;
                  font-size: 16px;
                  color: white;
                }
                #ticketsContain .bandname img {
                  margin-bottom: 10px;
                  border-radius: 8px;
                }
                #ticketsContain .tourname {
                  text-align: center;
                  font-size: 24px;
                  font-weight: bold;
                  margin: 15px 0;
                  color: #ffc107;
                }
                #ticketsContain .imagenfondo {
                  position: relative;
                  width: 100%;
                  height: 200px;
                  margin: 15px 0;
                  border-radius: 8px;
                  overflow: hidden;
                }
                #ticketsContain .imagenfondo img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
                #ticketsContain .nombres {
                  position: absolute;
                  bottom: 20px;
                  left: 20px;
                  right: 20px;
                  background: rgba(0,0,0,0.7);
                  backdrop-filter: blur(10px);
                  padding: 12px;
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  font-size: 12px;
                }
                #ticketsContain .nombres span {
                  color: white;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                #ticketsContain .ticket_status {
                  font-weight: bold;
                }
                #ticketsContain .ticket_status.pending {
                  color: #ffc107;
                }
                #ticketsContain .ticket_status.approved {
                  color: #28a745;
                }
                #ticketsContain .ticket_status.rejected {
                  color: #dc3545;
                }
                #ticketsContain .deetz {
                  margin-top: 15px;
                  padding: 15px;
                  background: rgba(255,255,255,0.1);
                  border-radius: 8px;
                }
                #ticketsContain .ticket-date {
                  text-align: center;
                }
                #ticketsContain .date, #ticketsContain .cost {
                  font-size: 18px;
                  font-weight: bold;
                  color: white;
                }
                #ticketsContain .rip {
                  height: 20px;
                  background: 
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      #ddd 10px,
                      #ddd 20px
                    );
                  position: relative;
                }
                #ticketsContain .rip::before,
                #ticketsContain .rip::after {
                  content: '';
                  position: absolute;
                  width: 20px;
                  height: 20px;
                  background: white;
                  border-radius: 50%;
                  top: -10px;
                }
                #ticketsContain .rip::before {
                  left: -10px;
                }
                #ticketsContain .rip::after {
                  right: -10px;
                }
                #ticketsContain .bottom {
                  padding: 20px;
                  background: white;
                  text-align: center;
                }
                #ticketsContain .bottom strong {
                  font-size: 32px;
                  color: #333;
                  font-weight: bold;
                }
              `}} />
          {searchedTicket && (
            <div id="ticketsContain" className="p-4">
              <div className="container_ticket">
                <div id={`widgetTicketDownload-${searchedTicket.number}`} className="ticket-widget --flex-column">
                  <div className="top --flex-column container_banner">
                    <div className="buy" title="BOLETO DIGITAL">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className={`status ${searchedTicket.status}`} title={
                      searchedTicket.status === 'pending' ? 'Verificación Pendiente' :
                      searchedTicket.status === 'approved' ? 'Verificación Aprobada' :
                      searchedTicket.status === 'rejected' ? 'Verificación Rechazada' :
                      'Disponible'
                    }>
                      {searchedTicket.status === 'pending' && <Clock className="w-4 h-4" />}
                      {searchedTicket.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                      {searchedTicket.status === 'rejected' && <XCircle className="w-4 h-4" />}
                      {searchedTicket.status === 'available' && <CheckCircle className="w-4 h-4" />}
                    </div>
                    
                    <div className="bandname -bold">
                      <Image 
                        src="/logo.png" 
                        alt="Logo" 
                        width={55} 
                        height={55}
                        className="rounded-lg"
                      />
                      <br />
                      Camiganga<br />
                    </div>
                    
                    <div className="tourname">{raffle.title.toUpperCase()}</div>
                    
                    <div className="imagenfondo">
                      <Image 
                        src={raffle.image || "/placeholder.svg"} 
                        alt="Banner" 
                        width={280} 
                        height={330}
                        className="object-cover"
                      />
                      
                      {searchedTicket.purchaseData && (
                        <div id="nombres" className="nombres">
                          <span className={`ticket_status ${searchedTicket.status}`}>
                            {searchedTicket.status === 'pending' && <Clock className="w-3 h-3" />}
                            {searchedTicket.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {searchedTicket.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {searchedTicket.status === 'pending' ? 'Verificación Pendiente' :
                             searchedTicket.status === 'approved' ? 'Verificación Aprobada' :
                             searchedTicket.status === 'rejected' ? 'Verificación Rechazada' :
                             'Disponible'}
                          </span>
                          <span>
                            <User className="w-3 h-3" />
                            Táchira
                          </span>
                          <span>
                            <User className="w-3 h-3" />
                            {searchedTicket.purchaseData.name ? 
                              (searchedTicket.purchaseData.name.length > 15 ? 
                                searchedTicket.purchaseData.name.substring(0, 15) + '...' : 
                                searchedTicket.purchaseData.name) : 
                              'N/A'}
                          </span>
                          <span>
                            <MessageCircle className="w-3 h-3" />
                            +58 {searchedTicket.purchaseData.phone ? 
                              searchedTicket.purchaseData.phone.substring(0, 4) + '****' + 
                              searchedTicket.purchaseData.phone.substring(searchedTicket.purchaseData.phone.length - 2) : 
                              'N/A'}
                          </span>
                          <span>
                            <Clock className="w-3 h-3" />
                            {searchedTicket.purchaseData.createdAt ? 
                              new Date(searchedTicket.purchaseData.createdAt).toLocaleString('es-VE', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZone: 'America/Caracas'
                              }) : 
                              'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="deetz --flex-row-j!sb">
                      <div className="ticket-date event --flex-column">
                        <div className="date -bold">
                          {new Date(raffle.drawDate).toLocaleDateString("es-VE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "America/Caracas"
                          }).toUpperCase().replace(/\./g, "")}
                        </div>
                      </div>
                      <div className="ticket-date --flex-column">
                        <div className="cost -bold">
                          {new Date(raffle.drawDate).toLocaleTimeString("es-VE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "America/Caracas"
                          }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rip"></div>
                  
                  <div className="bottom --flex-row-j!sb">
                    <strong style={{fontSize: '22px'}}>
                      <b>{searchedTicket.number}</b>
                    </strong>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Otras Rifas Section */}
      {otherRaffles.length > 0 && (
        <section className="bg-white py-12 mt-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Otras Rifas</h2>
              <p className="text-gray-600">Descubre más oportunidades de ganar</p>
            </div>
            
            {loadingOtherRaffles ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando otras rifas...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherRaffles.map((otherRaffle) => (
                  <div key={otherRaffle._id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 w-full">
                      <Image
                        src={otherRaffle.image || "/placeholder.svg"}
                        alt={otherRaffle.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" style={{ backgroundColor: '#10b981', color: 'white', fontSize: '0.75rem' }}>
                          Activa
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {otherRaffle.title}
                      </h3>
                      <pre className="text-gray-600 text-sm mb-3 line-clamp-2 whitespace-pre-wrap font-sans">
                        {otherRaffle.description}
                      </pre>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Precio:</span>
                          <span className="font-semibold text-[#948f30]">
                            ${otherRaffle.ticketPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      
                      <button
                        onClick={() => {
                          if (onRaffleChange) {
                            onRaffleChange(otherRaffle)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                        className="w-full bg-[#948f30] hover:bg-[#a39d40] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer with Associated Raffles */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center space-x-8">
              <div className="flex items-center justify-center">
                <Image
                  src="/1.png"
                  alt="Rifa Asociada 1"
                  width={80}
                  height={60}
                  className="object-contain hover:opacity-80 transition-opacity"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/2.png"
                  alt="Rifa Asociada 2"
                  width={80}
                  height={60}
                  className="object-contain hover:opacity-80 transition-opacity"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/3.png"
                  alt="Rifa Asociada 3"
                  width={80}
                  height={60}
                  className="object-contain hover:opacity-80 transition-opacity"
                />
              </div>
            </div>
            
            {/* TikTok Section */}
            <div className="mt-8 flex justify-center">
              <a
                href="https://www.tiktok.com/@Rifascamiganga10"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 bg-black rounded-full hover:bg-gray-800 transition-colors"
                title="Síguenos en TikTok"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Contactar por WhatsApp"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
      </div>
    </div>
  )
}


