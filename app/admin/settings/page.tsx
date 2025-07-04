import { Metadata } from "next"
import SettingsPage from "@/components/admin/settings/settings-page"

export const metadata: Metadata = {
  title: "Admin Settings - Domu Clean",
  description: "Configure system settings for Domu Clean services.",
}

export default function AdminSettingsPage() {
  return <SettingsPage />
}