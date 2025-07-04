import { Metadata } from "next"
import CustomersPage from "@/components/admin/customers/customers-page"

export const metadata: Metadata = {
  title: "Customer Management - Domu Clean Admin",
  description: "View and manage customer information and booking history.",
}

export default function AdminCustomersPage() {
  return <CustomersPage />
}