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
  NotebookText,
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
    { name: "Bookings", href: "/admin/bookings", icon: NotebookText },
    { name: "Employees", href: "/admin/employees", icon: NotebookText },
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
      <div className="md:container mx-auto px-4"> {/* Added px-4 for consistent padding */}
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <main className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/5 mt-5"> {/* Adjusted to 1/5 for sidebar */}
            <SidebarCard />
          </div>
  
          <div className="w-full lg:w-4/5"> {/* Adjusted to 4/5 for main content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
