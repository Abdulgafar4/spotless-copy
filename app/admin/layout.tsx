import type React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - Domu Clean",
  description:
    "Administrative dashboard for managing Domu Clean services, branches, and customers.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}