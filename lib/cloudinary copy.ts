import { v2 as cloudinary } from 'cloudinary';

// Validar que todas las variables de entorno estén presentes
// Limpiar cualquier espacio en blanco y comillas que puedan estar presentes
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().replace(/^["']|["']$/g, '')
const apiKey = process.env.CLOUDINARY_API_KEY?.trim().replace(/^["']|["']$/g, '')
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim().replace(/^["']|["']$/g, '')

// Logging detallado para diagnóstico (sin exponer secretos completos)
console.log('🔍 [Cloudinary Config] Verificando variables de entorno...')
console.log(`  CLOUDINARY_CLOUD_NAME: ${cloudName ? `✓ "${cloudName.substring(0, 4)}..." (${cloudName.length} chars)` : '✗ FALTA'}`)
console.log(`  CLOUDINARY_API_KEY: ${apiKey ? `✓ "${apiKey.substring(0, 4)}..." (${apiKey.length} chars)` : '✗ FALTA'}`)
console.log(`  CLOUDINARY_API_SECRET: ${apiSecret ? `✓ "${apiSecret.substring(0, 4)}..." (${apiSecret.length} chars)` : '✗ FALTA'}`)

if (!cloudName || !apiKey || !apiSecret) {
  console.error('⚠️ ERROR: Variables de entorno de Cloudinary faltantes o vacías')
  console.error('Por favor, configura estas variables en tu archivo .env.local o en Vercel')
  console.error('NOTA: Si las variables están configuradas pero aparecen vacías, verifica:')
  console.error('  1. Que el archivo .env.local esté en la raíz del proyecto')
  console.error('  2. Que no haya espacios antes/después del signo =')
  console.error('  3. Que reinicies el servidor después de agregar las variables')
} else {
  // Configurar Cloudinary solo si todas las variables están presentes
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    })
    
    // Verificar que la configuración se aplicó correctamente
    const config = cloudinary.config()
    console.log(`✅ [Cloudinary Config] Configuración aplicada: cloud_name="${config.cloud_name || 'NO CONFIGURADO'}"`)
    
    if (!config.cloud_name || config.cloud_name !== cloudName) {
      console.error('⚠️ ERROR: Cloudinary no se configuró correctamente')
      console.error(`  Esperado: "${cloudName}"`)
      console.error(`  Obtenido: "${config.cloud_name || 'undefined'}"`)
      console.error('  Esto puede indicar que el cloud_name está deshabilitado en tu cuenta de Cloudinary')
      console.error('  Verifica en: https://console.cloudinary.com/settings/account')
    } else {
      console.log('✅ [Cloudinary Config] Configuración exitosa')
    }
  } catch (error: any) {
    console.error('⚠️ ERROR al configurar Cloudinary:', error.message)
  }
}

export default cloudinary;