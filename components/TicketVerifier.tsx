"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CheckCircle, XCircle, Printer, Download, Calendar, Clock, Ticket, DollarSign, User, MessageCircle } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import siteConfig from "@/config/site"

// Importar QR code dinámicamente para evitar problemas de SSR
const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), { ssr: false })
const jsPDF = dynamic(() => import("jspdf").then((mod) => mod.jsPDF), { ssr: false })

interface TicketVerifierProps {
  raffleId?: string
  initialEmail?: string
}

export default function TicketVerifier({ raffleId, initialEmail }: TicketVerifierProps) {
  const [verifierInput, setVerifierInput] = useState(initialEmail || "")
  const [verifierResult, setVerifierResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNumbersOnly, setShowNumbersOnly] = useState(false)
  const [raffleData, setRaffleData] = useState<any>(null)
  const printTicketRef = useRef<HTMLDivElement>(null)
  
  // Si hay initialEmail, buscar automáticamente
  useEffect(() => {
    if (initialEmail && initialEmail.trim()) {
      setVerifierInput(initialEmail)
      // Esperar un poco para que el componente se monte completamente
      setTimeout(() => {
        handleVerifyTicket()
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail])

  const handleVerifyTicket = async () => {
    if (!verifierInput.trim()) {
      alert("Por favor ingresa un email o número de boleto")
      return
    }

    setIsLoading(true)
    try {
      let raffleIdParam = ''
      if (raffleId) {
        if (typeof raffleId === 'object') {
          const objRaffleId = raffleId as any
          raffleIdParam = objRaffleId._id?.toString() || objRaffleId.toString()
        } else {
          raffleIdParam = String(raffleId)
        }
      }
      const response = await fetch(`/api/verify?email=${encodeURIComponent(verifierInput.trim())}${raffleIdParam ? `&raffleId=${raffleIdParam}` : ''}`)
      const data = await response.json()
      
      if (response.ok) {
        setVerifierResult(data)
        // Obtener información de la rifa si hay compras
        if (data.purchases && data.purchases.length > 0) {
          const purchaseRaffleId = data.purchases[0].raffleId
          if (purchaseRaffleId) {
            // Asegurar que raffleId sea un string
            const raffleIdString = typeof purchaseRaffleId === 'object' && purchaseRaffleId !== null
              ? (purchaseRaffleId._id?.toString() || purchaseRaffleId.toString())
              : String(purchaseRaffleId)
            
            const raffleResponse = await fetch(`/api/raffles/${raffleIdString}`)
            if (raffleResponse.ok) {
              const raffleInfo = await raffleResponse.json()
              setRaffleData(raffleInfo)
            }
          }
        }
      } else {
        alert(`No se encontraron compras para: ${verifierInput.trim()}`)
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      alert("Error al verificar el ticket")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .print-ticket {
          display: none !important;
        }
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .print-ticket {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 20px !important;
            margin: 0 !important;
            page-break-inside: avoid;
            z-index: 9999 !important;
          }
          .print-ticket * {
            visibility: visible !important;
          }
          .print-ticket img,
          .print-ticket svg,
          .print-ticket span {
            display: inline-block !important;
          }
          .print-ticket .flex {
            display: flex !important;
          }
          .print-ticket div {
            display: block !important;
          }
        }
      `}} />
      <div className="p-4 space-y-4 no-print">
        {/* Ticket Verifier Section */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 text-center mb-6 uppercase">
              VERIFICADOR DE BOLETOS
            </h2>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Email o número de boleto (ej: 0001)"
                className="text-center h-12 text-lg font-bold text-black placeholder:text-gray-500 bg-white border-gray-300"
                style={{backgroundColor: 'white', color: 'black'}}
                value={verifierInput}
                onChange={(e) => setVerifierInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyTicket()
                  }
                }}
              />
              
              <p className="text-sm text-black text-center">
                Email o Número de Boleto (formato: 0001, 0002, etc.)
              </p>
              
              <Button 
                className="w-full bg-blue-900 hover:bg-blue-800 h-12 rounded-full text-white font-semibold"
                onClick={handleVerifyTicket}
                disabled={!verifierInput.trim() || isLoading}
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? "BUSCANDO..." : "BUSCAR"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verified Ticket Details Section */}
        {verifierResult && verifierResult.purchases && verifierResult.purchases.length > 0 && (() => {
          // Obtener todos los números de todas las compras
          const allNumbers: number[] = []
          verifierResult.purchases.forEach((purchase: any) => {
            if (purchase.numbers) {
              allNumbers.push(...purchase.numbers)
            }
          })
          const sortedNumbers = allNumbers.sort((a, b) => a - b)
          const totalNumbers = sortedNumbers.length
          const fullName = verifierResult.purchases[0]?.paymentData?.name || "Usuario"
          
          // Generar datos para el QR code
          const qrData = JSON.stringify({
            name: fullName,
            email: verifierResult.purchases[0]?.paymentData?.email || "",
            numbers: sortedNumbers,
            total: verifierResult.purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0)
          })

          // Función para imprimir un ticket individual
          const printTicket = async (ticketNumber: number) => {
            if (!raffleData) return
            
            try {
              // Obtener datos para el QR
              const qrDataForTicket = JSON.stringify({
                name: fullName,
                email: verifierResult.purchases[0]?.paymentData?.email || "",
                numbers: [ticketNumber],
                total: verifierResult.purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0)
              })
              
              // Formatear fecha del sorteo
              const drawDate = raffleData.drawDate ? new Date(raffleData.drawDate) : new Date()
              const drawDateFormatted = drawDate.toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "America/Caracas"
              }).toUpperCase().replace(/\./g, "")
              const drawTimeFormatted = drawDate.toLocaleTimeString("es-VE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "America/Caracas"
              }).toUpperCase()
              
              // Formatear fecha de creación
              const createdAt = verifierResult.purchases[0]?.createdAt || new Date()
              const createdDate = new Date(createdAt)
              const createdDateFormatted = createdDate.toLocaleDateString("es-VE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "America/Caracas"
              })
              const createdTimeFormatted = createdDate.toLocaleTimeString("es-VE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone: "America/Caracas"
              })
              
              // Estado de verificación
              const status = verifierResult.purchases[0]?.status || "pending"
              const statusText = status === 'pending' ? 'PENDIENTE' : status === 'approved' ? 'APROBADA' : 'RECHAZADA'
              
              // Teléfono
              const phone = verifierResult.purchases[0]?.paymentData?.phone || ""
              const phoneDisplay = phone ? `+58 ${phone}` : ""
              
              // Generar URL del QR code
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataForTicket)}`
              
              // Crear HTML para imprimir
              const printHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>IMPRIMIR - ${raffleData.title}</title>
  <meta name="robots" content="noindex">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link href="https://fonts.googleapis.com/css?family=Poppins:700,800&display=swap" rel="stylesheet">
  <style>
    html, body {width: 318pt !important;}
    .text-center {text-align: center;}
    body {
      font-family: 'Poppins', monospace;
      font-size: 28px;
      margin: 0;
      padding: 0;
      line-height: 1em;
      color: #000;
    }
    p {
      margin:8px 0;
      font-weight: 700;
    }
    .ticket {
      width: 318pt !important;
      text-align: left;
      padding: 10px;
    }
    .header {font-weight: 900;}
    .logo {margin-bottom: 0;}
    .client-name {
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 0;
      line-height: 1em;
    }
    .title_raffle {border-bottom: 5px dashed #000;}
    .participant-info {margin-top: 5px;}
    .ticket-details {margin-top: 5px;}
    .numbers {
      font-size: 32px;
      line-height: 1.2;
    }
    .draw-details {margin-top: 0;}
    button {
      margin: 2px auto 20px;
      display: block;
      padding: 5px 25px;
      border-radius: 22px;
      border: 4px solid #000;
      user-select: none;
      background:black;
      color:white;
    }
    button:hover {
      background:white;
      color:black;
    }
    .footer {margin-top: 5px;}
    img#qrCode {
      margin: 8px 2px;
      width: 160px;
      height: auto;
    }
    @page {
      size: auto;
      margin: 0mm;
    }
    @media print {
      @page {
        size: 318pt auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
      #print-area {
        width: 318pt !important;
        max-width: 318pt !important;
        margin: 0;
      }
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 318pt !important;
        max-width: 318pt !important;
        height: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        overflow: visible !important;
      }
      img#qrCode {
        width: 250px;
        height: 250px;
      }
      button {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div id="print-area" class="ticket">
    <div style="display:none;width: 318pt !important;max-width: 318pt !important;border-bottom: 2px dashed #000;"></div>
    <div style="display:none;background: red;width: 318pt !important;max-width: 318pt !important;border-bottom: 2px solid red;">NO VISIBLE 01</div>
    <div class="logo text-center">
      <img src="${siteConfig.siteUrl || window.location.origin}/logo.png" alt="Logo" width="120">
    </div>
    <div class="client-name text-center">Camiganga</div>
    <div class="draw-details title_raffle">
      <p class="text-center"><b>${raffleData.title.toUpperCase()}</b></p>
      <p class="text-center"><b><i class="fa fa-calendar" aria-hidden="true"></i> ${drawDateFormatted} <i class="fa fa-clock-o" aria-hidden="true"></i> ${drawTimeFormatted}</b></p>
    </div>
    <div class="ticket-details">
      <p class="text-center"><i class="fa fa-ticket" aria-hidden="true"></i> <b>BOLETOS</b> <i class="fa fa-ticket" aria-hidden="true"></i></p>
      <p class="text-center numbers">${ticketNumber.toString().padStart(4, '0')}</p>
    </div>
    <div class="participant-info">
      <p><i class="fa fa-user" aria-hidden="true"></i> ${fullName}</p>
      <p><i class="fa fa-map-marker" aria-hidden="true"></i> Táchira</p>
      ${phoneDisplay ? `<p><i class="fa fa-whatsapp" aria-hidden="true"></i> ${phoneDisplay}</p>` : ''}
    </div>
    <div class="draw-details">
      <p><b><i class="fa fa-calendar" aria-hidden="true"></i> ${createdDateFormatted} <i class="fa fa-clock-o" aria-hidden="true"></i> ${createdTimeFormatted}</b></p>
      <p class="mb-0"><i class="fa fa-clock-o" aria-hidden="true"></i> VERIFICACIÓN ${statusText}</p>
    </div>
    <div class="qrcode text-center">
      <img id="qrCode" class="qr" src="${qrUrl}" alt="QR">
    </div>
    <div style="display:none;margin-top:5px;width: 318pt !important;max-width: 318pt !important;border-bottom: 4px dashed #000;"></div>
  </div>
  <button onclick="window.print()">Imprimir</button>
</body>
</html>`
              
              // Abrir nueva ventana con el HTML
              const printWindow = window.open('', '_blank')
              if (printWindow) {
                printWindow.document.write(printHTML)
                printWindow.document.close()
                // Esperar a que la imagen del QR se cargue antes de permitir imprimir
                printWindow.onload = () => {
                  // La ventana ya está lista, el usuario puede hacer clic en el botón para imprimir
                }
              }
            } catch (error) {
              console.error('Error al abrir ventana de impresión:', error)
              alert('Error al abrir la ventana de impresión. Por favor intenta de nuevo.')
            }
          }

          return (
            <>
              <style dangerouslySetInnerHTML={{__html: `
                .ticket-widget {
                  background: white;
                  border-radius: 0;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                  position: relative;
                  max-width: 350px;
                  margin: 0 auto;
                }
                .ticket-widget .red-bar {
                  background: transparent;
                  padding: 8px 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                }
                .ticket-widget .logo-section {
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .ticket-widget .logo-section img {
                  width: 100%;
                  height: auto;
                  max-height: 50px;
                  object-fit: contain;
                }
                .ticket-widget .main-section {
                  background: #032a3d;
                  padding: 0;
                  position: relative;
                  min-height: 240px;
                }
                .ticket-widget .bg-image {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 0;
                }
                .ticket-widget .bg-image img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
                .ticket-widget .bg-image-wrapper {
                  position: relative;
                  width: 100%;
                  height: 100%;
                }
                .ticket-widget .overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(to bottom, rgba(3,42,61,0.7) 0%, rgba(3,42,61,0.9) 100%);
                  z-index: 1;
                }
                .ticket-widget .content {
                  position: relative;
                  z-index: 2;
                  padding: 15px;
                }
                .ticket-widget .title {
                  text-align: center;
                  margin-bottom: 8px;
                  color: white;
                  font-size: 16px;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                }
                .ticket-widget .raffle-name {
                  text-align: center;
                  margin-bottom: 12px;
                  color: white;
                  font-size: 19px;
                  font-weight: 900;
                  text-transform: uppercase;
                }
                .ticket-widget .info-box {
                  position: absolute;
                  bottom: 5px !important;
                  left: 15px !important;
                  transform: none !important;
                  background: transparent;
                  padding: 10px;
                  border-radius: 8px;
                  color: white;
                  font-size: 13px;
                  line-height: 1.6;
                  text-align: left;
                  width: calc(100% - 30px);
                  z-index: 10 !important;
                }
                .ticket-widget .info-box div {
                  margin-bottom: 3px;
                  font-weight: bold;
                  color: white;
                }
                .ticket-widget .date-section {
                  background: #032a3d;
                  padding: 15px 18px;
                }
                .ticket-widget .date-time {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  color: white;
                  font-size: 14px;
                  font-weight: 900;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                }
                .ticket-widget .dashed-line {
                  border-top: 2px dashed rgba(255,255,255,0.6);
                  margin-top: 8px;
                }
                .ticket-widget .number-section {
                  background: #032a3d;
                  padding: 20px 18px 25px;
                  position: relative;
                }
                .ticket-widget .number-box {
                  background: white;
                  border: 2px dashed #032a3d;
                  padding: 20px 12px;
                  text-align: center;
                  margin: 0 auto;
                  max-width: 180px;
                }
                .ticket-widget .number-text {
                  color: #032a3d;
                  font-size: 48px;
                  font-weight: 900;
                  letter-spacing: 5px;
                  font-family: Arial, sans-serif;
                  line-height: 1;
                }
                .ticket-widget .red-circle {
                  position: absolute;
                  bottom: -8px;
                  width: 16px;
                  height: 16px;
                  background: #dc2626;
                  border-radius: 50%;
                }
                .ticket-widget .red-circle.left {
                  left: -8px;
                }
                .ticket-widget .red-circle.right {
                  right: -8px;
                }
              `}} />
              
              {/* Nombre del Comprador */}
              <Card className="bg-white shadow-lg mb-4">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#032a3d]" style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>
                      {fullName}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card className="bg-white shadow-lg mb-4">
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    {qrData && (
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <QRCodeSVG
                          value={qrData}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tickets Individuales */}
              <div className="flex flex-wrap gap-4 justify-center">
                {sortedNumbers.map((ticketNumber) => (
                  <div key={ticketNumber} className="mb-6 flex-shrink-0" style={{width: '350px'}}>
                    <div id={`ticket-${ticketNumber}`} className="ticket-widget">
                      {/* Barra Roja Superior */}
                      <div className="red-bar">
                        <div className="logo-section">
                          <Image 
                            src="/logo.png" 
                            alt="CAMIGANGA" 
                            width={350} 
                            height={50}
                            className="object-contain"
                            style={{width: '100%', height: 'auto', maxHeight: '50px'}}
                          />
                        </div>
                      </div>
                      
                      {/* Sección Principal con Imagen */}
                      <div className="main-section">
                        {raffleData?.image && (
                          <div className="bg-image">
                            <div className="bg-image-wrapper">
                              <Image 
                                src={raffleData.image} 
                                alt="Background" 
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div className="overlay"></div>
                        <div className="content">
                          <div className="title"></div>
                          <div className="raffle-name">{raffleData?.title?.toUpperCase() || 'LA HERENCIA'}</div>
                        </div>
                        <div className="info-box">
                          <div>Verificación {verifierResult.purchases[0]?.status === 'pending' ? 'Pendiente' : verifierResult.purchases[0]?.status === 'approved' ? 'Aprobada' : 'Rechazada'}</div>
                          <div>{fullName.length > 15 ? fullName.substring(0, 15) + '...' : fullName}</div>
                          {verifierResult.purchases[0]?.paymentData?.phone && (
                            <div>+58 {verifierResult.purchases[0].paymentData.phone.substring(0, 4)}****{verifierResult.purchases[0].paymentData.phone.substring(verifierResult.purchases[0].paymentData.phone.length - 2)}</div>
                          )}
                          <div>{new Date(verifierResult.purchases[0]?.createdAt || new Date()).toLocaleString('es-VE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: 'America/Caracas'
                          })}</div>
                        </div>
                      </div>
                      
                      {/* Sección de Fecha y Hora */}
                      <div className="date-section">
                        <div className="date-time">
                          <span>{raffleData?.drawDate ? new Date(raffleData.drawDate).toLocaleDateString("es-VE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "America/Caracas"
                          }).toUpperCase().replace(/\./g, "") : 'N/A'}</span>
                          <span>{raffleData?.drawDate ? new Date(raffleData.drawDate).toLocaleTimeString("es-VE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "America/Caracas"
                          }).toUpperCase() : 'N/A'}</span>
                        </div>
                        <div className="dashed-line"></div>
                      </div>
                      
                      {/* Sección del Número */}
                      <div className="number-section">
                        <div className="number-box">
                          <div className="number-text">
                            {ticketNumber.toString().padStart(4, '0')}
                          </div>
                        </div>
                        <div className="red-circle left"></div>
                        <div className="red-circle right"></div>
                      </div>
                    </div>
                    
                    {/* Botón Imprimir */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => printTicket(ticketNumber)}
                        className="bg-[#032a3d] hover:bg-[#054a6d] text-white font-bold rounded-lg px-6 py-2 flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        })()}

        {/* No Results Section */}
        {verifierResult && verifierResult.purchases && verifierResult.purchases.length === 0 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-3 py-2 rounded-full bg-red-100 text-red-800 text-sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  <span className="font-semibold">NO ENCONTRADO</span>
                </div>
                <p className="text-gray-600">
                  No se encontraron compras para: <span className="font-semibold text-gray-800">{verifierInput}</span>
                </p>
                <Button
                  onClick={() => {
                    setVerifierInput("")
                    setVerifierResult(null)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Nueva Búsqueda
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}