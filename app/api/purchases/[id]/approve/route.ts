import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import { requireAdmin } from "@/lib/auth"
import { User } from "@/models/User"
import Raffle from "@/models/Raffle"
import { sendPurchaseApprovalEmail } from "@/lib/mailer"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { id } = await params
    const purchase = await (Purchase as any).findByIdAndUpdate(id, { status: "approved" }, { new: true }).populate(
      "raffleId",
      "title drawDate",
    )

    const user = await (User as any).findById(purchase.userId)
    const raffle = await (Raffle as any).findById(purchase.raffleId)

    if (!purchase) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    // Verificar que tenemos el teléfono
    if (!purchase.paymentData?.phone) {
      console.log("No hay número de teléfono asociado a esta compra!")
      return NextResponse.json(purchase)
    }

    // Transformar el número de teléfono de formato local (0424xxxx) a internacional (58424xxxxx)
    const localPhone = purchase.paymentData.phone.replace(/[^0-9]/g, '')
    let formattedPhone = localPhone
    
    // Si comienza con 0, reemplazar por 58 (código de país para Venezuela)
    if (localPhone.startsWith('0')) {
      formattedPhone = '58' + localPhone.substring(1)
    }
    // Si ya comienza con 58, dejarlo tal cual
    // Si no cumple ninguno de los patrones anteriores, se envía tal cual (pero probablemente falle)

    const message = `✅ *Compra aprobada* ✅\n\n` +
      `Hola ${purchase.paymentData.name},\n\n` +
      `Tu compra para la rifa *${raffle.title}* ha sido aprobada.\n\n` +
      `*Números asignados:*\n` +
      `${purchase.numbers.map(n => n.toString().padStart(4, '0')).join(', ')}\n\n` +
      `Guarda este mensaje como comprobante de tu compra. ¡Mucha suerte!`



    // Enviar email de aprobación
    try {
      if (purchase.paymentData?.email) {
        await sendPurchaseApprovalEmail({
          email: purchase.paymentData.email,
          name: purchase.paymentData.name || 'Usuario',
          raffleTitle: raffle.title,
          numbers: purchase.numbers,
          totalAmount: purchase.totalAmount,
          paymentMethod: purchase.paymentMethod,
          drawDate: raffle.drawDate,
          phone: purchase.paymentData.phone,
          raffleImage: raffle.image
        })
        console.log("Email de aprobación enviado exitosamente")
      }
    } catch (emailError) {
      console.error("Error enviando email de aprobación:", emailError)
      // No fallar la aprobación si el email falla
    }

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("Error approving purchase:", error)
    return NextResponse.json({ error: "Error al aprobar la compra" }, { status: 500 })
  }
}