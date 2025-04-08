import {
    BarChart, Calendar, PieChart, TrendingUp, FileText,
    Users,
    Building,
    BarChart3,
    Mail,
    Star,
    Settings,
  } from "lucide-react"

export const branchPerformanceData = [
    {
      branch: "Toronto Downtown",
      bookings: 245,
      revenue: 45678.50,
      growth: 12.5,
      customers: 189,
      staff: 12,
      utilization: 85.3
    },
    {
      branch: "Mississauga",
      bookings: 198,
      revenue: 37432.75,
      growth: 8.2,
      customers: 152,
      staff: 8,
      utilization: 78.9
    },
    {
      branch: "North York",
      bookings: 176,
      revenue: 32145.25,
      growth: 15.7,
      customers: 134,
      staff: 10,
      utilization: 92.1
    },
    {
      branch: "Scarborough",
      bookings: 95,
      revenue: 19876.50,
      growth: -2.3,
      customers: 78,
      staff: 6,
      utilization: 65.4
    },
    {
      branch: "Etobicoke",
      bookings: 132,
      revenue: 27654.25,
      growth: 5.9,
      customers: 105,
      staff: 7,
      utilization: 71.8
    },
    {
      branch: "Ottawa Central",
      bookings: 187,
      revenue: 35432.75,
      growth: 18.4,
      customers: 146,
      staff: 9,
      utilization: 88.5
    },
    {
      branch: "Kitchener",
      bookings: 89,
      revenue: 16789.50,
      growth: 11.2,
      customers: 72,
      staff: 4,
      utilization: 74.2
    },
  ] 
export const revenueData = {
    totalRevenue: 214987.50,
    growth: 14.5,
    averageBookingValue: 196.35,
    totalBookings: 1122,
    bookingsGrowth: 8.7,
    activeCustomers: 876,
    customersGrowth: 12.3,
    activeBranches: 10,
  }
 export const tabs = [
    { value: "revenue", label: "Revenue", icon: TrendingUp },
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "services", label: "Services", icon: PieChart },
    { value: "reports", label: "Reports", icon: FileText },
  ]
export const dateRanges = [
    "today", "this-week", "last-week", "this-month",
    "last-month", "this-quarter", "this-year", "custom",
  ]
export  const branches = [
    { value: "all", label: "All Branches" },
    { value: "toronto", label: "Toronto Downtown" },
    { value: "mississauga", label: "Mississauga" },
    { value: "north-york", label: "North York" },
    { value: "scarborough", label: "Scarborough" },
    { value: "etobicoke", label: "Etobicoke" },
    { value: "ottawa", label: "Ottawa Central" },
    { value: "kitchener", label: "Kitchener" },
  ]
export const metrics = [
    {
      title: "Total Revenue",
      icon: BarChart,
      value: `$${revenueData.totalRevenue.toLocaleString()}`,
      growth: revenueData.growth,
      subtitle: "from previous period",
    },
    {
      title: "Total Bookings",
      icon: Calendar,
      value: revenueData.totalBookings,
      growth: revenueData.bookingsGrowth,
      subtitle: "from previous period",
    },
    {
      title: "Active Customers",
      icon: Users,
      value: revenueData.activeCustomers,
      subtitle: "Per booking average",
    },
    {
      title: "Active Branches",
      icon: Building,
      value: `${revenueData.activeBranches}%`,
      subtitle: "this month",
    },
  ]

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
      href: "/admin/staffs",
      icon: FileText,
      current: pathname === "/admin/staffs",
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: Star,
      current: pathname === "/admin/feedback",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    },
  ];