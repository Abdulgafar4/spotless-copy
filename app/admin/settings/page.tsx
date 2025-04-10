import { Metadata } from "next"
import SettingsPage from "@/components/admin/settings/settings-page"

export const metadata: Metadata = {
  title: "Admin Settings - Spotless Transitions",
  description: "Configure system settings for Spotless Transitions services.",
}

export default function AdminSettingsPage() {
  return <SettingsPage />
}