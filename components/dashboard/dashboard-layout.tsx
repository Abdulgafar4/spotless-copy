"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Home, FileText, Calendar, CreditCard, Clock, X, ImageIcon, User, Menu } from "lucide-react"


interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "DASHBOARD", href: "/dashboard", icon: Home, current: pathname === "/dashboard" },
    { name: "OVERVIEW", href: "/dashboard/overview", icon: FileText, current: pathname === "/dashboard/overview" },
    { name: "MY PROFILE", href: "/dashboard/profile", icon: User, current: pathname === "/dashboard/profile" },
    {
      name: "BOOKING HISTORY",
      href: "/dashboard/booking-history",
      icon: FileText,
      current: pathname === "/dashboard/booking-history",
    },
    {
      name: "UPCOMING APPOINTMENTS",
      href: "/dashboard/appointments",
      icon: Calendar,
      current: pathname === "/dashboard/appointments",
    },
    {
      name: "PAYMENT & INVOICE",
      href: "/dashboard/payments",
      icon: CreditCard,
      current: pathname === "/dashboard/payments",
    },
    {
      name: "REQUEST RESCHEDULE",
      href: "/dashboard/reschedule",
      icon: Clock,
      current: pathname === "/dashboard/reschedule",
    },
    {
      name: "REQUEST CANCELLATION",
      href: "/dashboard/cancellation",
      icon: X,
      current: pathname === "/dashboard/cancellation",
    },
    {
      name: "MEDIA REVIEW",
      href: "/dashboard/media-review",
      icon: ImageIcon,
      current: pathname === "/dashboard/media-review",
    },
  ]

  return (
    <div className="min-h-screen mt-20">
        <div className="flex flex-col flex-1 px-6">
          <main className="flex-1">{children}</main>
        </div>
      </div>
  )
}

