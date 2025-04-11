"use client"

import { useState } from "react"
import {
  Search,
  Mail,
  Phone,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Download,
  Clock,
  ArrowUpDown,
  FileText
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminLayout from "@/components/admin/admin-layout"
import { CustomerDetailsDialog } from "@/components/admin/customers/customerDetails"

// Mock customers data
const mockCustomers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "416-555-1234",
    address: "123 Main Street, Toronto, ON",
    postalCode: "M5V 2K7",
    registrationDate: "2024-01-15T14:30:00",
    status: "active",
    totalBookings: 8,
    totalSpent: 1245.50,
    lastBookingDate: "2025-03-28T10:00:00",
    preferredBranch: "Toronto Downtown",
    notes: "Prefers afternoon appointments. Has a dog that should be secured during cleaning."
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    phone: "647-555-9876",
    address: "456 Queen Street, Toronto, ON",
    postalCode: "M4C 1R2",
    registrationDate: "2024-02-03T09:15:00",
    status: "active",
    totalBookings: 5,
    totalSpent: 875.25,
    lastBookingDate: "2025-04-01T13:30:00",
    preferredBranch: "Toronto Downtown",
    notes: "Has specific eco-friendly cleaning preferences."
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Chen",
    email: "mchen@example.com",
    phone: "416-555-5678",
    address: "789 University Avenue, Toronto, ON",
    postalCode: "M5T 1P3",
    registrationDate: "2024-02-20T11:45:00",
    status: "inactive",
    totalBookings: 2,
    totalSpent: 350.00,
    lastBookingDate: "2024-12-10T09:00:00",
    preferredBranch: "North York",
    notes: ""
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Wilson",
    email: "emily.w@example.com",
    phone: "905-555-4321",
    address: "234 Oakwood Drive, Mississauga, ON",
    postalCode: "L5B 2C6",
    registrationDate: "2024-03-05T16:20:00",
    status: "active",
    totalBookings: 6,
    totalSpent: 1120.75,
    lastBookingDate: "2025-03-25T14:00:00",
    preferredBranch: "Mississauga",
    notes: "Needs extra attention to kitchen cleaning."
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Thompson",
    email: "david.t@example.com",
    phone: "416-555-8765",
    address: "567 Elm Street, Toronto, ON",
    postalCode: "M4E 1S2",
    registrationDate: "2024-01-25T13:10:00",
    status: "active",
    totalBookings: 3,
    totalSpent: 495.50,
    lastBookingDate: "2025-02-15T11:30:00",
    preferredBranch: "Etobicoke",
    notes: "Has a key lockbox for entry. Code: 1234"
  },
  {
    id: 6,
    firstName: "Jennifer",
    lastName: "Lee",
    email: "jlee@example.com",
    phone: "647-555-2468",
    address: "890 King Street West, Toronto, ON",
    postalCode: "M5V 1N5",
    registrationDate: "2024-02-28T10:00:00",
    status: "active",
    totalBookings: 4,
    totalSpent: 680.00,
    lastBookingDate: "2025-03-30T09:30:00",
    preferredBranch: "Toronto Downtown",
    notes: "Prefers morning appointments."
  },
  {
    id: 7,
    firstName: "Robert",
    lastName: "Davis",
    email: "rdavis@example.com",
    phone: "905-555-3698",
    address: "123 Lakeshore Road, Oakville, ON",
    postalCode: "L6J 1H3",
    registrationDate: "2024-03-10T14:45:00",
    status: "inactive",
    totalBookings: 1,
    totalSpent: 185.75,
    lastBookingDate: "2024-11-05T13:00:00",
    preferredBranch: "Mississauga",
    notes: ""
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("lastName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const itemsPerPage = 10;

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let valueA, valueB;
    
    // Determine sort values based on sort field
    switch(sortField) {
      case "name":
        valueA = `${a.firstName} ${a.lastName}`;
        valueB = `${b.firstName} ${b.lastName}`;
        break;
      case "email":
        valueA = a.email;
        valueB = b.email;
        break;
      case "registrationDate":
        valueA = new Date(a.registrationDate).getTime();
        valueB = new Date(b.registrationDate).getTime();
        break;
      case "totalSpent":
        valueA = a.totalSpent;
        valueB = b.totalSpent;
        break;
      case "totalBookings":
        valueA = a.totalBookings;
        valueB = b.totalBookings;
        break;
      default:
        valueA = a.lastName;
        valueB = b.lastName;
    }
    
    // Apply sort direction
    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = sortedCustomers.slice(startIndex, startIndex + itemsPerPage)

  // Handle viewing customer details
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDetailsDialogOpen(true)
  }

  // No need for adding customers - admin only views

  // Sort handler
  const handleSort = (field: string) => {
    if (field === sortField) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Otherwise, set new field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <div>
            <Button variant="outline" onClick={() => {}}>
              <Download className="mr-2 h-4 w-4" />
              Export Customer List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-500 mr-3" />
                <div className="text-3xl font-bold">{customers.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-500 mr-3" />
                <div className="text-3xl font-bold">
                  {customers.filter(c => c.status === "active").length}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Average Customer Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500 mr-3" />
                <div className="text-3xl font-bold">
                  ${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription>
                  View and manage all customer accounts
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Customer
                        {sortField === "name" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("registrationDate")}
                      >
                        Joined
                        {sortField === "registrationDate" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("totalBookings")}
                      >
                        Bookings
                        {sortField === "totalBookings" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("totalSpent")}
                      >
                        Total Spent
                        {sortField === "totalSpent" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {customer.firstName[0]}{customer.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {customer.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {customer.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(customer.registrationDate)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {customer.registrationDate.split('T')[1].substring(0, 5)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={customer.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          }>
                            {customer.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{customer.totalBookings}</div>
                          {customer.lastBookingDate && (
                            <div className="text-xs text-gray-500">
                              Last: {formatDate(customer.lastBookingDate)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${customer.totalSpent.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg: ${(customer.totalSpent / (customer.totalBookings || 1)).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem>View Bookings</DropdownMenuItem>
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  {customer.status === "active" ? "Mark as Inactive" : "Mark as Active"}
                                </DropdownMenuItem>
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
                          <User className="h-10 w-10 mb-2" />
                          <h3 className="text-lg font-medium">No customers found</h3>
                          <p className="text-sm">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your search or filter"
                              : "Add your first customer to get started"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredCustomers.length}</span> customers
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

      <CustomerDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        customer={selectedCustomer}
      />
    </AdminLayout>
  )
}