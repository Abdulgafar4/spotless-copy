import { Metadata } from "next"
import ServicesPage from "@/components/admin/services/services-page"

export const metadata: Metadata = {
  title: "Services Management - Spotless Transitions Admin",
  description: "Manage all services for Spotless Transitions.",
}

export default function AdminBranchesPage() {
  return <ServicesPage />
}