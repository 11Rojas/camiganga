"use client"

import { usePathname } from "next/navigation"
import Footer from "./Footer"

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // No mostrar footer en rutas de adminlll
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <Footer />
}
