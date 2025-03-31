import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book a Service - Spotless Transitions",
  description:
    "Book our professional cleaning and repair services for your move-in, move-out, or property maintenance needs.",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

