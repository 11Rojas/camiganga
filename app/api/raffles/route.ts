import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"
import { uploadToOpeninary } from "@/lib/openinary";



export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}
    if (status) query.status = status

    const raffles = await Raffle.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Raffle.countDocuments(query)

    return NextResponse.json({
      raffles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json({ error: "Error al obtener las rifas" }, { status: 500 })
  }
}




export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const ticketPrice = parseFloat(formData.get("ticketPrice") as string);
    const totalNumbers = parseInt(formData.get("totalNumbers") as string);
    const drawDate = formData.get("drawDate") as string;
    const initialProgress = parseFloat(formData.get("initialProgress") as string) || 0;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";

    // Subir imagen a Openinary si existe
    if (imageFile) {
      imageUrl = await uploadToOpeninary(imageFile, 'rifas');
    }

    // Convertir la fecha de datetime-local (hora local de Venezuela) a UTC
    // datetime-local envía "YYYY-MM-DDTHH:mm" sin zona horaria
    // Interpretamos que viene en hora de Venezuela (UTC-4) y lo convertimos a UTC
    // Si el usuario ingresa 10:00 AM hora de Venezuela, guardamos como 14:00 UTC
    const [datePart, timePart] = drawDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Crear fecha en UTC: si el usuario ingresa 10:00 hora de Venezuela (UTC-4),
    // eso equivale a 14:00 UTC (10:00 + 4 horas)
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes));

    const newRaffle = new Raffle({
      title,
      description,
      ticketPrice,
      totalNumbers,
      drawDate: utcDate,
      initialProgress,
      status: "active",
      image: imageUrl,
    });

    await newRaffle.save();





    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    console.error("Error creating raffle:", error);
    return NextResponse.json(
      { error: "Error al crear la rifa" },
      { status: 500 }
    );
  }
}