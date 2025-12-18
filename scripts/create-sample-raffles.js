const { connectDB } = require('../lib/mongodb')
const { Raffle } = require('../models/Raffle')

async function createSampleRaffles() {
  try {
    await connectDB()
    
    console.log('=== CREATING SAMPLE RAFFLES ===')
    
    // Verificar si ya existen rifas
    const existingRaffles = await Raffle.find({})
    if (existingRaffles.length > 0) {
      console.log('Ya existen rifas en la base de datos:', existingRaffles.length)
      console.log('Rifas existentes:')
      existingRaffles.forEach(raffle => {
        console.log(`- ${raffle.title} (${raffle.status})`)
      })
      return
    }
    
    const sampleRaffles = [
      {
        title: "iPhone 15 Pro Max 256GB",
        description: "Gana el último iPhone 15 Pro Max de 256GB en color Titanio Natural. Incluye cargador y protector de pantalla premium.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 5,
        totalNumbers: 1000,
        soldNumbers: [1, 5, 10, 15, 23, 45, 67, 89, 123, 156, 234, 345, 456, 567, 678, 789, 890, 901, 234, 567],
        drawDate: new Date("2024-12-31T20:00:00.000Z"),
        status: "active",
      },
      {
        title: "PlayStation 5 + 5 Juegos",
        description: "PlayStation 5 Digital Edition con 5 juegos AAA: Spider-Man 2, FIFA 24, Call of Duty, God of War Ragnarök y Horizon Forbidden West.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 3,
        totalNumbers: 800,
        soldNumbers: [2, 8, 12, 25, 34, 56, 78, 91, 134, 167, 189, 234, 278, 345, 456, 567, 678, 789, 890, 123, 456, 789, 234, 567, 890, 123, 456],
        drawDate: new Date("2024-12-25T19:00:00.000Z"),
        status: "active",
      },
      {
        title: "MacBook Air M3 16GB + Accesorios",
        description: "MacBook Air con chip M3, 16GB RAM y 512GB SSD en color Medianoche. Incluye Magic Mouse, teclado y funda premium.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 8,
        totalNumbers: 500,
        soldNumbers: [3, 7, 14, 28, 42, 63, 85, 107, 129, 151, 173, 195, 217, 239, 261, 283, 305, 327, 349, 371, 393, 415, 437, 459, 481],
        drawDate: new Date("2025-01-15T21:00:00.000Z"),
        status: "active",
      },
      {
        title: "Samsung Galaxy S24 Ultra 512GB",
        description: "El smartphone más avanzado de Samsung con S Pen incluido, cámara de 200MP y pantalla de 6.8 pulgadas.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 4,
        totalNumbers: 1200,
        soldNumbers: [1, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360, 375, 390, 405, 420, 435, 450, 465, 480, 495, 510, 525, 540, 555, 570, 585, 600, 615, 630, 645, 660, 675, 690, 705, 720, 735, 750, 765, 780, 795, 810, 825, 840, 855, 870, 885, 900, 915, 930, 945, 960, 975, 990, 1005, 1020, 1035, 1050, 1065, 1080, 1095, 1110, 1125, 1140, 1155, 1170, 1185, 1200],
        drawDate: new Date("2025-02-14T18:00:00.000Z"),
        status: "active",
      },
      {
        title: "Nintendo Switch OLED + 10 Juegos",
        description: "Nintendo Switch OLED con 10 juegos populares: Mario Kart 8, Animal Crossing, Zelda, Pokémon y más.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 2,
        totalNumbers: 1500,
        soldNumbers: [5, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975, 1000, 1025, 1050, 1075, 1100, 1125, 1150, 1175, 1200, 1225, 1250, 1275, 1300, 1325, 1350, 1375, 1400, 1425, 1450, 1475, 1500],
        drawDate: new Date("2025-01-30T17:00:00.000Z"),
        status: "active",
      },
      {
        title: "iPad Pro 12.9" M4 + Apple Pencil",
        description: "iPad Pro de 12.9 pulgadas con chip M4, 256GB, Apple Pencil Pro y Magic Keyboard incluidos.",
        image: "/placeholder.svg?height=200&width=400",
        ticketPrice: 6,
        totalNumbers: 600,
        soldNumbers: [10, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600],
        drawDate: new Date("2025-03-01T19:30:00.000Z"),
        status: "active",
      }
    ]
    
    // Crear las rifas
    const createdRaffles = await Raffle.insertMany(sampleRaffles)
    
    console.log('✅ Rifas de ejemplo creadas exitosamente:')
    createdRaffles.forEach(raffle => {
      console.log(`- ${raffle.title} (ID: ${raffle._id})`)
    })
    
    console.log(`\nTotal de rifas creadas: ${createdRaffles.length}`)
    console.log('Ahora puedes ver las rifas en la página principal del sitio.')
    
  } catch (error) {
    console.error('Error creando rifas de ejemplo:', error)
  } finally {
    process.exit(0)
  }
}

createSampleRaffles() 