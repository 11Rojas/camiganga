# Configuración para Vercel

## Variables de Entorno Requeridas

Agregar estas variables en el dashboard de Vercel:

### Base de Datos
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rifas
```

### NextAuth
```
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-key-super-seguro
```

### Cloudinary
```
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### SMTP para Nodemailer (Gmail)
```
SMTP_USER=emanueljoserojascuartas4@gmail.com
SMTP_PASS=qgfs xtkl gggt qznh
SMTP_FROM=Gana con Neomar <noreply@ganaconneomar.com>
```

### Exchange Rate API
```
EXCHANGE_RATE_API_KEY=tu-api-key
```

## Configuración de Gmail para SMTP

1. Habilitar 2FA en tu cuenta de Gmail
2. Generar una "App Password" específica para la aplicación
3. Usar esa App Password como SMTP_PASS

## Configuración de Nodemailer para Vercel

El archivo `lib/mailer.ts` ya está configurado para funcionar en Vercel con:
- Pooling deshabilitado
- Conexiones limitadas
- Rate limiting
- Cierre automático de conexiones

## Deploy

```bash
vercel --prod
```

## Verificación

Después del deploy, verificar que:
1. Las variables de entorno estén configuradas
2. La base de datos esté conectada
3. Los emails se envíen correctamente
4. Las imágenes se suban a Cloudinary
