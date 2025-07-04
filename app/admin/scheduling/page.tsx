import { Metadata } from "next"
import SchedulingPage from "@/components/admin/scheduling/scheduling-page"

export const metadata: Metadata = {
  title: "Service Scheduling - Domu Clean Admin",
  description: "Schedule and manage service appointments for Domu Clean.",
}

export default function AdminSchedulingPage() {
  return <SchedulingPage />
}