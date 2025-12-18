const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Conectar a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rifaslavilla'

// Configurar variables de entorno si no existen
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = uri
}

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      dbName: undefined,
    })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

// Usar el modelo User real
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function verifyUser() {
  try {
    await connectDB()
    
    console.log('=== VERIFYING USER ===')
    
    // Buscar el usuario específico
    const user = await User.findOne({ email: 'Rifaslavillaoficial@gmail.com' })
    
    if (user) {
      console.log('✅ User found:')
      console.log('  ID:', user._id)
      console.log('  Email:', user.email)
      console.log('  Name:', user.name)
      console.log('  Role:', user.role)
      console.log('  Created:', user.createdAt)
      
      // Verificar si la contraseña es correcta
      const isPasswordValid = await bcrypt.compare('Entrar2024**', user.password)
      console.log('  Password valid:', isPasswordValid)
      
      if (user.role !== 'admin') {
        console.log('❌ User role is not admin! Updating...')
        user.role = 'admin'
        await user.save()
        console.log('✅ User role updated to admin')
      } else {
        console.log('✅ User role is already admin')
      }
    } else {
      console.log('❌ User not found!')
    }
    
  } catch (error) {
    console.error('Error verifying user:', error)
  } finally {
    process.exit(0)
  }
}

verifyUser()
