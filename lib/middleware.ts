import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin")
    const isAdminLogin = req.nextUrl.pathname === "/admin/login"
    
    // Permitir acceso a la página de login de admin sin verificación adicional
    if (isAdminLogin) {
      return NextResponse.next()
    }
    
    // Si es una ruta de admin y el usuario no es admin, redirigir al login de admin
    if ((isAdminRoute || isAdminApi) && token?.role !== "admin") {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      } else {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
        const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin")
        const isAdminLogin = req.nextUrl.pathname === "/admin/login"
        
        // Permitir acceso a la página de login de admin sin autenticación
        if (isAdminLogin) {
          return true
        }
        
        // Si es una ruta de admin, requerir autenticación
        if (isAdminRoute || isAdminApi) {
          return !!token
        }
        
        // Para otras rutas, permitir acceso
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/raffles/:path*",
    "/api/purchases/:path*",
    "/api/exchange-rate/:path*",
    "/api/analytics/:path*"
  ]
}
