import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import { requireAdmin } from "@/lib/auth"
import Raffle from "@/models/Raffle"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id2: string }> }) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { id2 } = await params

    // 1. Buscar la compra a eliminar
    const purchase = await Purchase.findById(id2)
    if (!purchase) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    }



    // 3. Eliminar los números de soldNumbers en la rifa
    await Raffle.findByIdAndUpdate(
      purchase.raffleId,
      { $pull: { soldNumbers: { $in: purchase.numbers } } }
    )

    // 4. Eliminar la compra
    const deletedPurchase = await Purchase.findByIdAndDelete(id2)

    return NextResponse.json(
      { 
        message: "Compra eliminada exitosamente",
        deletedPurchase 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error deleting purchase:", error)
    return NextResponse.json(
      { error: "Error al eliminar la compra", details: error.message },
      { status: 500 }
    )
  }
}