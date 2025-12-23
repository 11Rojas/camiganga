"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar, DollarSign, Trophy, Users, ImageIcon, Eye, Ticket } from "lucide-react"
interface Raffle {
  _id: string
  title: string
  description: string
  image?: string
  ticketPrice: number
  totalNumbers: number
  soldNumbers: number[]
  drawDate: string
  status: "active" | "completed" | "cancelled"
  winner?: {
    userId: string
    userName: string
    userEmail: string
    winningNumber: number
  }
  createdAt: string
  updatedAt: string
}

export default function RaffleManagement() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null)
  const [winnerEmail, setWinnerEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showNumbersModal, setShowNumbersModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
const [number, setNumber] = useState<number>(0);
  const itemsPerPage = 100 // Ajusta según necesidad

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ticketPrice: "",
    totalNumbers: "",
    drawDate: "",
    initialProgress: "0",
    image: ""
  })

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch("/api/raffles")
      const data = await response.json()
      setRaffles(data.raffles || [])
    } catch (error) {
      console.error("Error fetching raffles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingImage(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('ticketPrice', formData.ticketPrice)
      formDataToSend.append('totalNumbers', formData.totalNumbers)
      formDataToSend.append('drawDate', formData.drawDate)
      formDataToSend.append('initialProgress', formData.initialProgress)
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }
      if (editingRaffle?.image) {
        formDataToSend.append('currentImage', editingRaffle.image)
      }

      const url = editingRaffle ? `/api/raffles/${editingRaffle._id}` : "/api/raffles"
      const method = editingRaffle ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (response.ok) {
        fetchRaffles()
        resetForm()
        alert(editingRaffle ? "Rifa actualizada correctamente" : "Rifa creada correctamente")
      } else {
        alert("Error al guardar la rifa")
      }
    } catch (error) {
      console.error("Error saving raffle:", error)
      alert("Error al guardar la rifa")
    } finally {
      setUploadingImage(false)
    }
  }

 
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta rifa?")) return

    try {
      const response = await fetch(`/api/raffles/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchRaffles()
        alert("Rifa eliminada correctamente")
      } else {
        alert("Error al eliminar la rifa")
      }
    } catch (error) {
      console.error("Error deleting raffle:", error)
      alert("Error al eliminar la rifa")
    }
  }

  const handleSelectWinner = async () => {
    if (!selectedRaffle || !number) return

    try {
      const response = await fetch(`/api/raffles/${selectedRaffle._id}/winner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({  number }),
      })

      if (response.ok) {
        fetchRaffles()
        setShowWinnerModal(false)
        setWinnerEmail("")
      
        setSelectedRaffle(null)
        alert("Ganador seleccionado correctamente")
      } else {
        alert("Error al seleccionar el ganador")
      }
    } catch (error) {
      console.error("Error selecting winner:", error)
      alert("Error al seleccionar el ganador")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      ticketPrice: "",
      totalNumbers: "",
      drawDate: "",
      initialProgress: "0",
      image: ""
    })
    setImageFile(null)
    setImagePreview(null)
    setEditingRaffle(null)
    setShowCreateForm(false)
  }

  const startEdit = (raffle: Raffle) => {
    setEditingRaffle(raffle)
    
    // Convertir la fecha de UTC a hora local de Venezuela (UTC-4)
    // La fecha viene en UTC de la base de datos, necesitamos restar 4 horas
    const utcDate = new Date(raffle.drawDate)
    // Restar 4 horas (4 * 60 * 60 * 1000 milisegundos)
    const venezuelaTime = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000))
    
    // Formatear para datetime-local (YYYY-MM-DDTHH:mm) usando los valores UTC de la fecha ajustada
    const year = venezuelaTime.getUTCFullYear()
    const month = String(venezuelaTime.getUTCMonth() + 1).padStart(2, '0')
    const day = String(venezuelaTime.getUTCDate()).padStart(2, '0')
    const hours = String(venezuelaTime.getUTCHours()).padStart(2, '0')
    const minutes = String(venezuelaTime.getUTCMinutes()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`
    
    setFormData({
      title: raffle.title,
      description: raffle.description,
      ticketPrice: raffle.ticketPrice.toString(),
      totalNumbers: raffle.totalNumbers.toString(),
      drawDate: formattedDate,
      initialProgress: (raffle.initialProgress || 0).toString(),
      image: raffle.image || ""
    })
    setShowCreateForm(true)
  }

  if (loading) {
    return <div className="text-white text-center">Cargando...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Rifas</h1>
          <p className="text-sm sm:text-base text-gray-600">Administra todas las rifas del sistema</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="btn-gold text-sm sm:text-base">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Nueva Rifa
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white text-base sm:text-lg">{editingRaffle ? "Editar Rifa" : "Crear Nueva Rifa"}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="title" className="text-black text-sm sm:text-base font-semibold">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base"
                    placeholder="Ingresa el título de la rifa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPrice" className="text-black text-sm sm:text-base font-semibold">
                    Precio por Número (Bs)
                  </Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-black text-sm sm:text-base font-semibold">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base min-h-[120px] resize-y"
                  placeholder="Descripción de la rifa (los espacios y saltos de línea se preservarán)"
                  required
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="totalNumbers" className="text-black text-sm sm:text-base font-semibold">
                    Total de Números
                  </Label>
                  <Input
                    id="totalNumbers"
                    type="number"
                    value={formData.totalNumbers}
                    onChange={(e) => setFormData({ ...formData, totalNumbers: e.target.value })}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="initialProgress" className="text-black text-sm sm:text-base font-semibold">
                    Porcentaje Inicial (%)
                  </Label>
                  <Input
                    id="initialProgress"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.initialProgress}
                    onChange={(e) => setFormData({ ...formData, initialProgress: e.target.value })}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="drawDate" className="text-black text-sm sm:text-base font-semibold">
                    Fecha del Sorteo
                  </Label>
                  <Input
                    id="drawDate"
                    type="datetime-local"
                    value={formData.drawDate}
                    onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="text-black text-sm sm:text-base font-semibold">
                  Imagen de la Rifa
                </Label>
                <div className="flex items-center gap-3 mt-1">
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50 text-sm text-black"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {imageFile ? imageFile.name : "Seleccionar imagen"}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {uploadingImage && (
                    <span className="text-yellow-400 text-sm">Subiendo imagen...</span>
                  )}
                </div>
                {(imagePreview || formData.image) && (
                  <div className="mt-3">
                    <img
                      src={imagePreview || formData.image || ""}
                      alt="Vista previa"
                      className="h-40 object-contain rounded-md border border-gray-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                <Button type="submit" className="btn-gold text-sm sm:text-base">
                  {editingRaffle ? "Actualizar Rifa" : "Crear Rifa"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="btn-gold-outline bg-transparent text-sm sm:text-base">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rifas List */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle._id} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{raffle.title}</h3>
                    <Badge
                      className={`text-xs sm:text-sm ${
                        raffle.status === "active"
                          ? "bg-green-500"
                          : raffle.status === "completed"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      } text-white`}
                    >
                      {raffle.status === "active"
                        ? "Activa"
                        : raffle.status === "completed"
                          ? "Completada"
                          : "Cancelada"}
                    </Badge>
                  </div>

                  <pre className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base whitespace-pre-wrap font-sans">{raffle.description}</pre>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center text-xs sm:text-sm">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                      <span className="text-gray-700">Precio: Bs {raffle.ticketPrice.toLocaleString("es-VE")}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                      <span className="text-gray-700">
                        Vendidos: {raffle.soldNumbers?.length || 0}/{raffle.totalNumbers}
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                      <span className="text-gray-700">{new Date(raffle.drawDate).toLocaleDateString("es-VE", { timeZone: "America/Caracas" })}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <span className="text-blue-600 font-bold">
                        Ingresos: Bs {((raffle.soldNumbers?.length || 0) * raffle.ticketPrice).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Winner Info */}
                  {raffle.winner && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                      <div className="flex items-center text-green-400 mb-2">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-semibold text-sm sm:text-base">Ganador</span>
                      </div>
                      <p className="text-white text-xs sm:text-sm">
                        <strong>{raffle.winner.userName}</strong> ({raffle.winner.userEmail})
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-1">
                      <span>Progreso de venta</span>
                      <span>{Math.max((((raffle.soldNumbers?.length || 0) / raffle.totalNumbers) * 100), (raffle.initialProgress || 0)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 sm:h-2 rounded-full"
                        style={{
                          width: `${Math.max((((raffle.soldNumbers?.length || 0) / raffle.totalNumbers) * 100), (raffle.initialProgress || 0))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col gap-2 sm:space-y-2 sm:ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(raffle)}
                    className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent text-xs sm:text-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  {raffle.status === "active" && !raffle.winner && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRaffle(raffle)
                        setShowWinnerModal(true)
                      }}
                      className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white bg-transparent text-xs sm:text-sm"
                    >
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(raffle._id)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white bg-transparent text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
  size="sm"
  variant="outline"
  onClick={() => {
    setSelectedRaffle(raffle)
    setShowNumbersModal(true)
  }}
  className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white bg-transparent text-xs sm:text-sm"
>
  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

{/* Numbers Visualization Modal - Compact with Pagination */}
<Dialog open={showNumbersModal} onOpenChange={setShowNumbersModal}>
  <DialogContent className="bg-gray-900 border-yellow-400/20 max-w-4xl mx-4 p-0 h-[80vh] flex flex-col">
    <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-700">
      <DialogTitle className="text-white text-lg flex items-center gap-2">
        <Ticket className="w-5 h-5 text-yellow-400" />
        <span>Números: <span className="text-yellow-400">{selectedRaffle?.title}</span></span>
      </DialogTitle>
    </DialogHeader>
    
    <div className="p-4 flex-1 flex flex-col overflow-hidden">
      {/* Stats and Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-2">
          <div className="flex items-center bg-gray-800/50 px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5"></div>
            <span className="text-gray-300">Vendidos</span>
          </div>
          <div className="flex items-center bg-gray-800/50 px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-gray-600 rounded-full mr-1.5"></div>
            <span className="text-gray-300">Disponibles</span>
          </div>
        </div>
        
        <div className="text-yellow-400 text-sm font-medium">
          {selectedRaffle?.soldNumbers?.length || 0}/{selectedRaffle?.totalNumbers} vendidos
        </div>
      </div>

      {/* Numbers Grid with Pagination */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 pb-2">
          {Array.from({ length: selectedRaffle?.totalNumbers || 0 })
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((_, index) => {
              const number = (currentPage - 1) * itemsPerPage + index + 1
              const formattedNumber = number.toString().padStart(4, '0')
              const isSold = selectedRaffle?.soldNumbers?.includes(number)
              
              return (
                <button
                  key={number}
                  className={`
                    flex items-center justify-center h-8 w-full aspect-square rounded-sm text-xs
                    border ${isSold 
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' 
                      : 'border-gray-600 bg-gray-700/50 text-gray-400'
                    }
                  `}
                >
                  {formattedNumber}
                </button>
              )
            })}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="text-gray-400 hover:text-white"
        >
          Anterior
        </Button>
        
        <div className="text-sm text-gray-400">
          Página {currentPage} de {Math.ceil((selectedRaffle?.totalNumbers || 0) / itemsPerPage)}
        </div>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(prev => 
            Math.min(prev + 1, Math.ceil((selectedRaffle?.totalNumbers || 0) / itemsPerPage))
          )}
          disabled={currentPage === Math.ceil((selectedRaffle?.totalNumbers || 0) / itemsPerPage)}
          className="text-gray-400 hover:text-white"
        >
          Siguiente
        </Button>
      </div>
    </div>

    <div className="px-4 py-3 border-t border-gray-700 flex justify-end">
      <Button 
        onClick={() => {
          setShowNumbersModal(false)
          setCurrentPage(1)
        }} 
        size="sm"
        className="btn-gold-outline hover:bg-yellow-400 hover:text-black"
      >
        Cerrar
      </Button>
    </div>
  </DialogContent>
</Dialog>

      {/* Winner Selection Modal */}
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="bg-gray-900 border-yellow-400/20 mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-base sm:text-lg">Seleccionar Ganador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-gray-400 text-sm sm:text-base">
              Ingresa el numero del ganador para la rifa: <strong>{selectedRaffle?.title}</strong>
            </p>
            <div>
              <Label htmlFor="number" className="text-white text-sm sm:text-base">
                Numero ganador
              </Label>
              <Input
                id="number"
                type="number"
                onChange={(e) => setNumber(Number(e.target.value))}
                className="bg-gray-800 border-gray-600 text-white text-sm sm:text-base"
                placeholder="0000"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              <Button onClick={handleSelectWinner} className="btn-gold text-sm sm:text-base">
                Seleccionar Ganador
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowWinnerModal(false)
                  setWinnerEmail("")
                  setSelectedRaffle(null)
                }}
                className="btn-gold-outline text-sm sm:text-base"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
