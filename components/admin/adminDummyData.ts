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

export  const initialBranches: Branch[] = [
    { 
      id: 1, 
      name: "Toronto Downtown", 
      address: "123 Queen Street West, Toronto, ON", 
      phone: "416-555-0100", 
      manager: "John Smith", 
      status: "active",
      employees: 12,
      openDate: "2022-03-15"
    },
    { 
      id: 2, 
      name: "Mississauga", 
      address: "456 Burnhamthorpe Road, Mississauga, ON", 
      phone: "905-555-0200", 
      manager: "Sarah Johnson", 
      status: "active",
      employees: 8,
      openDate: "2022-05-22"
    },
    { 
      id: 3, 
      name: "North York", 
      address: "789 Yonge Street, North York, ON", 
      phone: "416-555-0300", 
      manager: "Michael Wong", 
      status: "active",
      employees: 10,
      openDate: "2022-07-10"
    },
    { 
      id: 4, 
      name: "Scarborough", 
      address: "321 Markham Road, Scarborough, ON", 
      phone: "416-555-0400", 
      manager: "Emily Davis", 
      status: "inactive",
      employees: 0,
      openDate: "2023-01-05"
    },
    { 
      id: 5, 
      name: "Etobicoke", 
      address: "654 The Queensway, Etobicoke, ON", 
      phone: "416-555-0500", 
      manager: "Robert Brown", 
      status: "active",
      employees: 6,
      openDate: "2023-02-18"
    },
    { 
      id: 6, 
      name: "Ottawa Central", 
      address: "987 Bank Street, Ottawa, ON", 
      phone: "613-555-0600", 
      manager: "Jennifer Wilson", 
      status: "active",
      employees: 9,
      openDate: "2023-04-01"
    },
    { 
      id: 7, 
      name: "Kitchener", 
      address: "147 King Street East, Kitchener, ON", 
      phone: "519-555-0700", 
      manager: "David Miller", 
      status: "pending",
      employees: 4,
      openDate: "2023-08-15"
    },
  ]
  
  // Mock inquiries data
export const mockInquiries = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "416-555-1234",
    subject: "Quote Request for Move-Out Cleaning",
    message: "I'm moving out of my apartment on May 15th and need a quote for a thorough cleaning. It's a 2-bedroom, 1-bathroom unit approximately 850 sq ft. Could you provide pricing and availability?",
    date: "2025-04-05T14:32:00",
    status: "new",
    assignedTo: null,
    responses: []
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "647-555-9876",
    subject: "Question about Services",
    message: "Do your cleaning services include cleaning inside appliances like the oven and refrigerator? Also, do you offer any packages that include window cleaning?",
    date: "2025-04-04T10:15:00",
    status: "in-progress",
    assignedTo: "Lisa Wong",
    responses: [
      {
        id: 1,
        date: "2025-04-04T11:30:00",
        staff: "Lisa Wong",
        message: "Hello Sarah, Yes, our deep cleaning services include cleaning inside appliances. I've sent you our service packages via email. Let me know if you need any clarification."
      }
    ]
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "mchen@example.com",
    phone: "416-555-5678",
    subject: "Booking Confirmation",
    message: "I booked a cleaning service for April 10th but haven't received a confirmation email. Could you please confirm if my booking was successful?",
    date: "2025-04-03T16:45:00",
    status: "resolved",
    assignedTo: "David Parker",
    responses: [
      {
        id: 1,
        date: "2025-04-03T17:20:00",
        staff: "David Parker",
        message: "Hi Michael, I've checked our system and can confirm your booking for April 10th at 9:00 AM. I've also resent the confirmation email to your address. Please check your spam folder if you don't see it."
      }
    ]
  },
  {
    id: 4,
    name: "Amanda Wilson",
    email: "awilson@example.com",
    phone: "905-555-7890",
    subject: "Service Complaint",
    message: "I'm disappointed with the cleaning service I received yesterday. Several areas were missed, including the bathroom sink and shower. I'd like to discuss how this can be resolved.",
    date: "2025-04-02T13:10:00",
    status: "urgent",
    assignedTo: "Robert Johnson",
    responses: [
      {
        id: 1,
        date: "2025-04-02T13:45:00",
        staff: "Robert Johnson",
        message: "I'm very sorry to hear about your experience, Amanda. I'll arrange for a team to revisit your property at no additional cost. When would be a convenient time for you?"
      },
      {
        id: 2,
        date: "2025-04-02T14:30:00",
        staff: "Amanda Wilson",
        message: "Thank you for the quick response. Tomorrow afternoon would work for me, anytime after 2pm."
      }
    ]
  },
  {
    id: 5,
    name: "Jennifer Lee",
    email: "jlee@example.com",
    phone: "416-555-4321",
    subject: "Pricing Inquiry",
    message: "I'd like to get a quote for regular bi-weekly cleaning for my 3-bedroom house in Etobicoke. What would be the cost, and do you offer any discounts for recurring services?",
    date: "2025-04-01T09:20:00",
    status: "new",
    assignedTo: null,
    responses: []
  },
  {
    id: 6,
    name: "Robert Davis",
    email: "rdavis@example.com",
    phone: "905-555-2468",
    subject: "Special Request",
    message: "I'm planning to book your service but have allergies to certain cleaning products. Can you use hypoallergenic and fragrance-free products for my cleaning?",
    date: "2025-03-31T11:55:00",
    status: "in-progress",
    assignedTo: "Lisa Wong",
    responses: [
      {
        id: 1,
        date: "2025-03-31T13:15:00",
        staff: "Lisa Wong",
        message: "Hi Robert, We absolutely can accommodate your request for hypoallergenic products. We have several options available. I'll note this in your customer profile so all future bookings will include this requirement."
      }
    ]
  },
  {
    id: 7,
    name: "Emily Thompson",
    email: "emily.t@example.com",
    phone: "647-555-1357",
    subject: "Availability Check",
    message: "I need a move-out cleaning done by the end of next week. Do you have any available slots on either Thursday or Friday?",
    date: "2025-03-30T15:40:00",
    status: "resolved",
    assignedTo: "David Parker",
    responses: [
      {
        id: 1,
        date: "2025-03-30T16:30:00",
        staff: "David Parker",
        message: "Hello Emily, Yes, we have availability on both Thursday and Friday next week. I'd recommend booking as soon as possible to secure your preferred time slot. Would you like me to help you schedule this?"
      }
    ]
  },
]