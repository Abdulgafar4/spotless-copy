import { Metadata } from "next"
import ServicesPage from "@/components/admin/services/services-page"

export const metadata: Metadata = {
  title: "Services Management - Domu Clean Admin",
  description: "Manage all services for Domu Clean.",
}

export default function AdminBranchesPage() {
  return <ServicesPage />
}