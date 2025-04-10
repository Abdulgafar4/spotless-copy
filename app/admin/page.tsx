import { Metadata } from "next"
import AdminDashboardPage from "@/components/admin/admin-page"

export const metadata: Metadata = {
  title: "Admin Dashboard - Spotless Transitions",
  description: "Administrative dashboard for Spotless Transitions.",
}

export default function AdminPage() {
  return <AdminDashboardPage />
}