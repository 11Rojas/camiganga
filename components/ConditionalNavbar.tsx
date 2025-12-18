"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // No mostrar navbar en rutas de admin
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <Navbar />
}
