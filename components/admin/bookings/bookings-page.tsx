"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowDown,
  ArrowUp,
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
import { BookingOverviewCards } from "./booking-overview"
import { BookingFilters } from "./booking-filter"
import { BookingsTable } from "./booking-table"
import { useAdminBookings } from "@/hooks/use-booking"
import { toast } from "sonner"
import { RefundCancellationDialog } from "./refund-cancellation-dialog"


export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  // Add sort state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc") // Default to descending

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    action: "", title: "", description: ""
  })
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)


  const {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    assignStaffToBooking,
    cancelBookingWithRefund,
    updatePayment,
  } = useAdminBookings();

  const itemsPerPage = 10

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleUpdatePayment = async (booking: any, paymentData: any) => {
  try {
    await updatePayment(booking.id, paymentData);
    toast.success('Payment information updated successfully');
    await fetchBookings(); // Refresh the booking list
  } catch (error) {
    console.error('Failed to update payment:', error);
    toast.error('Failed to update payment information');
  }
};
  // Filtering Logic
  const filterBookings = (bookings: Booking[]) => {
    return bookings.filter(booking => {
      // Search filter
      const matchesSearch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.refId.includes(searchTerm) ||
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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
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



  // Pagination and Sorting Logic
  const paginateBookings = (bookings: Booking[]) => {
    // Sort bookings by reference_id or id in descending or ascending order
    const sortedBookings = [...bookings].sort((a, b) => {
      // Use reference_id/reference_number if available, otherwise fall back to id
      const refA = a.refId || '';
      const refB = b.refId || '';

      // If both are numeric, convert to numbers for comparison
      if (!isNaN(Number(refA)) && !isNaN(Number(refB))) {
        return sortDirection === 'desc'
          ? Number(refB) - Number(refA)
          : Number(refA) - Number(refB);
      }

      // Otherwise treat as strings
      return sortDirection === 'desc'
        ? String(refB).localeCompare(String(refA))
        : String(refA).localeCompare(String(refB));
    });

    const totalPages = Math.ceil(sortedBookings.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage)

    return { sortedBookings, totalPages, startIndex, paginatedBookings }
  }
  const handleCancelWithRefund = (booking: any) => {
    setSelectedBooking(booking)
    setIsRefundDialogOpen(true)
  }

  const handleRefundSubmit = async (
    bookingId: string,
    reason: string,
    refundType: 'full' | 'partial' | 'none',
    customRefundAmount?: number
  ) => {
    try {
      await cancelBookingWithRefund(bookingId, reason, refundType, customRefundAmount)
      toast.success('Booking cancelled and refund processed successfully')
      await fetchBookings() // Refresh the booking list
    } catch (error) {
      console.error('Failed to cancel booking with refund:', error)
      toast.error('Failed to process cancellation and refund')
    }
  }
  // Action Handlers
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsDialogOpen(true)
  }

  const handleUpdateStatus = (booking: any, newStatus: string) => {
    // For cancellation, use the refund dialog instead
    if (newStatus === 'cancelled') {
      handleCancelWithRefund(booking)
      return
    }

    // Handle other status updates normally
    const statusActions: Record<string, { title: string; description: string }> = {
      "confirmed": {
        title: "Confirm Booking",
        description: "Are you sure you want to confirm this booking?"
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

  const handleConfirmAction = async () => {
    if (!selectedBooking) return;

    try {
      await updateBookingStatus(selectedBooking.id, confirmAction.action as BookingStatus);
      setIsConfirmDialogOpen(false);

      // Refetch bookings after status update
      await fetchBookings();
      toast.success(`Booking status updated to ${confirmAction.action}`);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Failed to update booking status");
    }
  }

  const handleAssignStaff = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsAssignDialogOpen(true)
  }

  const handleAssignStaffSubmit = async (staffList: string[]) => {
    if (!selectedBooking) return;

    try {
      // In a real implementation, you would map staff names to IDs
      // For now, we'll assume staffList contains IDs
      await assignStaffToBooking(selectedBooking.id, staffList);
      setIsAssignDialogOpen(false);

      // Add toast notification for feedback
      toast.success("Staff successfully assigned to booking");

      // Refetch bookings instead of reloading the page
      await fetchBookings();
    } catch (error) {
      console.error("Failed to assign staff:", error);
      toast.error("Failed to assign staff to booking");
    }
  }

  const handleMessageCustomer = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsMessageDialogOpen(true)
  }

  const handleSendMessage = async (message: string) => {
    // In a real app, this would send a message to the customer
    console.log(`Sending message to ${selectedBooking?.customerName}:`, message);
    setIsMessageDialogOpen(false);

    // Show success toast
    toast.success(`Message sent to ${selectedBooking?.customerName}`);

    // Refetch bookings in case message sending affects booking status
    await fetchBookings();
  }

  // Filtered and Paginated Bookings
  const filteredBookings = filterBookings(bookings)
  const {
    totalPages,
    startIndex,
    paginatedBookings
  } = paginateBookings(filteredBookings)

  // Booking Metrics
  const { countByStatus, upcomingBookings, todayBookings } = calculateBookingMetrics(bookings)

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <BookingOverviewCards
            bookings={bookings}
            upcomingBookings={upcomingBookings}
            todayBookings={todayBookings}
            countByStatus={countByStatus}
          />
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  View and manage all customer bookings
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
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
                {/* Add sort direction toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortDirection}
                  className="flex items-center gap-1"
                >
                  {sortDirection === 'desc' ? (
                    <>
                      Reference ID <ArrowDown className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Reference ID <ArrowUp className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Loading state */}
            {loading && (
              <div className="">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>Loading bookings...</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading bookings
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error.message}
                      <button
                        type="button"
                        className="ml-2 text-sm font-medium text-red-800 hover:text-red-700 underline"
                        onClick={fetchBookings}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
        onCancelWithRefund={handleCancelWithRefund}
        onUpdatePayment={handleUpdatePayment} />

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

      <RefundCancellationDialog
        isOpen={isRefundDialogOpen}
        setIsOpen={setIsRefundDialogOpen}
        booking={selectedBooking}
        onCancelWithRefund={handleRefundSubmit}
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