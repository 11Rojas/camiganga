export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}

export interface Raffle {
  _id: string
  title: string
  description: string
  image?: string
  ticketPrice: number
  totalNumbers: number
  soldNumbers?: number[]
  drawDate: string
  initialProgress?: number
  status: "active" | "completed" | "cancelled"
  winner?: {
    userId: string
    userName: string
    winningNumber: number
  }
  createdAt: string
  updatedAt: string
  // Propiedades adicionales calculadas
  soldCount?: number
  soldPercentage?: number
}

export interface Purchase {
  _id: string
  userId: string
  raffleId: string
  numbers: number[]
  totalAmount: number
  paymentMethod: "zelle" | "pago-movil" | "mercado-pago"
  paymentData: {
    email?: string
    phone?: string
    reference: string
    receipt?: string
    notes?: string
  }
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface ExchangeRate {
  _id: string
  rate: number
  updatedBy: string
  updatedAt: string
}

export interface Analytics {
  totalUsers: number
  totalRaffles: number
  totalSales: number
  pendingPayments: number
  monthlyRevenue: number[]
  popularRaffles: {
    raffleId: string
    title: string
    salesCount: number
  }[]
}
