import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, phone } = await request.json()

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }



    // Crear usuario
    const user = new User({
      name,
      email,
      password,
      phone,
      role: "user",
    })

    await user.save()

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
