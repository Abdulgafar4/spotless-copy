import { 
    Calendar, 
    FileText,
    Users,
    Building,
    BarChart3,
    Mail,
    Star,
    Settings,
    NotebookText,
    HandPlatter,
  } from "lucide-react"

export const getAdminNavigation = (pathname?: string) => [
    {
      name: "Overview",
      href: "/admin",
      icon: BarChart3,
      current: pathname === "/admin",
    },
    {
      name: "Branches",
      href: "/admin/branches",
      icon: Building,
      current:
        pathname === "/admin/branches" ||
        pathname?.startsWith("/admin/branches/"),
    },
    {
      name: "Scheduling",
      href: "/admin/scheduling",
      icon: Calendar,
      current: pathname === "/admin/scheduling",
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: NotebookText,
      current: pathname === "/admin/bookings",
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
      current: pathname === "/admin/customers",
    },
    {
      name: "Inquiries",
      href: "/admin/inquiries",
      icon: Mail,
      current: pathname === "/admin/inquiries",
    },
    {
      name: "Staffs",
      href: "/admin/employees",
      icon: FileText,
      current: pathname === "/admin/employees",
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: Star,
      current: pathname === "/admin/feedback",
    },
    {
      name: "Services",
      href: "/admin/services",
      icon: HandPlatter,
      current: pathname === "/admin/services",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    }
  ];