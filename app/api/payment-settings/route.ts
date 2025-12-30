import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { PaymentSettings } from "@/models/PaymentSettings"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentSettings = await PaymentSettings.findOne().sort({ createdAt: -1 })

    if (!currentSettings) {
      // Crear configuración inicial si no existe
      // Buscar un usuario admin para usar como updatedBy inicial
      const { User } = await import("@/models/User")
      const adminUser = await (User as any).findOne({ role: "admin" })
      
      if (!adminUser) {
        return NextResponse.json(
          { error: "No se encontró un usuario administrador para inicializar la configuración" },
          { status: 500 }
        )
      }
      
      const initialSettings = new PaymentSettings({
        phone: "04128393072",
        ci: "15903799",
        bank: "0104",
        bankName: "BANCO VENEZOLANO DE CREDITO",
        updatedBy: adminUser._id,
      })
      await initialSettings.save()
      return NextResponse.json(initialSettings)
    }

    return NextResponse.json(currentSettings)
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    return NextResponse.json({ error: "Error al obtener la configuración de pago" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { phone, ci, bank, bankName } = await request.json()

    if (!phone || !ci || !bank) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Obtener configuración anterior
    const previousSettings = await PaymentSettings.findOne().sort({ createdAt: -1 })

    // Crear nueva configuración
    const newSettings = new PaymentSettings({
      phone,
      ci,
      bank,
      bankName: bankName || "BANCO VENEZOLANO DE CREDITO",
      updatedBy: session.user.id,
    })

    await newSettings.save()

    return NextResponse.json(newSettings, { status: 200 })
  } catch (error) {
    console.error("Error updating payment settings:", error)
    return NextResponse.json({ error: "Error al actualizar la configuración de pago" }, { status: 500 })
  }
}

