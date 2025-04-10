import {
    BarChart, Calendar, PieChart, TrendingUp, FileText,
    Users,
    Building,
    BarChart3,
    Mail,
    Star,
    Settings,
    NotebookText,
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
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    }
  ];

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

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: "Move-Out Cleaning",
    customer: "John Smith",
    address: "123 Main St, Toronto",
    date: "2025-04-07",
    time: "09:00",
    duration: "3 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["Emma Wilson", "David Lee"],
    phone: "416-555-9876"
  },
  {
    id: 2,
    title: "Deep Cleaning",
    customer: "Sarah Johnson",
    address: "456 Queen St, Toronto",
    date: "2025-04-07",
    time: "13:00",
    duration: "4 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["Michael Brown", "Jessica Clark"],
    phone: "416-555-1234"
  },
  {
    id: 3,
    title: "Appliance Cleaning",
    customer: "Robert Davis",
    address: "789 King St, Mississauga",
    date: "2025-04-08",
    time: "10:00",
    duration: "2 hours",
    branch: "Mississauga",
    status: "pending",
    staff: ["Kevin Wilson"],
    phone: "905-555-8765"
  },
  {
    id: 4,
    title: "Move-In Cleaning",
    customer: "Jennifer Miller",
    address: "321 Elm St, Toronto",
    date: "2025-04-09",
    time: "14:00",
    duration: "3 hours",
    branch: "North York",
    status: "confirmed",
    staff: ["Laura Taylor", "Mark Anderson"],
    phone: "416-555-4321"
  },
  {
    id: 5,
    title: "Carpet Cleaning",
    customer: "Daniel Wilson",
    address: "654 Oak St, Mississauga",
    date: "2025-04-10",
    time: "11:00",
    duration: "2 hours",
    branch: "Mississauga",
    status: "cancelled",
    staff: ["Susan White"],
    phone: "905-555-2345"
  },
  {
    id: 6,
    title: "Window Cleaning",
    customer: "Linda Thomas",
    address: "987 Pine St, Toronto",
    date: "2025-04-11",
    time: "09:30",
    duration: "2 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["James Martin", "Nicole Brown"],
    phone: "416-555-7654"
  },
  {
    id: 7,
    title: "Post-Construction Cleaning",
    customer: "Michael Johnson",
    address: "147 Maple St, Ottawa",
    date: "2025-04-11",
    time: "13:30",
    duration: "5 hours",
    branch: "Ottawa Central",
    status: "confirmed",
    staff: ["Christopher White", "Elizabeth Davis", "Jason Miller"],
    phone: "613-555-9876"
  },
]

export const mockBookings = [
  {
    id: "BOK-10245",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "416-555-1234",
    service: "Move-Out Cleaning",
    date: "2025-04-15T10:00:00",
    duration: "3 hours",
    status: "pending",
    amount: 245.50,
    branch: "Toronto Downtown",
    address: "123 Main Street, Toronto, ON",
    notes: "Please make sure to clean inside the oven and refrigerator.",
    assignedStaff: [],
    created: "2025-04-07T14:30:00",
    modified: "2025-04-07T14:30:00"
  },
  {
    id: "BOK-10244",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    customerPhone: "647-555-9876",
    service: "Deep Cleaning",
    date: "2025-04-14T13:30:00",
    duration: "4 hours",
    status: "confirmed",
    amount: 320.75,
    branch: "Toronto Downtown",
    address: "456 Queen Street, Toronto, ON",
    notes: "Customer has pets, please be careful when entering.",
    assignedStaff: ["Emma Wilson", "David Lee"],
    created: "2025-04-06T09:15:00",
    modified: "2025-04-06T15:20:00"
  },
  {
    id: "BOK-10243",
    customerName: "Michael Chen",
    customerEmail: "mchen@example.com",
    customerPhone: "416-555-5678",
    service: "Carpet Cleaning",
    date: "2025-04-13T09:00:00",
    duration: "2 hours",
    status: "in-progress",
    amount: 150.00,
    branch: "North York",
    address: "789 University Avenue, Toronto, ON",
    notes: "",
    assignedStaff: ["Laura Taylor"],
    created: "2025-04-05T11:45:00",
    modified: "2025-04-13T09:05:00"
  },
  {
    id: "BOK-10242",
    customerName: "Emily Wilson",
    customerEmail: "emily.w@example.com",
    customerPhone: "905-555-4321",
    service: "Window Cleaning",
    date: "2025-04-12T14:00:00",
    duration: "2 hours",
    status: "completed",
    amount: 130.25,
    branch: "Mississauga",
    address: "234 Oakwood Drive, Mississauga, ON",
    notes: "Customer is very satisfied with the service.",
    assignedStaff: ["Kevin Wilson"],
    created: "2025-04-04T16:20:00",
    modified: "2025-04-12T16:15:00"
  },
  {
    id: "BOK-10241",
    customerName: "David Thompson",
    customerEmail: "david.t@example.com",
    customerPhone: "416-555-8765",
    service: "Move-In Cleaning",
    date: "2025-04-11T11:30:00",
    duration: "3 hours",
    status: "cancelled",
    amount: 245.50,
    branch: "Etobicoke",
    address: "567 Elm Street, Toronto, ON",
    notes: "Customer cancelled due to scheduling conflict.",
    assignedStaff: [],
    created: "2025-04-03T13:10:00",
    modified: "2025-04-09T10:30:00",
    cancellationReason: "Customer had a scheduling conflict"
  },
  {
    id: "BOK-10240",
    customerName: "Jennifer Lee",
    customerEmail: "jlee@example.com",
    customerPhone: "647-555-2468",
    service: "Appliance Cleaning",
    date: "2025-04-10T09:30:00",
    duration: "2 hours",
    status: "completed",
    amount: 120.00,
    branch: "Toronto Downtown",
    address: "890 King Street West, Toronto, ON",
    notes: "",
    assignedStaff: ["Susan White"],
    created: "2025-04-02T10:00:00",
    modified: "2025-04-10T11:45:00"
  },
  {
    id: "BOK-10239",
    customerName: "Robert Davis",
    customerEmail: "rdavis@example.com",
    customerPhone: "905-555-3698",
    service: "Post-Construction Cleaning",
    date: "2025-04-16T13:00:00",
    duration: "5 hours",
    status: "confirmed",
    amount: 450.75,
    branch: "Mississauga",
    address: "123 Lakeshore Road, Oakville, ON",
    notes: "Construction just finished. There is a lot of dust.",
    assignedStaff: ["Christopher White", "Elizabeth Davis", "Jason Miller"],
    created: "2025-04-01T14:45:00",
    modified: "2025-04-02T09:30:00"
  },
];


// Mock employees data
export const mockEmployees = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@example.com",
    phone: "416-555-1001",
    role: "Cleaner",
    branch: "Toronto Downtown",
    status: "active",
    address: "123 Main Street, Toronto, ON",
    postalCode: "M5V 2K7",
    hireDate: "2023-06-15",
    completedJobs: 78,
    rating: 4.8,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    skills: ["Deep Cleaning", "Move-Out Cleaning", "Carpet Cleaning"],
    notes: "Very reliable and receives excellent customer feedback."
  },
  {
    id: 2,
    firstName: "David",
    lastName: "Lee",
    email: "david.lee@example.com",
    phone: "416-555-1002",
    role: "Cleaner",
    branch: "Toronto Downtown",
    status: "active",
    address: "456 Queen Street, Toronto, ON",
    postalCode: "M5V 1M2",
    hireDate: "2023-07-05",
    completedJobs: 65,
    rating: 4.7,
    availability: ["Monday", "Wednesday", "Friday", "Saturday"],
    skills: ["Move-Out Cleaning", "Window Cleaning", "Appliance Cleaning"],
    notes: "Strong attention to detail. Prefers morning shifts."
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "416-555-1003",
    role: "Cleaner",
    branch: "Toronto Downtown",
    status: "inactive",
    address: "789 King Street West, Toronto, ON",
    postalCode: "M5V 1N3",
    hireDate: "2023-05-20",
    completedJobs: 42,
    rating: 4.3,
    availability: [],
    skills: ["Deep Cleaning", "Move-In Cleaning"],
    notes: "Currently on leave until June 2025."
  },
  {
    id: 4,
    firstName: "Jessica",
    lastName: "Clark",
    email: "jessica.clark@example.com",
    phone: "416-555-1004",
    role: "Team Lead",
    branch: "Toronto Downtown",
    status: "active",
    address: "321 Bloor Street, Toronto, ON",
    postalCode: "M5S 1W7",
    hireDate: "2023-03-10",
    completedJobs: 92,
    rating: 4.9,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    skills: ["Deep Cleaning", "Move-Out Cleaning", "Team Management", "Quality Control"],
    notes: "Excellent team leader. Handles difficult customers very well."
  },
  {
    id: 5,
    firstName: "Kevin",
    lastName: "Wilson",
    email: "kevin.wilson@example.com",
    phone: "647-555-1005",
    role: "Cleaner",
    branch: "North York",
    status: "active",
    address: "654 Yonge Street, Toronto, ON",
    postalCode: "M4Y 1Z8",
    hireDate: "2023-08-12",
    completedJobs: 48,
    rating: 4.5,
    availability: ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
    skills: ["Carpet Cleaning", "Window Cleaning", "Post-Construction Cleaning"],
    notes: "Specialized in carpet cleaning technologies."
  },
  {
    id: 6,
    firstName: "Laura",
    lastName: "Taylor",
    email: "laura.taylor@example.com",
    phone: "416-555-1006",
    role: "Cleaner",
    branch: "North York",
    status: "active",
    address: "987 Finch Avenue, North York, ON",
    postalCode: "M2J 2X5",
    hireDate: "2023-09-02",
    completedJobs: 36,
    rating: 4.6,
    availability: ["Monday", "Tuesday", "Thursday", "Friday"],
    skills: ["Deep Cleaning", "Move-Out Cleaning", "Move-In Cleaning"],
    notes: "Excellent at organizing cleaning schedules."
  },
  {
    id: 7,
    firstName: "Mark",
    lastName: "Anderson",
    email: "mark.anderson@example.com",
    phone: "647-555-1007",
    role: "Supervisor",
    branch: "North York",
    status: "active",
    address: "456 Sheppard Avenue, North York, ON",
    postalCode: "M2N 3A9",
    hireDate: "2023-04-25",
    completedJobs: 85,
    rating: 4.7,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    skills: ["Deep Cleaning", "Quality Control", "Staff Training", "Customer Relations"],
    notes: "Proactive supervisor who leads by example. Has great rapport with clients."
  },
  {
    id: 8,
    firstName: "Susan",
    lastName: "White",
    email: "susan.white@example.com",
    phone: "905-555-1008",
    role: "Cleaner",
    branch: "Mississauga",
    status: "active",
    address: "123 Hurontario Street, Mississauga, ON",
    postalCode: "L5B 2C3",
    hireDate: "2023-10-01",
    completedJobs: 32,
    rating: 4.4,
    availability: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    skills: ["Appliance Cleaning", "Move-Out Cleaning"],
    notes: "Specializes in detailed appliance cleaning."
  },
  {
    id: 9,
    firstName: "James",
    lastName: "Martin",
    email: "james.martin@example.com",
    phone: "416-555-1009",
    role: "Cleaner",
    branch: "Toronto Downtown",
    status: "probation",
    address: "789 Dundas Street West, Toronto, ON",
    postalCode: "M5T 2B6",
    hireDate: "2024-01-15",
    completedJobs: 18,
    rating: 4.1,
    availability: ["Monday", "Tuesday", "Wednesday", "Saturday"],
    skills: ["Deep Cleaning", "Window Cleaning"],
    notes: "New hire, currently on probation period. Shows good potential."
  },
  {
    id: 10,
    firstName: "Nicole",
    lastName: "Brown",
    email: "nicole.brown@example.com",
    phone: "416-555-1010",
    role: "Cleaner",
    branch: "Toronto Downtown",
    status: "active",
    address: "321 College Street, Toronto, ON",
    postalCode: "M5T 1S3",
    hireDate: "2023-11-10",
    completedJobs: 25,
    rating: 4.5,
    availability: ["Monday", "Thursday", "Friday", "Sunday"],
    skills: ["Move-In Cleaning", "Move-Out Cleaning"],
    notes: "Reliable team member with consistent performance."
  },
];
