"use client";

import AdminLayout from "@/components/admin/admin-layout";
import ReportsPage from "./reports/reports-page";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="px-4 py-8 w-full">
        <ReportsPage />
      </div>
    </AdminLayout>
  );
}
