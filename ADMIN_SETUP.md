# Configuración del Panel de Administración

## 🔐 Sistema de Autenticación para Administradores

Este proyecto incluye un sistema de autenticación separado para administradores que protege todas las rutas y APIs del panel de administración.

## 📋 Características Implementadas

### ✅ **Página de Login Específica para Admin**
- **Ruta**: `/admin/login`
- **Diseño**: Interfaz específica para administradores
- **Validación**: Solo permite acceso a usuarios con rol "admin"

### ✅ **Protección de Rutas**
- **Middleware**: Protege automáticamente todas las rutas `/admin/*`
- **APIs Protegidas**: Todas las APIs de administración requieren autenticación
- **Redirección**: Usuarios no autorizados son redirigidos al login de admin

### ✅ **Separación de Usuarios**
- **Usuarios Regulares**: Acceden a `/login` y van al sitio principal
- **Administradores**: Acceden a `/admin/login` y van al panel de admin
- **Validación de Roles**: Verificación automática del rol de usuario

## 🚀 Configuración Inicial

### 1. Crear Usuario Administrador

Ejecuta el siguiente comando para crear un usuario administrador por defecto:

```bash
npm run create-admin
```

**Credenciales por defecto:**
- **Email**: `admin@rifasvelocistas.com`
- **Contraseña**: `admin123`

⚠️ **Importante**: Cambia la contraseña después del primer inicio de sesión.

### 2. Verificar Configuración

Asegúrate de que las siguientes variables de entorno estén configuradas:

```env
NEXTAUTH_SECRET=tu_secreto_aqui
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=tu_uri_de_mongodb
```

## 🔒 Rutas Protegidas

### **Páginas de Admin**
- `/admin` - Panel principal
- `/admin/login` - Login específico para admin

### **APIs Protegidas**
- `/api/raffles/*` - Gestión de rifas
- `/api/purchases/*` - Gestión de pagos
- `/api/exchange-rate/*` - Tasa de cambio
- `/api/analytics/*` - Analíticas

## 🎯 Flujo de Autenticación

### **Para Administradores:**
1. Ir a `/admin/login`
2. Ingresar credenciales de admin
3. Sistema verifica rol "admin"
4. Redirige a `/admin` si es válido
5. Muestra error si no es admin

### **Para Usuarios Regulares:**
1. Ir a `/login`
2. Ingresar credenciales
3. Si es admin, redirige a `/admin`
4. Si es usuario regular, redirige a `/`

## 🛡️ Seguridad

### **Middleware de Protección**
- Verifica autenticación en cada request
- Valida rol de usuario
- Redirige automáticamente si no está autorizado

### **APIs Seguras**
- Todas las operaciones CRUD requieren autenticación de admin
- Validación de sesión en cada endpoint
- Respuestas de error apropiadas para acceso no autorizado

## 🔧 Personalización

### **Cambiar Credenciales por Defecto**
Edita el archivo `scripts/create-admin.js` para cambiar:
- Email del administrador
- Contraseña por defecto
- Nombre del usuario

### **Agregar Más Administradores**
Puedes crear más usuarios administradores manualmente en la base de datos o crear un script adicional.

## 🚨 Solución de Problemas

### **Error: "Acceso denegado"**
- Verifica que el usuario tenga rol "admin"
- Asegúrate de estar usando `/admin/login` para administradores
- Revisa que la sesión esté activa

### **Error: "No autorizado"**
- Verifica que estés autenticado
- Revisa las variables de entorno de NextAuth
- Asegúrate de que la base de datos esté conectada

### **Middleware no funciona**
- Verifica que el archivo `lib/middleware.ts` esté configurado correctamente
- Asegúrate de que las rutas estén incluidas en el matcher
- Revisa los logs del servidor para errores

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que todas las dependencias estén instaladas
2. Revisa los logs del servidor
3. Asegúrate de que la base de datos esté funcionando
4. Verifica las variables de entorno 