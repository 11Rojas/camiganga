import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    
    const raffle = await (Raffle as any).findById(id)
    
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Error fetching raffle:", error)
    return NextResponse.json(
      { error: "Error al obtener la rifa" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()
    
    const { id } = await params
    
    // Verificar que la rifa existe
    const existingRaffle = await Raffle.findById(id)
    if (!existingRaffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const ticketPrice = parseFloat(formData.get("ticketPrice") as string)
    const totalNumbers = parseInt(formData.get("totalNumbers") as string)
    const drawDate = formData.get("drawDate") as string
    const imageFile = formData.get("image") as File | null
    const currentImage = formData.get("currentImage") as string

    let imageUrl = currentImage || existingRaffle.image

    // Subir nueva imagen a Cloudinary si existe
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "rifas", resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              reject(error)
              return
            }
            resolve(result)
          }
        ).end(buffer)
      }) as any

      imageUrl = result.secure_url
    }

    // Convertir la fecha de datetime-local (hora local de Venezuela) a UTC
    // datetime-local envía "YYYY-MM-DDTHH:mm" sin zona horaria
    // Interpretamos que viene en hora de Venezuela (UTC-4) y lo convertimos a UTC
    const [datePart, timePart] = drawDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Crear fecha en UTC: si el usuario ingresa 10:00 hora de Venezuela (UTC-4),
    // eso equivale a 14:00 UTC (10:00 + 4 horas)
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes));

    // Actualizar la rifa
    const updatedRaffle = await Raffle.findByIdAndUpdate(
      id,
      {
        title,
        description,
        ticketPrice,
        totalNumbers,
        drawDate: utcDate,
        image: imageUrl,
        updatedAt: new Date()
      },
      { new: true }
    )

    return NextResponse.json(updatedRaffle, { status: 200 })
  } catch (error) {
    console.error("Error updating raffle:", error)
    return NextResponse.json(
      { error: "Error al actualizar la rifa" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()
    
    const { id } = await params
    
    // Verificar que la rifa existe
    const existingRaffle = await Raffle.findById(id)
    if (!existingRaffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar la rifa
    await Raffle.findByIdAndDelete(id)

    return NextResponse.json(
      { message: "Rifa eliminada correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting raffle:", error)
    return NextResponse.json(
      { error: "Error al eliminar la rifa" },
      { status: 500 }
    )
  }
}