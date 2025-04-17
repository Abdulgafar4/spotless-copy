import ReschedulePage from "@/components/admin/reschedule/reschedule-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reschedule Requests - Spotless Transitions Admin",
  description: "Manage and respond to client reschedule requests.",
}

export default function AdminReschedulePage() {
  return <ReschedulePage />
}