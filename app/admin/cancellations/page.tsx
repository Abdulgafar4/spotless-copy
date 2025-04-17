import { Metadata } from "next"
import CancellationsPage from "@/components/admin/cancellation/cancellation-page"

export const metadata: Metadata = {
  title: "Cancellation Requests - Spotless Transitions Admin",
  description: "Manage and respond to client cancellation requests.",
}

export default function AdminCancellationsPage() {
  return <CancellationsPage />
}