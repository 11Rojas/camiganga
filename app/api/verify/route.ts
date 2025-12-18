import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("email") // Ahora puede ser email o número de boleto

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Email o número de boleto es requerido" },
        { status: 400 }
      )
    }

    // Obtener raffleId de los parámetros si se proporciona
    const raffleId = searchParams.get("raffleId")
    
    // Construir query de búsqueda
    const query: Record<string, any> = {}
    
    // Si se proporciona raffleId, filtrar por esa rifa específica
    if (raffleId) {
      query.raffleId = raffleId
    }

    // Determinar el tipo de búsqueda
    const isEmail = searchTerm.includes("@")
    const isTicketNumber = /^\d{4}$/.test(searchTerm) // Formato 0001, 0002, etc.
    
    // Limpiar el teléfono para búsqueda (remover espacios, guiones, paréntesis, +58, etc.)
    const cleanPhone = searchTerm.replace(/[\s\-\(\)\+]/g, '').replace(/^58/, '')
    const isPhone = /^\d{10,}$/.test(cleanPhone) // Al menos 10 dígitos

    let purchases
    
    if (isEmail) {
      // Búsqueda por email
      purchases = await (Purchase as any).find({ 
        ...query,
        "paymentData.email": searchTerm
      })
        .populate("raffleId", "title description image drawDate status")
        .sort({ createdAt: -1 })
    } else if (isTicketNumber) {
      // Búsqueda por número de boleto (convertir string a número)
      const ticketNumber = parseInt(searchTerm, 10)
      purchases = await (Purchase as any).find({ 
        ...query, 
        numbers: ticketNumber 
      })
        .populate("raffleId", "title description image drawDate status")
        .sort({ createdAt: -1 })
    } else if (isPhone) {
      // Búsqueda por teléfono - buscar con diferentes formatos
      // Normalizar el teléfono para búsqueda (solo números)
      const phoneDigits = cleanPhone.replace(/\D/g, '')
      
      purchases = await (Purchase as any).find({ 
        ...query,
        $or: [
          { "paymentData.phone": { $regex: phoneDigits, $options: 'i' } },
          { "paymentData.phone": { $regex: phoneDigits.slice(-10), $options: 'i' } }, // Últimos 10 dígitos
          { "paymentData.phone": searchTerm } // Búsqueda exacta del término original
        ]
      })
        .populate("raffleId", "title description image drawDate status")
        .sort({ createdAt: -1 })
    } else {
      // Búsqueda flexible: intentar por email, teléfono o número de boleto
      const phoneClean = searchTerm.replace(/\D/g, '') // Solo números
      
      purchases = await (Purchase as any).find({
        ...query,
        $or: [
          { "paymentData.email": searchTerm },
          { "paymentData.phone": { $regex: phoneClean, $options: 'i' } },
          ...(phoneClean.length >= 4 ? [{ numbers: parseInt(phoneClean.slice(-4), 10) }] : [])
        ]
      })
        .populate("raffleId", "title description image drawDate status")
        .sort({ createdAt: -1 })
    }

    if (purchases.length === 0) {
      return NextResponse.json({
        purchases: [],
        message: "No se encontraron compras para este término de búsqueda"
      })
    }

    // Formatear los datos para el frontend
    const formattedPurchases = purchases.map(purchase => {
      // Asegurar que raffleId sea siempre un string
      let raffleIdString: string
      if (typeof purchase.raffleId === 'object' && purchase.raffleId !== null) {
        // Si está poblado, obtener el _id del objeto
        raffleIdString = purchase.raffleId._id?.toString() || purchase.raffleId.toString()
      } else {
        // Si ya es un string o ObjectId, convertirlo a string
        raffleIdString = purchase.raffleId?.toString() || String(purchase.raffleId)
      }
      
      return {
        _id: purchase._id,
        raffleId: raffleIdString,
        numbers: purchase.numbers,
        totalAmount: purchase.totalAmount,
        paymentMethod: purchase.paymentMethod,
        status: purchase.status,
        createdAt: purchase.createdAt,
        paymentData: purchase.paymentData
      }
    })

    return NextResponse.json({
      purchases: formattedPurchases,
      count: formattedPurchases.length
    })

  } catch (error) {
    console.error("Error verificando tickets:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
