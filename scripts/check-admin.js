const { connectDB } = require('../lib/mongodb')
const { User } = require('../models/User')

async function checkAdminUser() {
  try {
    await connectDB()
    
    console.log('=== CHECKING ADMIN USER ===')
    
    // Buscar todos los usuarios
    const allUsers = await User.find({})
    console.log('Total users in database:', allUsers.length)
    
    // Mostrar todos los usuarios
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log('  ID:', user._id)
      console.log('  Email:', user.email)
      console.log('  Name:', user.name)
      console.log('  Role:', user.role)
      console.log('  Created:', user.createdAt)
      console.log('---')
    })
    
    // Buscar específicamente usuarios admin
    const adminUsers = await User.find({ role: 'admin' })
    console.log('Admin users found:', adminUsers.length)
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!')
      console.log('Run: npm run create-admin')
    } else {
      console.log('✅ Admin users found:')
      adminUsers.forEach(user => {
        console.log('  -', user.email, '(Role:', user.role, ')')
      })
    }
    
    // Buscar el usuario específico
    const specificAdmin = await User.findOne({ email: 'admin@rifasvelocistas.com' })
    if (specificAdmin) {
      console.log('✅ Specific admin user found:')
      console.log('  Email:', specificAdmin.email)
      console.log('  Role:', specificAdmin.role)
      console.log('  Name:', specificAdmin.name)
    } else {
      console.log('❌ Specific admin user not found')
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error)
  } finally {
    process.exit(0)
  }
}

checkAdminUser() 