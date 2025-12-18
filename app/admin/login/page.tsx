"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("=== LOGIN DEBUG ===")
      console.log("SignIn result:", result)

      if (result?.error) {
        console.log("SignIn error:", result.error)
        setError("Credenciales inválidas")
      } else {
        const session = await getSession()
        console.log("Session after login:", session)
        console.log("User role:", session?.user?.role)
        console.log("Is admin:", session?.user?.role === "admin")
        
        if (session?.user?.role === "admin") {
          console.log("User is admin, redirecting to /admin")
          // Usar push en lugar de replace y agregar un pequeño delay
          setTimeout(() => {
            router.push("/admin")
          }, 100)
        } else {
          console.log("User is not admin, showing error")
          setError("Acceso denegado. Solo administradores pueden acceder.")
        }
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#febd59] to-[#e6a84f] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold gradient-text">CAMIGANGA</span>
          </div>
          <p className="text-gray-400 text-sm">CAMIGANGA - Acceso Administrativo</p>
        </div>

        <Card className="bg-gray-900 border-[#febd59]/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Acceso Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white text-sm">
                  Email de Administrador
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="admin@camiganga.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full btn-gold">
                {isLoading ? "Verificando acceso..." : "Acceder al Panel"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Eres usuario regular?{" "}
                <Link href="/" className="text-[#febd59] hover:text-[#ffd166]">
                  Ir al sitio principal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 