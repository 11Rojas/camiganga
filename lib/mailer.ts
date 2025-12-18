import nodemailer from 'nodemailer'
import siteConfig from '@/config/site'
import { config } from 'process'
import path from 'path'
import fs from 'fs'

// Configuración del transporter de Nodemailer para Vercel (serverless)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
  try {
    // Crear transporter en cada llamada para serverless
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments: attachments || []
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
    // Cerrar la conexión para serverless
    transporter.close()
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Función para enviar notificación de compra
export const sendPurchaseNotification = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  reference: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #febd59;">¡Compra Confirmada!</h2>
      <p>Hola ${purchaseData.name},</p>
      <p>Tu compra ha sido registrada exitosamente:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Compra:</h3>
        <p><strong>Rifa:</strong> ${purchaseData.raffleTitle}</p>
        <p><strong>Números:</strong> ${purchaseData.numbers.join(', ')}</p>
        <p><strong>Total:</strong> $${purchaseData.totalAmount}</p>
        <p><strong>Método de Pago:</strong> ${purchaseData.paymentMethod}</p>
        <p><strong>Referencia:</strong> ${purchaseData.reference}</p>
      </div>
      
      
      <p>¡Gracias por participar!</p>
      <p><strong>${siteConfig.siteName}</strong></p>
    </div>
  `

  return await sendEmail(purchaseData.email, `Compra Confirmada - ${siteConfig.siteName}`, html)
}

// Función para enviar email de aprobación de compra
export const sendPurchaseApprovalEmail = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  drawDate?: string
  phone?: string
  raffleImage?: string
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // Formatear fecha del sorteo
  const drawDate = purchaseData.drawDate ? new Date(purchaseData.drawDate) : new Date()
  const drawDateFormatted = drawDate.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Caracas"
  }).toUpperCase().replace(/\./g, "")
  const drawTimeFormatted = drawDate.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Caracas"
  }).toUpperCase()
  
  // Formatear fecha de creación
  const createdDate = new Date()
  const createdDateFormatted = createdDate.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Caracas"
  })
  const createdTimeFormatted = createdDate.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Caracas"
  })
  
  // Estado de verificación
  const statusText = 'APROBADA'
  
  // Teléfono
  const phoneDisplay = purchaseData.phone ? `+58 ${purchaseData.phone}` : ""
  
  // URL del logo - usar CID si está disponible, sino URL
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoExists = fs.existsSync(logoPath)
  const logoUrl = logoExists ? 'cid:logo' : `${siteUrl}/logo.png`
  const raffleImageUrl = purchaseData.raffleImage ? (purchaseData.raffleImage.startsWith('http') ? purchaseData.raffleImage : `${siteUrl}${purchaseData.raffleImage}`) : null

  // Generar un boleto por cada número - usando el modelo exacto del verificador
  const ticketsHtml = purchaseData.numbers.map((ticketNumber) => {
    const ticketNumberFormatted = ticketNumber.toString().padStart(4, '0')
    
    return `
      <div style="max-width: 350px; margin: 0 auto 40px; font-family: Arial, sans-serif;">
        <!-- Ticket Widget - Modelo exacto del verificador -->
        <div style="background: white; border-radius: 0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: relative;">
          
          <!-- Barra Roja Superior con Logo -->
          <div style="background: transparent; padding: 8px 0; display: flex; align-items: center; justify-content: center; width: 100%;">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
              <img src="${logoUrl}" alt="CAMIGANGA" style="width: 100%; height: auto; max-height: 50px; object-fit: contain;" />
            </div>
          </div>
          
          <!-- Sección Principal con Imagen -->
          <div style="background: #032a3d; padding: 0; position: relative; min-height: 240px;">
            ${raffleImageUrl ? `
            <!-- Imagen de fondo -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;">
              <img src="${raffleImageUrl}" alt="Background" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            ` : ''}
            
            <!-- Overlay -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(3,42,61,0.7) 0%, rgba(3,42,61,0.9) 100%); z-index: 1;"></div>
            
            <!-- Contenido -->
            <div style="position: relative; z-index: 2; padding: 15px;">
              <div style="text-align: center; margin-bottom: 8px; color: white; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;"></div>
              <div style="text-align: center; margin-bottom: 12px; color: white; font-size: 19px; font-weight: 900; text-transform: uppercase;">
                ${purchaseData.raffleTitle.toUpperCase()}
              </div>
            </div>
            
            <!-- Info Box -->
            <div style="position: absolute; bottom: 5px; left: 15px; background: transparent; padding: 10px; border-radius: 8px; color: white; font-size: 13px; line-height: 1.6; text-align: left; width: calc(100% - 30px); z-index: 10;">
              <div style="margin-bottom: 3px; font-weight: bold; color: white;">Verificación ${statusText}</div>
              <div style="margin-bottom: 3px; font-weight: bold; color: white;">${purchaseData.name.length > 15 ? purchaseData.name.substring(0, 15) + '...' : purchaseData.name}</div>
              ${phoneDisplay ? `<div style="margin-bottom: 3px; font-weight: bold; color: white;">${phoneDisplay.substring(0, 4)}****${phoneDisplay.substring(phoneDisplay.length - 2)}</div>` : ''}
              <div style="margin-bottom: 3px; font-weight: bold; color: white;">${createdDateFormatted} ${createdTimeFormatted}</div>
            </div>
          </div>
          
          <!-- Sección de Fecha y Hora -->
          <div style="background: #032a3d; padding: 15px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: white; font-size: 14px; font-weight: 900; margin-bottom: 10px; text-transform: uppercase;">
              <span>${drawDateFormatted}</span>
              <span>${drawTimeFormatted}</span>
            </div>
            <div style="border-top: 2px dashed rgba(255,255,255,0.6); margin-top: 8px;"></div>
          </div>
          
          <!-- Sección del Número -->
          <div style="background: #032a3d; padding: 20px 18px 25px; position: relative;">
            <div style="background: white; border: 2px dashed #032a3d; padding: 20px 12px; text-align: center; margin: 0 auto; max-width: 180px;">
              <div style="color: #032a3d; font-size: 48px; font-weight: 900; letter-spacing: 5px; font-family: Arial, sans-serif; line-height: 1;">
                ${ticketNumberFormatted}
              </div>
            </div>
            <!-- Círculos rojos -->
            <div style="position: absolute; bottom: -8px; left: -8px; width: 16px; height: 16px; background: #dc2626; border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -8px; right: -8px; width: 16px; height: 16px; background: #dc2626; border-radius: 50%;"></div>
          </div>
        </div>
      </div>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎫 Tu Ticket - ${siteConfig.siteName}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #032a3d; margin: 0;">¡Compra Aprobada!</h2>
        <p style="color: #666; margin: 10px 0;">Hola ${purchaseData.name},</p>
        <p style="color: #666;">Tu compra ha sido aprobada exitosamente. Aquí están tus tickets:</p>
      </div>
      
      ${ticketsHtml}
      
      <!-- Información adicional -->
      <div style="max-width: 350px; margin: 20px auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3 style="color: #032a3d; margin-top: 0;">Detalles de la Compra</h3>
        <p style="margin: 8px 0;"><strong>Números:</strong> ${purchaseData.numbers.map(n => n.toString().padStart(4, '0')).join(', ')}</p>
        <p style="margin: 8px 0;"><strong>Total:</strong> $${purchaseData.totalAmount.toFixed(2)}</p>
        <p style="margin: 8px 0;"><strong>Método de Pago:</strong> ${purchaseData.paymentMethod === 'pago-movil2' ? 'Pago Móvil' : purchaseData.paymentMethod}</p>
        <p style="margin: 8px 0;"><strong>Estado:</strong> ✅ Aprobado</p>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #4caf50;">
          <p style="margin: 0; color: #2e7d32; font-weight: bold;">🎯 ¡Tu ticket está confirmado!</p>
          <p style="margin: 5px 0 0 0; color: #2e7d32;">Guarda este email como comprobante.</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Preparar el logo como archivo adjunto
  const attachments = []
  
  try {
    if (logoExists) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      })
    }
  } catch (error) {
    console.error('Error loading logo:', error)
  }

  return await sendEmail(purchaseData.email, `🎫 Tu Ticket - ${siteConfig.siteName}`, html, attachments)
}

// Función para enviar email de anuncio de ganador
export const sendWinnerAnnouncementEmail = async (winnerData: {
  email: string
  name: string
  raffleTitle: string
  winningNumber: number
  prize: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #febd59, #ffd166); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #023429; margin: 0; font-size: 2.5em;">🏆 ¡GANADOR! 🏆</h1>
        <p style="color: #023429; font-size: 1.2em; margin: 10px 0;">¡Felicidades!</p>
      </div>
      
      <p>Hola ${winnerData.name},</p>
      <p>¡INCREÍBLES NOTICIAS! Has ganado la rifa:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🎉 ¡GANASTE!</h3>
        <p><strong>Rifa:</strong> ${winnerData.raffleTitle}</p>
        <p><strong>Número Ganador:</strong> <span style="font-size: 1.5em; font-weight: bold; color: #febd59;">${winnerData.winningNumber}</span></p>
        <p><strong>Premio:</strong> ${winnerData.prize}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>📞 Próximos Pasos</h3>
        <p>Nos pondremos en contacto contigo en las próximas 24 horas para coordinar la entrega de tu premio.</p>
        <p><strong>¡Disfruta tu victoria!</strong></p>
      </div>
      
      <p>¡Gracias por participar en 🍀${siteConfig.siteName}!💫</p>
    </div>
  `

  return await sendEmail(winnerData.email, `¡GANASTE! - ${siteConfig.siteName}`, html)
}