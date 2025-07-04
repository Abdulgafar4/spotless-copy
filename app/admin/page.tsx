import { Metadata } from "next"
import AdminDashboardPage from "@/components/admin/admin-page"

export const metadata: Metadata = {
  title: "Admin Dashboard - Domu Clean",
  description: "Administrative dashboard for Domu Clean.",
}

export default function AdminPage() {
  return <AdminDashboardPage />
}