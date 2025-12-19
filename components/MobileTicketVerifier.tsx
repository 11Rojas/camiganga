"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Ticket, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  _id: string
  raffleId: {
    _id: string
    title: string
    description: string
    image?: string
    drawDate: string
    status: string
  }
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  paymentData: {
    name: string
    email: string
    phone: string
    reference: string
  }
}

export default function MobileTicketVerifier() {
  const [email, setEmail] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Por favor ingresa tu email")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/tickets/verify?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Error al buscar tickets")
      }
      
      setTickets(data.tickets || [])
      setIsModalOpen(true)
      
      if (data.tickets.length === 0) {
        toast.info("No se encontraron tickets para este email")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Error al buscar tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Confirmado"
      case "pending":
        return "Pendiente por confirmar"
      case "rejected":
        return "Rechazado"
      default:
        return "Desconocido"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Caracas"
    })
  }

  const formatDrawDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Caracas"
    })
  }

  return (
    <>
      {/* Solo visible en móvil */}
      <div className="md:hidden mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Verificar Mis Tickets</h3>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <Label htmlFor="mobile-email" className="text-white text-sm">
              Ingresa tu email
            </Label>
            <Input
              id="mobile-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mt-1"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Buscando..." : "Verificar Tickets"}
          </Button>
        </form>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Ticket className="h-6 w-6 text-yellow-500" />
              Mis Tickets
            </DialogTitle>
          </DialogHeader>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No se encontraron tickets para este email</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket._id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">
                          {ticket.raffleId.title}
                        </CardTitle>
                        <pre className="text-sm text-gray-400 mt-1 whitespace-pre-wrap font-sans">
                          {ticket.raffleId.description}
                        </pre>
                      </div>
                      <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="font-semibold text-yellow-500 mb-2">Números asignados:</h4>
                        <div className="flex flex-wrap gap-2">
                          {ticket.numbers.map((number, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-yellow-500 text-black border-yellow-500"
                            >
                              {number}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm">
                            Estado: <strong>{getStatusText(ticket.status)}</strong>
                          </span>
                        </div>
                        <p className="text-sm">
                          <strong>Monto:</strong> Bs {ticket.totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm">
                          <strong>Método:</strong> {ticket.paymentMethod.toUpperCase()}
                        </p>
                        <p className="text-sm">
                          <strong>Referencia:</strong> {ticket.paymentData.reference}
                        </p>
                        <p className="text-sm">
                          <strong>Fecha de compra:</strong> {formatDate(ticket.createdAt)}
                        </p>
                        <p className="text-sm">
                          <strong>Fecha del sorteo:</strong> {formatDrawDate(ticket.raffleId.drawDate)}
                        </p>
                      </div>
                    </div>
                    
                    {ticket.status === "pending" && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm">
                          <strong>⏳ Pendiente de confirmación:</strong> Tu pago está siendo verificado. 
                          Recibirás tus números asignados por WhatsApp una vez confirmado el pago.
                        </p>
                      </div>
                    )}
                    
                    {ticket.status === "approved" && (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-200 text-sm">
                          <strong>✅ Pago confirmado:</strong> Tu compra ha sido verificada y tus números han sido asignados.
                        </p>
                      </div>
                    )}
                    
                    {ticket.status === "rejected" && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-200 text-sm">
                          <strong>❌ Pago rechazado:</strong> Tu pago no pudo ser verificado. 
                          Por favor contacta con soporte si crees que esto es un error.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
