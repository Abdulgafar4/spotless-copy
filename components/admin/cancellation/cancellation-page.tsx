"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
  Check,
  X,
  Search,
  DollarSign
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
import { useAdminCancellation } from "@/hooks/use-cancellation"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CancellationDetailsDialog } from "./cancellation-details"
import { CancellationApproveDialog } from "./cancellation-approve"
import { CancellationRejectDialog } from "./cancellation-reject"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CancellationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  
  const {
    cancellationRequests,
    loading,
    error,
    fetchCancellationRequests,
    approveCancellationRequest,
    rejectCancellationRequest
  } = useAdminCancellation()

  const itemsPerPage = 10;

//   console.log(cancellationRequests)

  useEffect(() => {
    // When status filter changes, update the requests
    const filters: any = {}
    if (statusFilter !== "all") {
      filters.status = statusFilter
    }
    
    fetchCancellationRequests(filters)
  }, [statusFilter, fetchCancellationRequests])

  // Filter cancellation requests by search term and date filter
  const filterRequests = (requests: any[]) => {
    return requests.filter(request => {
      // Search filter
      const matchesSearch =
        request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter
      let matchesDate = true;
      const requestDate = new Date(request.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      if (dateFilter === "today") {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = requestDate >= today && requestDate <= endOfDay;
      } else if (dateFilter === "yesterday") {
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        matchesDate = requestDate >= yesterday && requestDate <= endOfYesterday;
      } else if (dateFilter === "last-week") {
        matchesDate = requestDate >= lastWeek;
      } else if (dateFilter === "last-month") {
        matchesDate = requestDate >= lastMonth;
      }

      return matchesSearch && matchesDate;
    });
  }

  // Calculate request counts by status
  const getStatusCounts = (requests: any[]) => {
    return requests.reduce((counts, request) => {
      counts[request.status] = (counts[request.status] || 0) + 1;
      return counts;
    }, { pending: 0, approved: 0, rejected: 0 });
  }

  // Calculate total potential refund amount for pending requests
  const calculatePotentialRefund = (requests: any[]) => {
    return requests
      .filter(request => request.status === 'pending')
      .reduce((total, request) => total + (request.total_amount || 0), 0);
  }

  // Calculate total refunded amount for approved requests
  const calculateTotalRefunded = (requests: any[]) => {
    return requests
      .filter(request => request.status === 'approved')
      .reduce((total, request) => total + (request.refund_amount || 0), 0);
  }

  // Pagination logic
  const paginateRequests = (requests: any[]) => {
    const totalPages = Math.ceil(requests.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRequests = requests.slice(startIndex, startIndex + itemsPerPage)

    return { totalPages, startIndex, paginatedRequests }
  }

  // Action handlers
  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsDetailsDialogOpen(true)
  }

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request)
    setIsApproveDialogOpen(true)
  }

  const handleRejectRequest = (request: any) => {
    setSelectedRequest(request)
    setIsRejectDialogOpen(true)
  }

  const handleApproveConfirm = async (refundAmount: number, notes: string) => {
    if (!selectedRequest) return;
    
    const success = await approveCancellationRequest(selectedRequest.id, refundAmount, notes);
    if (success) {
      setIsApproveDialogOpen(false);
      fetchCancellationRequests({
        status: statusFilter !== "all" ? statusFilter as any : undefined
      });
    }
  }

  const handleRejectConfirm = async (notes: string) => {
    if (!selectedRequest) return;
    
    const success = await rejectCancellationRequest(selectedRequest.id, notes);
    if (success) {
      setIsRejectDialogOpen(false);
      fetchCancellationRequests({
        status: statusFilter !== "all" ? statusFilter as any : undefined
      });
    }
  }

  // Prepare filtered and paginated data
  const filteredRequests = filterRequests(cancellationRequests)
  const { totalPages, startIndex, paginatedRequests } = paginateRequests(filteredRequests)
  const statusCounts = getStatusCounts(cancellationRequests)
  const potentialRefundAmount = calculatePotentialRefund(cancellationRequests)
  const totalRefundedAmount = calculateTotalRefunded(cancellationRequests)

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Cancellation Requests Management</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: "Pending Requests",
              value: statusCounts.pending,
              description: "Awaiting review",
              className: "border-yellow-200 bg-yellow-50"
            },
            {
              title: "Approved Requests",
              value: statusCounts.approved,
              description: "Cancellations processed",
              className: "border-green-200 bg-green-50"
            },
            {
              title: "Rejected Requests",
              value: statusCounts.rejected,
              description: "Cancellations denied",
              className: "border-red-200 bg-red-50"
            },
            {
              title: "Total Refunded",
              value: formatCurrency(totalRefundedAmount),
              description: `Pending: ${formatCurrency(potentialRefundAmount)}`,
              className: "border-green-200 bg-green-50"
            }
          ].map(({ title, value, description, className }) => (
            <Card key={title} className={className}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-sm text-gray-500">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Cancellation Requests</CardTitle>
                <CardDescription>
                  Review and manage client cancellation requests
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last-week">Last 7 Days</SelectItem>
                      <SelectItem value="last-month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading requests...</span>
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
                      Error loading cancellation requests
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error.message}
                      <button
                        type="button"
                        className="ml-2 text-sm font-medium text-red-800 hover:text-red-700 underline"
                        onClick={() => fetchCancellationRequests()}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="whitespace-nowrap">
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.customer_name}</TableCell>
                        <TableCell>{request.service_type}</TableCell>
                        <TableCell>
                          {request.booking_date && formatDate(request.booking_date)}
                          {request.booking_time && <div className="text-xs text-gray-500">{request.booking_time}</div>}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(request.total_amount || 0)}
                          {request.refund_amount > 0 && (
                            <div className="text-xs text-green-600">
                              Refund: {formatCurrency(request.refund_amount)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {formatDateTime(request.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRequest(request)}
                            >
                              View
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleApproveRequest(request)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectRequest(request)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Calendar className="h-10 w-10 mb-2" />
                          <h3 className="text-lg font-medium">No cancellation requests found</h3>
                          <p className="text-sm">
                            {(searchTerm || statusFilter !== "all" || dateFilter !== "all")
                              ? "Try adjusting your search or filters"
                              : "No cancellation requests have been submitted yet"}
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
                  {Math.min(startIndex + itemsPerPage, filteredRequests.length)}
                </span>{" "}
                of <span className="font-medium">{filteredRequests.length}</span> requests
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

      {/* Dialogs */}
      <CancellationDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        request={selectedRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      <CancellationApproveDialog
        isOpen={isApproveDialogOpen}
        setIsOpen={setIsApproveDialogOpen}
        request={selectedRequest}
        onConfirm={handleApproveConfirm}
      />

      <CancellationRejectDialog
        isOpen={isRejectDialogOpen}
        setIsOpen={setIsRejectDialogOpen}
        request={selectedRequest}
        onConfirm={handleRejectConfirm}
      />
    </AdminLayout>
  )
}