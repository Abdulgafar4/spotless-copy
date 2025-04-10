import EmployeesPage from "@/components/admin/employees/employees-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employee Management - Spotless Transitions Admin",
  description: "Manage staff, assign roles, and track employee performance.",
}

export default function AdminEmployeesPage() {
  return <EmployeesPage />
}