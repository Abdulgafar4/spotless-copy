import { Metadata } from "next"
import FeedbackPage from "@/components/admin/feedback/feedback-page"

export const metadata: Metadata = {
  title: "Customer Feedback - Domu Clean Admin",
  description: "View and manage customer reviews and feedback.",
}

export default function AdminFeedbackPage() {
  return <FeedbackPage />
}