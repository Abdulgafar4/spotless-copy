import { Metadata } from "next"
import BranchesPage from "@/components/admin/branches/branches-page"

export const metadata: Metadata = {
  title: "Branches Management - Domu Clean Admin",
  description: "Manage all branch locations for Domu Clean.",
}

export default function AdminBranchesPage() {
  return <BranchesPage />
}