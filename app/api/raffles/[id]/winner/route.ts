import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Raffle from "@/models/Raffle";
import { Purchase } from "@/models/Purchase";
import { requireAdmin } from "@/lib/auth";
import { sendWinnerAnnouncementEmail } from "@/lib/mailer";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    await connectDB();

    const { number: winningNumberInput } = await request.json();
    const { id } = await params;

    // Validar que el número tenga 4 dígitos
 

    const raffle = await (Raffle as any).findById(id);
    if (!raffle) {
      return NextResponse.json({ error: "Rifa no encontrada" }, { status: 404 });
    }

    if (raffle.status !== "active") {
      return NextResponse.json({ error: "La rifa no está activa" }, { status: 400 });
    }

    // Buscar TODAS las compras aprobadas para esta rifa
    const allPurchases = await (Purchase as any).find({
      raffleId: id,
      status: "approved"
    });

    if (allPurchases.length === 0) {
      return NextResponse.json({ error: "No hay compras aprobadas para esta rifa" }, { status: 400 });
    }

    // Normalizar el número ganador (eliminar ceros a la izquierda)
    const normalizedWinningNumber = parseInt(winningNumberInput, 10).toString();

    // Buscar al comprador que tiene este número
    let winnerPurchase = null;
    let winnerNumbers = [];

    // Buscar en todas las compras
    for (const purchase of allPurchases) {
      // Normalizar los números de la compra (eliminar ceros a la izquierda y comparar)
      const normalizedNumbers = purchase.numbers.map(num => parseInt(num, 10).toString());
      
      if (normalizedNumbers.includes(normalizedWinningNumber)) {
        winnerPurchase = purchase;
        winnerNumbers = purchase.numbers; // Mantener el formato original para el mensaje
        break;
      }
    }
    console.log(winningNumberInput)

    if (!winnerPurchase) {
      return NextResponse.json({ 
        error: "No se encontró un comprador para el número ganador" 
      }, { status: 400 });
    }

    // Obtener datos del ganador desde la compra
    const winnerData = winnerPurchase.paymentData;

    // Actualizar rifa con ganador (guardamos ambos formatos)
    const updatedRaffle = await (Raffle as any).findByIdAndUpdate(
      id,
      {
        status: "completed",
        winner: {
          userName: winnerData.name,
          userEmail: winnerData.email,
          userPhone: winnerData.phone,
          winningNumber: winningNumberInput, // Guardamos el formato original (0007)
          normalizedWinningNumber: normalizedWinningNumber, // Guardamos el formato sin ceros (7)
        },
      },
      { new: true },
    );

    // Enviar notificación por WhatsApp al ganador
    const phoneNumber = winnerData.phone;
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Transformar a formato internacional si comienza con 0
    const internationalPhone = formattedPhone.startsWith('0') 
      ? '58' + formattedPhone.substring(1) 
      : formattedPhone;

    const whatsappMessage = `🏆 *¡FELICIDADES, HAS GANADO!* 🏆\n\n` +
      `Hola ${winnerData.name},\n\n` +
      `¡Eres el ganador de la rifa *${raffle.title}*!\n\n` +
      `*Tu número ganador:* ${winningNumberInput}\n` +
      `(Entre tus números: ${winnerNumbers.join(', ')})\n\n` +
      `Por favor contáctanos para coordinar la entrega de tu premio.\n\n` +
      `¡Muchas felicidades! 🎉`;

    try {
      const greenApiResponse = await fetch(
        `https://7105.api.greenapi.com/waInstance${process.env.GREEN_API_INSTANCE_ID}/sendMessage/${process.env.GREEN_API_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: `${internationalPhone}@c.us`,
            message: whatsappMessage
          })
        }
      );

      const greenApiData = await greenApiResponse.json();
      
      if (!greenApiResponse.ok) {
        console.error("Error enviando mensaje por WhatsApp:", greenApiData);
      } else {
        console.log("Notificación enviada con éxito al ganador");
      }
    } catch (error) {
      console.error("Error al enviar WhatsApp:", error);
    }

    // Enviar email de anuncio de ganador
    try {
      if (winnerData?.email && winnerData.email.trim() !== '') {
        await sendWinnerAnnouncementEmail({
          email: winnerData.email,
          name: winnerData.name || 'Ganador',
          raffleTitle: raffle.title,
          winningNumber: parseInt(winningNumberInput),
          prize: `Premio de la rifa ${raffle.title}`
        })
        console.log("Email de ganador enviado exitosamente")
      } else {
        console.log("No hay email válido para enviar notificación al ganador")
      }
    } catch (emailError) {
      console.error("Error enviando email de ganador:", emailError)
      // No fallar el anuncio si el email falla
    }

    return NextResponse.json(updatedRaffle);
  } catch (error) {
    console.error("Error selecting winner:", error);
    return NextResponse.json({ error: "Error al seleccionar ganador" }, { status: 500 });
  }
}