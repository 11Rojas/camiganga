import FormData from 'form-data'
import axios from 'axios'

// Configuración de Openinary
const OPENINARY_URL = process.env.OPENINARY_URL || 'http://158.69.213.106:3000'
const OPENINARY_API_KEY = process.env.OPENINARY_API_KEY || 'mUqzktBdIHOKjfFTFnAdmLDeZNSdcpsgbSRRaHfGzvPbtfxziEnLqTspbBwSNgTN'

/**
 * Sube una imagen a Openinary
 */
export async function uploadToOpeninary(
  file: File | Buffer,
  folder: string = 'uploads',
  fileName?: string
): Promise<string> {
  try {
    // Convertir File a Buffer si es necesario
    let buffer: Buffer
    let originalFileName: string
    let contentType: string

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      originalFileName = file.name || fileName || 'image.jpg'
      contentType = file.type || 'image/jpeg'
    } else {
      buffer = file
      originalFileName = fileName || 'image.jpg'
      contentType = 'image/jpeg'
    }

    // Crear FormData
    const formData = new FormData()

    // Construir el path completo incluyendo el folder
    // El folder se incluye en el path del archivo, no como campo separado
    const filePath = folder && folder !== 'uploads'
      ? `${folder}/${originalFileName}`
      : originalFileName

    // CRÍTICO: Usar "files" (plural) como campo para el archivo
    formData.append('files', buffer, {
      filename: originalFileName, // Nombre del archivo sin path
      contentType: contentType, // Usar el tipo real del archivo
      knownLength: buffer.length,
    })

    // CRÍTICO: Enviar el path completo usando "names" para incluir el folder
    // Esto es lo que la API espera según el código fuente
    formData.append('names', filePath)

    // Obtener headers del FormData
    const formHeaders = formData.getHeaders()

    // Realizar la petición al endpoint correcto
    const response = await axios.post(
      `${OPENINARY_URL}/api/upload`, // Ruta de tu API Openinary
      formData,
      {


        headers: {
          'Authorization': `Bearer ${OPENINARY_API_KEY}`,
          ...formHeaders,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000,
      }
    )

    const result = response.data

    // Verificar que la respuesta sea exitosa
    if (!result.success) {
      const errorMsg = result.error || result.errors?.[0]?.error || 'Error desconocido del servidor'
      throw new Error(`Error del servidor: ${errorMsg}`)
    }

    // El servidor devuelve { success: true, files: [{ filename, path, size, url }] }
    if (!result.files || !result.files[0] || !result.files[0].url) {
      throw new Error('Respuesta del servidor no contiene URL válida')
    }

    // La URL viene como "/t/path.jpg" desde el servidor
    // Construir la URL proxy para ocultar el servidor real
    const relativeUrl = result.files[0].url
    // Retornamos una ruta relativa local que será manejada por nuestro proxy
    // Ejemplo: /api/media/t/rifas/imagen.jpg
    const fullUrl = `/api/media${relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl}`

    return fullUrl
  } catch (error: any) {
    console.error('Error al subir archivo a Openinary:', error.message)

    // Si hay respuesta del servidor, incluir más detalles
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data

      // Error 400: Bad Request (validación fallida, archivo muy grande, etc.)
      if (status === 400) {
        const errorMsg = errorData?.error || errorData?.errors?.[0]?.error || JSON.stringify(errorData)
        throw new Error(`Error 400: ${errorMsg}`)
      }

      // Otros errores del servidor
      throw new Error(`Error ${status}: ${errorData?.error || error.message}`)
    }

    // Error de red u otro error
    throw new Error(`Error al subir la imagen: ${error.message}`)
  }
}

/**
 * Sube un archivo (imagen) a Openinary
 * @param file - Archivo a subir
 * @param folder - Carpeta donde guardar el archivo (opcional)
 * @returns URL del archivo subido
 */
export async function uploadFileToOpeninary(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  return uploadToOpeninary(file, folder)
}

export default {
  upload: uploadToOpeninary,
  uploadFile: uploadFileToOpeninary,
}