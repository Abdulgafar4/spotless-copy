"use client";

import React from "react";
import { usePathname } from "next/navigation";
import PageHeader from "../page-header";
import SidebarCard from "@/components/admin/sidebar";
import {
  BarChart3,
  Building,
  Calendar,
  Users,
  Mail,
  FileText,
  Star,
  Settings,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Branches", href: "/admin/branches", icon: Building },
    { name: "Scheduling", href: "/admin/scheduling", icon: Calendar },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Inquiries", href: "/admin/inquiries", icon: Mail },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Feedback", href: "/admin/feedback", icon: Star },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const currentPage = navigation.find((nav) => pathname === nav.href);

  const title = currentPage?.name || "Unknown";
  const headerHref = currentPage?.href || pathname;

  const breadcrumbs = [
    { label: "ADMIN", href: "/admin" },
    { label: title.toUpperCase(), href: headerHref, current: true },
  ];

  return (
    <div className="min-h-screen mt-28">
      <div className="md:container mx-auto">
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <main className="flex flex-col lg:flex-row p-4 gap-4">
          <div className="w-1/4">
            <SidebarCard />
          </div>

          <div className="w-full lg:w-3/4">{children}</div>
        </main>
      </div>
    </div>
  );
}
