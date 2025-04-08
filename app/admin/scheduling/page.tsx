import { Metadata } from "next"
import SchedulingPage from "@/components/admin/scheduling/scheduling-page"

export const metadata: Metadata = {
  title: "Service Scheduling - Spotless Transitions Admin",
  description: "Schedule and manage service appointments for Spotless Transitions.",
}

export default function AdminSchedulingPage() {
  return <SchedulingPage />
}