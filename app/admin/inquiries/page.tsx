import InquiriesPage from "@/components/admin/inquiries/inquiries-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Inquiries - Spotless Transitions Admin",
  description: "Manage and respond to customer inquiries, questions, and feedback.",
}

export default function AdminInquiriesPage() {
  return <InquiriesPage />
}