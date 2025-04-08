"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Eye,
  MessageCircle
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import AdminLayout from "@/components/admin/admin-layout"
import { InquiryDetailsDialog } from "@/components/admin/inquiries/inquiryDetails"

// Mock inquiries data
const mockInquiries = [
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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState(mockInquiries)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter inquiries based on search term and current tab
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === "all") return matchesSearch;
    return matchesSearch && inquiry.status === currentTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage)

  // Open inquiry details
  const handleViewInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry)
    setIsDetailsDialogOpen(true)
  }

  // Calculate counts for each status
  const countByStatus = inquiries.reduce((acc, inquiry) => {
    const status = inquiry.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Mark as Resolved
            </Button>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Response
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="py-4">
              <CardTitle className="text-blue-700 text-lg">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{countByStatus.new || 0}</div>
              <p className="text-sm text-blue-600">Unassigned inquiries</p>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="py-4">
              <CardTitle className="text-yellow-700 text-lg">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{countByStatus['in-progress'] || 0}</div>
              <p className="text-sm text-yellow-600">Being handled</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="py-4">
              <CardTitle className="text-red-700 text-lg">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{countByStatus.urgent || 0}</div>
              <p className="text-sm text-red-600">Need immediate attention</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="py-4">
              <CardTitle className="text-green-700 text-lg">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{countByStatus.resolved || 0}</div>
              <p className="text-sm text-green-600">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Inquiries</CardTitle>
                <CardDescription>
                  Manage customer questions, requests, and feedback
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search inquiries..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentTab("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("new")}>New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("in-progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("urgent")}>Urgent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("resolved")}>Resolved</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="mb-6" onValueChange={setCurrentTab}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge className="ml-2 bg-gray-100 text-gray-900">{inquiries.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="new">
                  New
                  <Badge className="ml-2 bg-blue-100 text-blue-900">{countByStatus.new || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress
                  <Badge className="ml-2 bg-yellow-100 text-yellow-900">{countByStatus['in-progress'] || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  Urgent
                  <Badge className="ml-2 bg-red-100 text-red-900">{countByStatus.urgent || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved
                  <Badge className="ml-2 bg-green-100 text-green-900">{countByStatus.resolved || 0}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInquiries.length > 0 ? (
                  paginatedInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {inquiry.name.split(' ').map(name => name[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{inquiry.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {inquiry.email}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {inquiry.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inquiry.subject}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[250px]">
                          {inquiry.message.length > 60 
                            ? `${inquiry.message.substring(0, 60)}...` 
                            : inquiry.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          {inquiry.responses.length > 0 ? (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {inquiry.responses.length} response{inquiry.responses.length > 1 ? 's' : ''}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(inquiry.date), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {format(new Date(inquiry.date), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        {inquiry.assignedTo ? (
                          <div className="text-sm">{inquiry.assignedTo}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Unassigned</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Assign to Staff</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                              <DropdownMenuItem>Flag as Urgent</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Mail className="h-10 w-10 mb-2" />
                        <h3 className="text-lg font-medium">No inquiries found</h3>
                        <p className="text-sm">
                          {searchTerm 
                            ? "Try adjusting your search terms" 
                            : "All customer inquiries will appear here"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredInquiries.length)}
                </span>{" "}
                of <span className="font-medium">{filteredInquiries.length}</span> inquiries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      <InquiryDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        inquiry={selectedInquiry}
      />
    </AdminLayout>
  )}