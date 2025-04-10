"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
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
import AdminLayout from "@/components/admin/admin-layout"
import { BookingDetailsDialog } from "@/components/admin/bookings/booking-details"
import { ConfirmActionDialog } from "@/components/admin/bookings/confirm-dialog"
import { AssignStaffDialog } from "@/components/admin/bookings/assign-staff"
import { MessageCustomerDialog } from "@/components/admin/bookings/message-customer"
import { mockBookings } from "../adminDummyData"
import { BookingOverviewCards } from "./booking-overview"
import { BookingFilters } from "./booking-filter"
import { BookingsTable } from "./booking-table"


export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ 
    action: "", title: "", description: "" 
  })
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  
  const itemsPerPage = 10

  // Filtering and Sorting Logic
  const filterBookings = (bookings: Booking[]) => {
    return bookings.filter(booking => {
      // Search filter
      const matchesSearch = 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      // Date filter (using today as reference point)
      const bookingDate = new Date(booking.date);
      const today = new Date();
      const isToday = bookingDate.toDateString() === today.toDateString();
      const isTomorrow = new Date(today.setDate(today.getDate() + 1)).toDateString() === bookingDate.toDateString();
      const isThisWeek = new Date(bookingDate) <= new Date(new Date().setDate(new Date().getDate() + 7));
      
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = isToday;
      } else if (dateFilter === "tomorrow") {
        matchesDate = isTomorrow;
      } else if (dateFilter === "this-week") {
        matchesDate = isThisWeek;
      }
      
      // Branch filter
      const matchesBranch = branchFilter === "all" || booking.branch.toLowerCase().includes(branchFilter.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesDate && matchesBranch;
    });
  }

  // Calculate Booking Metrics
  const calculateBookingMetrics = (bookings: Booking[]) => {
    // Count bookings by status
    const countByStatus = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate upcoming bookings
    const upcomingBookings = bookings.filter(booking => 
      new Date(booking.date) > new Date() && 
      (booking.status === "confirmed" || booking.status === "pending")
    ).length;

    // Calculate today's bookings
    const todayBookings = bookings.filter(booking => 
      new Date(booking.date).toDateString() === new Date().toDateString()
    ).length;

    return { countByStatus, upcomingBookings, todayBookings }
  }

  // Pagination Logic
  const paginateBookings = (bookings: Booking[]) => {
    // Sort bookings by date (most recent first)
    const sortedBookings = [...bookings].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const totalPages = Math.ceil(sortedBookings.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage)

    return { sortedBookings, totalPages, startIndex, paginatedBookings }
  }

  // Action Handlers
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsDialogOpen(true)
  }

  const handleUpdateStatus = (booking: Booking, newStatus: string) => {
    const statusActions: Record<string, { title: string; description: string }> = {
      "confirmed": { 
        title: "Confirm Booking", 
        description: "Are you sure you want to confirm this booking?" 
      },
      "cancelled": { 
        title: "Cancel Booking", 
        description: "Are you sure you want to cancel this booking?" 
      },
      "completed": { 
        title: "Mark as Completed", 
        description: "Are you sure you want to mark this booking as completed?" 
      },
      "rejected": { 
        title: "Reject Booking", 
        description: "Are you sure you want to reject this booking?" 
      }
    }
    
    setSelectedBooking(booking)
    setConfirmAction({ 
      action: newStatus, 
      title: statusActions[newStatus]?.title || "", 
      description: statusActions[newStatus]?.description || "" 
    })
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmAction = () => {
    if (!selectedBooking) return;
    
    // Process the status change
    const updatedBookings = bookings.map(booking => {
      if (booking.id === selectedBooking.id) {
        return { 
          ...booking, 
          status: confirmAction.action,
          modified: new Date().toISOString()
        };
      }
      return booking;
    });
    
    setBookings(updatedBookings)
    setIsConfirmDialogOpen(false)
  }

  const handleAssignStaff = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsAssignDialogOpen(true)
  }

  const handleAssignStaffSubmit = (staffList: string[]) => {
    if (!selectedBooking) return;
    
    // Update the booking with assigned staff
    const updatedBookings = bookings.map(booking => {
      if (booking.id === selectedBooking.id) {
        return { 
          ...booking, 
          assignedStaff: staffList,
          modified: new Date().toISOString()
        };
      }
      return booking;
    });
    
    setBookings(updatedBookings)
    setIsAssignDialogOpen(false)
  }

  const handleMessageCustomer = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsMessageDialogOpen(true)
  }

  const handleSendMessage = (message: string) => {
    // In a real app, this would send a message to the customer
    console.log(`Sending message to ${selectedBooking?.customerName}:`, message);
    setIsMessageDialogOpen(false);
  }

  // Filtered and Paginated Bookings
  const filteredBookings = filterBookings(bookings)
  const { 
    sortedBookings, 
    totalPages, 
    startIndex, 
    paginatedBookings 
  } = paginateBookings(filteredBookings)

  // Booking Metrics
  const { countByStatus, upcomingBookings, todayBookings } = calculateBookingMetrics(bookings)

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6 mt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <BookingOverviewCards
          bookings={bookings}
          upcomingBookings={upcomingBookings}
          todayBookings={todayBookings}
          countByStatus={countByStatus}
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  View and manage all customer bookings
                </CardDescription>
              </div>
              <BookingFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                branchFilter={branchFilter}
                setBranchFilter={setBranchFilter}
              />
            </div>
          </CardHeader>
          <CardContent>
            <BookingsTable
              paginatedBookings={paginatedBookings}
              filteredBookings={filteredBookings}
              onViewBooking={handleViewBooking}
              onUpdateStatus={handleUpdateStatus}
              onAssignStaff={handleAssignStaff}
              onMessageCustomer={handleMessageCustomer}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              branchFilter={branchFilter}
            />
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredBookings.length)}
                </span>{" "}
                of <span className="font-medium">{filteredBookings.length}</span> bookings
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

      <BookingDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        booking={selectedBooking}
        onAssignStaff={handleAssignStaff}
        onUpdateStatus={handleUpdateStatus}
        onMessageCustomer={handleMessageCustomer}
      />

      <ConfirmActionDialog
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={handleConfirmAction}
      />

      <AssignStaffDialog
        isOpen={isAssignDialogOpen}
        setIsOpen={setIsAssignDialogOpen}
        booking={selectedBooking}
        onAssign={handleAssignStaffSubmit}
      />

      <MessageCustomerDialog
        isOpen={isMessageDialogOpen}
        setIsOpen={setIsMessageDialogOpen}
        booking={selectedBooking}
        onSendMessage={handleSendMessage}
      />
    </AdminLayout>
  )
}