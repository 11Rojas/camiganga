"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminDashboard from "@/components/admin/AdminDashboard"
import RaffleManagement from "@/components/admin/RaffleManagement"
import PaymentManagement from "@/components/admin/PaymentManagement"
import ExchangeRateManager from "@/components/admin/ExchangeRateManager"
import Analytics from "@/components/admin/Analytics"

type AdminView = "dashboard" | "raffles" | "payments" | "exchange" | "analytics"

// Extender el tipo de sesión para incluir el rol
interface ExtendedSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const router = useRouter()

  useEffect(() => {
    console.log("=== ADMIN PAGE DEBUG ===")
    console.log("Status:", status)
    console.log("Session:", session)
    console.log("User role:", session?.user?.role)
    console.log("Is admin check:", session?.user?.role === "admin")
    
    // Solo redirigir si definitivamente no está autenticado
    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to login")
      router.replace("/admin/login")
      return
    }

    // Solo redirigir si está autenticado pero no es admin
    // Agregar un pequeño delay para evitar redirecciones prematuras
    if (status === "authenticated" && session?.user?.role && session?.user?.role !== "admin") {
      console.log("User is not admin, redirecting to login")
      console.log("Expected role: admin, Actual role:", session?.user?.role)
      setTimeout(() => {
        router.replace("/admin/login")
      }, 500)
      return
    }
  }, [session, status, router])

  // Mostrar loading mientras verifica autenticación
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar loading mientras redirige
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado pero no es admin, mostrar loading mientras redirige
  if (status === "authenticated" && session?.user?.role && session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado pero no tiene rol definido aún, mostrar loading
  if (status === "authenticated" && !session?.user?.role) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  // Si llegamos aquí, el usuario está autenticado y es admin
  console.log("Rendering admin panel for user:", session.user.email)

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <AdminDashboard />
      case "raffles":
        return <RaffleManagement />
      case "payments":
        return <PaymentManagement />
      case "exchange":
        return <ExchangeRateManager />
      case "analytics":
        return <Analytics />
      default:
        return <AdminDashboard />
    }
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view as AdminView)
  }

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 p-6 bg-gray-50 overflow-x-hidden">{renderContent()}</main>
    </div>
  )
}
