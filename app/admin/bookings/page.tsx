import { Metadata } from "next"
import BookingsPage from "@/components/admin/bookings/bookings-page"

export const metadata: Metadata = {
  title: "Bookings Management - Spotless Transitions Admin",
  description: "View and manage all customer bookings and appointments.",
}

export default function AdminBookingsPage() {
  return <BookingsPage />
}