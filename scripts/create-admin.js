const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

function loadEnvLocal() {
  if (process.env.MONGODB_URI) return
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2]
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

async function connectDB() {
  loadEnvLocal()
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set. Set env or add to .env.local')
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(uri, {
    dbName: "camiganga",
  })
}

// Usar el modelo User real que tiene el hook de encriptación
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

// Agregar el hook de encriptación igual que en el modelo real
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '')
      const next = args[i + 1]
      if (!next || next.startsWith('--')) {
        out[key] = true
      } else {
        out[key] = next
        i++
      }
    }
  }
  return out
}

async function ensureAdmin({ email, password, name, phone }) {
  if (!email || !password) {
    throw new Error('Missing --email and/or --password arguments')
  }

  await connectDB()

  let user = await User.findOne({ email })
  if (user) {
    user.name = name || user.name || 'Admin'
    if (phone) user.phone = phone
    user.role = 'admin'
    user.password = password // El modelo se encarga del hash automáticamente
    await user.save()
    return { created: false, id: user._id }
  }

  user = new User({
    name: name || 'Admin',
    email,
    password: password, // El modelo se encarga del hash automáticamente
    phone,
    role: 'admin',
  })
  await user.save()
  return { created: true, id: user._id }
}

;(async () => {
  try {
    const args = parseArgs()
    const { email, password, name, phone } = args
    console.log('Creating/updating admin user for:', email)
    const result = await ensureAdmin({ email, password, name, phone })
    console.log(result.created ? '✅ Admin user created' : '✅ Admin user updated', '-', String(result.id))
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to create admin user:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()


