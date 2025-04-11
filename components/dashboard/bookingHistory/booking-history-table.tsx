import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
  address?: string;
  total_amount?: number;
  payment_status?: string;
  staff_assigned?: string[];
  notes?: string;
}

interface BookingHistoryTableProps {
  bookings: Booking[];
  isLoading?: boolean;
}

export function BookingHistoryTable({ bookings, isLoading = false }: BookingHistoryTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusConfig = {
    completed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Completed",
      icon: CheckCircle,
      description: "Service has been successfully completed."
    },
    confirmed: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Confirmed",
      icon: CheckCircle,
      description: "Your booking has been confirmed and scheduled."
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      icon: Clock,
      description: "Your booking request is being reviewed."
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Cancelled",
      icon: XCircle,
      description: "This booking has been cancelled."
    },
    "in-progress": {
      className: "bg-purple-100 text-purple-800 border-purple-200",
      label: "In Progress",
      icon: AlertCircle,
      description: "Service is currently in progress."
    },
    rescheduled: {
      className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      label: "Rescheduled",
      icon: Calendar,
      description: "This booking has been rescheduled."
    }
  };

  const paymentStatusConfig = {
    paid: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Paid",
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
    },
    refunded: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Refunded",
    },
    unpaid: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Unpaid",
    },
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatLongDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleDownloadInvoice = (bookingId: string) => {
    // In a real implementation, this would download an invoice
    toast.success(`Downloaded invoice for booking #${bookingId}`);
  };

  const handleRebookService = (service: string) => {
    // In a real implementation, this would start the booking process with prefilled data
    toast.success(`Rebooking ${service} - redirecting to booking form...`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No booking history</h3>
        <p className="mt-2 text-sm text-gray-500">
          You haven't made any bookings yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const status = booking.status.toLowerCase();
              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <TableRow key={booking.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(booking.date)}</span>
                      <span className="text-xs text-gray-500">{booking.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {booking.service_type}
                  </TableCell>
                  <TableCell>
                    <Badge className={config.className}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span>{formatCurrency(booking.total_amount)}</span>
                      {booking.payment_status && (
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${
                            paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig]?.className || 
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig]?.label || 
                          booking.payment_status}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedBooking && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Booking Details
              </DialogTitle>
              <DialogDescription className="flex justify-between items-center">
                <span>Booking #{selectedBooking.id}</span>
                <Badge 
                  className={
                    statusConfig[selectedBooking.status.toLowerCase() as keyof typeof statusConfig]?.className || 
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {statusConfig[selectedBooking.status.toLowerCase() as keyof typeof statusConfig]?.label || 
                  selectedBooking.status}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Service Information</h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-base">{selectedBooking.service_type}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{selectedBooking.branch}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div>{formatLongDate(selectedBooking.date)}</div>
                          <div className="text-gray-600">{selectedBooking.time}</div>
                        </div>
                      </div>
                      
                      {selectedBooking.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span>{selectedBooking.address}</span>
                        </div>
                      )}
                      
                      {selectedBooking.staff_assigned && selectedBooking.staff_assigned.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Staff Assigned</h4>
                          <ul className="text-sm space-y-1">
                            {selectedBooking.staff_assigned.map((staff, index) => (
                              <li key={index}>{staff}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {selectedBooking.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm">{selectedBooking.notes}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Amount</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedBooking.total_amount)}</span>
                      </div>
                      
                      {selectedBooking.payment_status && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Payment Status</span>
                          <Badge 
                            className={
                              paymentStatusConfig[selectedBooking.payment_status as keyof typeof paymentStatusConfig]?.className || 
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {paymentStatusConfig[selectedBooking.payment_status as keyof typeof paymentStatusConfig]?.label || 
                            selectedBooking.payment_status}
                          </Badge>
                        </div>
                      )}
                      
                      {selectedBooking.payment_status === "paid" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 text-blue-600 border-blue-200"
                          onClick={() => handleDownloadInvoice(selectedBooking.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Invoice
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <Card>
                    <CardContent className={`p-4 ${
                      selectedBooking.status.toLowerCase() === "completed" ? "bg-green-50" : 
                      selectedBooking.status.toLowerCase() === "cancelled" ? "bg-red-50" : 
                      selectedBooking.status.toLowerCase() === "confirmed" ? "bg-blue-50" : 
                      "bg-yellow-50"
                    }`}>
                      <div className="flex items-start gap-2">
                        {React.createElement(
                          statusConfig[selectedBooking.status.toLowerCase() as keyof typeof statusConfig]?.icon || AlertCircle, 
                          { className: `h-5 w-5 ${
                            selectedBooking.status.toLowerCase() === "completed" ? "text-green-500" : 
                            selectedBooking.status.toLowerCase() === "cancelled" ? "text-red-500" : 
                            selectedBooking.status.toLowerCase() === "confirmed" ? "text-blue-500" : 
                            "text-yellow-500"
                          } mt-0.5` }
                        )}
                        <div>
                          <h4 className="font-medium">
                            {statusConfig[selectedBooking.status.toLowerCase() as keyof typeof statusConfig]?.label || 
                            selectedBooking.status}
                          </h4>
                          <p className="text-sm mt-1">
                            {statusConfig[selectedBooking.status.toLowerCase() as keyof typeof statusConfig]?.description || 
                            "No additional information available."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
              
              {(selectedBooking.status === "completed" || selectedBooking.status === "cancelled") && (
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                  onClick={() => handleRebookService(selectedBooking.service_type)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Book Again
                </Button>
              )}
              
              {selectedBooking.status === "confirmed" && (
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    window.location.href = "/dashboard/cancellation";
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Request Cancellation
                </Button>
              )}
              
              {selectedBooking.payment_status === "unpaid" && (
                <Button
                  variant="outline"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    window.location.href = "/dashboard/payments";
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Make Payment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}