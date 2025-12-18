"use client"

import TicketVerifier from "@/components/TicketVerifier"

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-gray-100 overflow-x-hidden w-full max-w-full">
      <div className="max-w-4xl mx-auto px-4 py-4 w-full overflow-x-hidden">
        <TicketVerifier />
      </div>
    </main>
  )
}