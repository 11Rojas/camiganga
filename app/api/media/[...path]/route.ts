import { NextRequest, NextResponse } from "next/server"
import axios from 'axios'

const OPENINARY_URL = process.env.OPENINARY_URL || 'http://158.69.213.106:3000'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params

        // Verificar si hay path
        if (!path || path.length === 0) {
            return new NextResponse("Path not found", { status: 404 })
        }

        // Reconstruir el path (ej: ['t', 'uploads', 'image.jpg'] -> 't/uploads/image.jpg')
        const resourcePath = path.join('/')

        // Asegurarse de que no haya doble slash si OPENINARY_URL termina en slash
        const baseUrl = OPENINARY_URL.replace(/\/$/, '')
        const targetUrl = `${baseUrl}/${resourcePath}`

        // Obtener la imagen del servidor original
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            validateStatus: (status) => status < 500, // Permitir 404 para manejarlo nosotros
        })

        if (response.status === 404) {
            return new NextResponse("Image not found", { status: 404 })
        }

        if (response.status >= 400) {
            console.error(`Error upstream ${response.status} for ${targetUrl}`)
            return new NextResponse("Error fetching image", { status: 502 })
        }

        // Preparar headers
        const headers = new Headers()
        const contentType = response.headers['content-type']
        if (contentType) {
            headers.set('Content-Type', contentType)
        } else {
            // Intentar adivinar o usar fallback
            headers.set('Content-Type', 'application/octet-stream')
        }

        // Cache agresivo ya que las imágenes suelen ser inmutables o tener nombres únicos
        headers.set('Cache-Control', 'public, max-age=31536000, immutable') // 1 año

        return new NextResponse(response.data, {
            status: 200,
            headers,
        })

    } catch (error: any) {
        console.error("Error proxying image:", error.message)
        return new NextResponse("Error server error", { status: 500 })
    }
}
