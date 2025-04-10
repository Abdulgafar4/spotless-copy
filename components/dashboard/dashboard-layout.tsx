"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Home, FileText, Calendar, CreditCard, Clock, X, ImageIcon, User, Menu } from "lucide-react"
import PageHeader from "../page-header"
import ClientSidebar from "./sidebar"


interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

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

  const currentPage = navigation.find((nav) => pathname === nav.href);

  const title = currentPage?.name || "Unknown";
  const headerHref = currentPage?.href || pathname;

  const breadcrumbs = [
    { label: "ADMIN", href: "/admin" },
    { label: title.toUpperCase(), href: headerHref, current: true },
  ];

  return (
    <div className="min-h-screen mt-28">
      <div className="md:container mx-auto px-4"> 
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <main className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/4 mt-16"> 
            <ClientSidebar  pathname={pathname}/>
          </div>
  
          <div className="w-full lg:w-3/4 mt-16"> 
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

