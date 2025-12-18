import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import  Raffle  from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { id } = await params
    const purchase = await Purchase.findById(id)
    if (!purchase) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }

    // Liberar los números reservados
    await Raffle.findByIdAndUpdate(purchase.raffleId, {
      $pullAll: { soldNumbers: purchase.numbers },
    })

    // Actualizar estado de la compra
    const updatedPurchase = await Purchase.findByIdAndUpdate(id, { status: "rejected" }, { new: true }).populate(
      "raffleId",
      "title",
    )

    return NextResponse.json(updatedPurchase)
  } catch (error) {
    console.error("Error rejecting purchase:", error)
    return NextResponse.json({ error: "Error al rechazar la compra" }, { status: 500 })
  }
}
