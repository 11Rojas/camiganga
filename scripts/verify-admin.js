const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Configurar MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ganacomivan'

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

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')
    
    const adminUser = await User.findOne({ 
      email: 'ganacomivan91@outlook.com',
      role: 'admin'
    })
    
    if (adminUser) {
      console.log('✅ Usuario administrador encontrado:')
      console.log(`   - ID: ${adminUser._id}`)
      console.log(`   - Nombre: ${adminUser.name}`)
      console.log(`   - Email: ${adminUser.email}`)
      console.log(`   - Rol: ${adminUser.role}`)
      console.log(`   - Creado: ${adminUser.createdAt}`)
      
      // Verificar contraseña
      const isValidPassword = await bcrypt.compare('Ivan*211', adminUser.password)
      console.log(`   - Contraseña válida: ${isValidPassword ? '✅ Sí' : '❌ No'}`)
    } else {
      console.log('❌ Usuario administrador no encontrado')
    }
    
    await mongoose.disconnect()
    console.log('✅ Desconectado de MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkAdmin()
