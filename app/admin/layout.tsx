import type React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - Spotless Transitions",
  description:
    "Administrative dashboard for managing Spotless Transitions services, branches, and customers.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}