import { Metadata } from "next"
import BranchesPage from "@/components/admin/branches/branches-page"

export const metadata: Metadata = {
  title: "Branches Management - Spotless Transitions Admin",
  description: "Manage all branch locations for Spotless Transitions.",
}

export default function AdminBranchesPage() {
  return <BranchesPage />
}