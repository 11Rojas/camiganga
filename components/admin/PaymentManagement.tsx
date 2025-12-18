"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye, Search, Download, ExternalLink , Trash2} from "lucide-react"

interface Purchase {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  raffleId: {
    _id: string
    title: string
    image?: string
    drawDate: string
  }
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  paymentData: {
    email?: string
    phone?: string
    reference: string
    receipt?: string
    notes?: string
  }
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export default function PaymentManagement() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases")
      const data = await response.json()
      setPurchases(data || [])
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/purchases/${id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPurchases()
        alert("Pago aprobado correctamente")
      } else {
        alert("Error al aprobar el pago")
      }
    } catch (error) {
      console.error("Error approving purchase:", error)
      alert("Error al aprobar el pago")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta compra? Los números asociados volverán a estar disponibles.")) return
  
    try {
      const response = await fetch(`/api/purchases/delete/${id}`, {
        method: "DELETE",
      })
  
      if (response.ok) {
        fetchPurchases()
        alert("Compra eliminada correctamente")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al eliminar la compra")
      }
    } catch (error) {
      console.error("Error deleting purchase:", error)
      alert("Error al eliminar la compra")
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres rechazar este pago?")) return

    try {
      const response = await fetch(`/api/purchases/${id}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPurchases()
        alert("Pago rechazado correctamente")
      } else {
        alert("Error al rechazar el pago")
      }
    } catch (error) {
      console.error("Error rejecting purchase:", error)
      alert("Error al rechazar el pago")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-black text-xs sm:text-sm">Pendiente</Badge>
      case "approved":
        return <Badge className="bg-green-500 text-white text-xs sm:text-sm">Aprobado</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white text-xs sm:text-sm">Rechazado</Badge>
      default:
        return <Badge className="bg-gray-500 text-white text-xs sm:text-sm">Desconocido</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      zelle: "bg-blue-500",
      "pago-movil": "bg-green-500",
      "pago-movil2": "bg-green-500",
      "mercado-pago": "bg-purple-500",
    }
    const displayName = method === "pago-movil2" ? "Pago Móvil" : method
    return <Badge className={`${colors[method as keyof typeof colors]} text-white text-xs sm:text-sm`}>{displayName}</Badge>
  }
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesStatusFilter = filter === "all" || purchase.status === filter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || 
      purchase.paymentMethod === paymentMethodFilter ||
      (paymentMethodFilter === "pago-movil" && purchase.paymentMethod === "pago-movil2");
    
    // Normalizar los números a ambos formatos para búsqueda
    const numbersAsString = purchase.numbers.map(num => {
      const numStr = num.toString();
      return `${numStr} ${numStr.padStart(4, '0')}`; // Incluye ambos formatos
    }).join(' ');
    
    // Normalizar el término de búsqueda (quitar ceros iniciales para coincidencias)
    const normalizedSearchTerm = searchTerm.replace(/^0+/, '') || searchTerm;
    
    const matchesSearch =
      purchase.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.paymentData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.paymentData.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      numbersAsString.toLowerCase().includes(searchTerm.toLowerCase()) || // Búsqueda exacta
      purchase.numbers.some(num => {
        const numStr = num.toString();
        return (
          numStr === normalizedSearchTerm || 
          numStr.padStart(4, '0') === searchTerm
        );
      });
    
    return matchesStatusFilter && matchesPaymentMethod && (searchTerm === '' || matchesSearch);
});

  const stats = {
    pending: purchases.filter((p) => p.status === "pending").length,
    approved: purchases.filter((p) => p.status === "approved").length,
    rejected: purchases.filter((p) => p.status === "rejected").length,
    totalToday: purchases
      .filter((p) => {
        const today = new Date().toDateString()
        return new Date(p.createdAt).toDateString() === today && p.status === "approved"
      })
      .reduce((sum, p) => sum + p.totalAmount, 0),
  }

  if (loading) {
    return <div className="text-gray-800 text-center">Cargando...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Pagos</h1>
          <p className="text-sm sm:text-base text-gray-600">Administra y aprueba los pagos de las rifas</p>
        </div>
      
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-gray-600">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">{stats.approved}</div>
              <div className="text-xs sm:text-sm text-gray-600">Aprobados</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-400">{stats.rejected}</div>
              <div className="text-xs sm:text-sm text-gray-600">Rechazados</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-800">${stats.totalToday.toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Hoy</div>
            </div>
          </CardContent>
        </Card>
          {/* Métodos de pago */}
          <Card 
          className={`bg-white border-gray-200 shadow-sm cursor-pointer ${paymentMethodFilter === "all" ? "border-blue-500" : ""}`}
          onClick={() => setPaymentMethodFilter("all")}
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">Todos</div>
            <div className="text-xs sm:text-sm text-gray-600">Métodos</div>
          </CardContent>
        </Card>
            
        
        <Card 
          className={`bg-white border-gray-200 shadow-sm cursor-pointer ${paymentMethodFilter === "zelle" ? "border-blue-500" : ""}`}
          onClick={() => setPaymentMethodFilter("zelle")}
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Zelle_logo.svg" 
              alt="Zelle" 
              width={40} 
              height={40} 
              className="h-8 w-auto object-contain"
            />
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Zelle</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`bg-white border-gray-200 shadow-sm cursor-pointer ${paymentMethodFilter === "pago-movil" ? "border-blue-500" : ""}`}
          onClick={() => setPaymentMethodFilter("pago-movil")}
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center">
            <img
              src="https://images.seeklogo.com/logo-png/53/1/bdv-banco-de-venezuela-logo-png_seeklogo-534119.png" 
              alt="Pago Móvil" 
              width={40} 
              height={40} 
              className="h-8 w-auto object-contain"
            />
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Pago Móvil</div>
          </CardContent>
        </Card>
        
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
  placeholder="Buscar por usuario, email, referencia o número..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-8 sm:pl-10 bg-white border-gray-300 text-gray-800 text-sm sm:text-base"
/>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={`text-xs sm:text-sm ${filter === "all" ? "btn-gold" : "btn-gold-outline"}`}
              >
                Todos
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className={`text-xs sm:text-sm ${filter === "pending" ? "bg-yellow-500 text-black" : "border-yellow-500 text-yellow-500"}`}
              >
                Pendientes
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                className={`text-xs sm:text-sm ${filter === "approved" ? "bg-green-500 text-white" : "border-green-500 text-green-500"}`}
              >
                Aprobados
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                className={`text-xs sm:text-sm ${filter === "rejected" ? "bg-red-500 text-white" : "border-red-500 text-red-500"}`}
              >
                Rechazados
              </Button>
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase._id} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">{purchase.userId?.name || 'Usuario desconocido'}</h3>
                    {getStatusBadge(purchase.status)}
                    {getMethodBadge(purchase.paymentMethod)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="text-gray-800 break-all">{purchase.paymentData.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rifa:</span>
                      <p className="text-gray-800">{purchase.raffleId?.title || "Desconocido"}</p>
                    </div>
                    <div className="relative group">
  <span className="text-gray-400">Números:</span>
  {purchase.numbers.length > 5 ? (
    <>
      <p className="text-yellow-400 inline-flex items-center cursor-help">
        {purchase.numbers.slice(0, 5).map(num => num.toString().padStart(4, '0')).join(", ")}
        <span className="ml-1 bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded text-xs">
          +{purchase.numbers.length - 5}
        </span>
      </p>
      {/* Tooltip con scroll y paginación */}
      <div className="absolute z-50 hidden group-hover:flex flex-col bg-gray-800 p-3 rounded-lg border border-yellow-400/30 shadow-xl w-full max-w-md max-h-64 mt-1 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-yellow-400">Números comprados ({purchase.numbers.length})</h4>
          <span className="text-xs text-gray-400">
            {purchase.numbers.length} total
          </span>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-1 p-1">
          {purchase.numbers.map(num => (
            <span 
              key={num} 
              className="inline-flex items-center justify-center min-w-[2rem] px-1 py-0.5 text-xs font-medium rounded bg-gray-700 text-yellow-400 border border-yellow-400/20"
            >
              {num.toString().padStart(4, '0')}
            </span>
          ))}
        </div>
        <div className="pt-2 mt-2 border-t border-gray-700 text-xs text-gray-400">
          Desplázate para ver todos los números
        </div>
      </div>
    </>
  ) : (
    <p className="text-yellow-400">
      {purchase.numbers.map(num => num.toString().padStart(4, '0')).join(", ")}
    </p>
  )}
</div>
                    <div>
                      <span className="text-gray-600">Monto:</span>
                      <p className="text-gray-800 font-bold">${purchase.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Referencia:</span>
                      <p className="text-gray-800 break-all">{purchase.paymentData.reference}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="text-gray-800">{new Date(purchase.createdAt).toLocaleString("es-VE")}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:space-x-2 sm:ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPurchase(purchase)
                      setShowDetailModal(true)
                    }}
                    className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white bg-transparent text-xs sm:text-sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
  size="sm"
  onClick={() => handleDelete(purchase._id)}
  className="bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm"
>
  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
</Button>
                  {purchase.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(purchase._id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(purchase._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>

                    </>
                  )}
                  
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border-yellow-400/20 mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-base sm:text-lg">Detalles del Pago</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">Información del Usuario</h4>
                  <p className="text-white text-sm sm:text-base">
                    <strong>Nombre:</strong> {selectedPurchase.userId?.name || 'Usuario desconocido'}
                  </p>
                  <p className="text-white text-sm sm:text-base break-all">
                    <strong>Email:</strong> {selectedPurchase.paymentData.email}
                  </p>
                </div>
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">Información de la Rifa</h4>
                  <p className="text-white text-sm sm:text-base">
                    <strong>Rifa:</strong> {selectedPurchase.raffleId.title}
                  </p>
                  <div className="absolute z-50 hidden group-hover:flex flex-col bg-gray-800 p-3 rounded-lg border border-yellow-400/30 shadow-xl w-full max-w-md max-h-64 mt-1 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-yellow-400">Números comprados ({selectedPurchase.numbers.length})</h4>
          <span className="text-xs text-gray-400">
            {selectedPurchase.numbers.length} total
          </span>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-1 p-1">
          {selectedPurchase.numbers.map(num => (
            <span 
              key={num} 
              className="inline-flex items-center justify-center min-w-[2rem] px-1 py-0.5 text-xs font-medium rounded bg-gray-700 text-yellow-400 border border-yellow-400/20"
            >
              {num}
            </span>
          ))}
        </div>
        <div className="pt-2 mt-2 border-t border-gray-700 text-xs text-gray-400">
          Desplázate para ver todos los números
        </div>
      </div>
                  <p className="text-white text-sm sm:text-base">
                    <strong>Total:</strong> ${selectedPurchase.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">Información del Pago</h4>
                <p className="text-gray-800 text-sm sm:text-base">
                  <strong>Método:</strong> {selectedPurchase.paymentMethod === "pago-movil2" ? "Pago Móvil" : selectedPurchase.paymentMethod}
                </p>
                <p className="text-gray-800 text-sm sm:text-base break-all">
                  <strong>Referencia:</strong> {selectedPurchase.paymentData.reference}
                </p>
                {selectedPurchase.paymentData.email && (
                  <p className="text-white text-sm sm:text-base break-all">
                    <strong>Email de pago:</strong> {selectedPurchase.paymentData.email}
                  </p>
                )}
                {selectedPurchase.paymentData.phone && (
                  <p className="text-white text-sm sm:text-base">
                    <strong>Teléfono:</strong> {selectedPurchase.paymentData.phone}
                  </p>
                )}
                {selectedPurchase.paymentData.notes && (
                  <p className="text-white text-sm sm:text-base">
                    <strong>Notas:</strong> {selectedPurchase.paymentData.notes}
                  </p>
                )}
              </div>

              {selectedPurchase.paymentData.receipt && (
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">Comprobante</h4>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedPurchase.paymentData.receipt, "_blank")}
                    className="btn-gold-outline text-sm sm:text-base"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Ver Comprobante
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3 pt-3 sm:pt-4">
                {selectedPurchase.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedPurchase._id)
                        setShowDetailModal(false)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base"
                    >
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => {
                        handleReject(selectedPurchase._id)
                        setShowDetailModal(false)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base"
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="btn-gold-outline text-sm sm:text-base">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
