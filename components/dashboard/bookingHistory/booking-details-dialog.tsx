// components/dashboard/bookingHistory/booking-details-dialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Building, CreditCard, ArrowRight } from "lucide-react";
import { Booking } from "@/hooks/use-client-bookings";
import { useRouter } from "next/navigation";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onRebook?: (serviceType: string, branchId: string) => Promise<void>;
}

export function BookingDetailsDialog({
  booking,
  isOpen,
  onClose,
  onRebook
}: BookingDetailsDialogProps) {
  const router = useRouter();
  const [isRebooking, setIsRebooking] = useState(false);
  
  if (!booking) return null;

  const statusConfig = {
    completed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Completed",
      description: "Service has been successfully completed."
    },
    confirmed: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Confirmed",
      description: "Your booking has been confirmed and scheduled."
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      description: "Your booking request is being reviewed."
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Cancelled",
      description: "This booking has been cancelled."
    },
    "in-progress": {
      className: "bg-purple-100 text-purple-800 border-purple-200",
      label: "In Progress",
      description: "Service is currently in progress."
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

  const handleRebook = async () => {
    if (onRebook && booking.service_type && booking.branch) {
      setIsRebooking(true);
      try {
        await onRebook(booking.service_type, booking.branch);
        onClose();
      } catch (error) {
        console.error("Error rebooking service", error);
      } finally {
        setIsRebooking(false);
      }
    }
  };

  const status = booking.status.toLowerCase() as keyof typeof statusConfig;
  const statusDisplay = statusConfig[status] || statusConfig.pending;
  
  const paymentStatus = booking.payment_status?.toLowerCase() as keyof typeof paymentStatusConfig;
  const paymentStatusDisplay = paymentStatusConfig[paymentStatus] || paymentStatusConfig.pending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Booking Details</DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <span>Booking #{booking.id}</span>
            <Badge className={statusDisplay.className}>
              {statusDisplay.label}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Service Information</h4>
              <div className="p-3 bg-gray-50 rounded-md space-y-2">
                <h4 className="font-medium">{booking.service_type}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{booking.branch}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{booking.time}</span>
                </div>
                {booking.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{booking.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {booking.staff_assigned && booking.staff_assigned.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Staff Assigned</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <ul className="space-y-1">
                    {booking.staff_assigned.map((staff, index) => (
                      <li key={index} className="text-sm">{staff}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h4>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-bold">{formatCurrency(booking.total_amount)}</span>
                </div>
                {booking.payment_status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <Badge className={paymentStatusDisplay.className}>
                      {paymentStatusDisplay.label}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
              <div className={`p-3 rounded-md ${statusDisplay.className}`}>
                <h5 className="font-medium">{statusDisplay.label}</h5>
                <p className="text-sm mt-1">{statusDisplay.description}</p>
              </div>
            </div>
            
            {booking.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          
          {(booking.status === "completed" || booking.status === "cancelled") && onRebook && (
            <Button
              variant="outline"
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
              onClick={handleRebook}
              disabled={isRebooking}
            >
              <Calendar className="h-4 w-4 mr-1" />
              {isRebooking ? "Processing..." : "Book Again"}
            </Button>
          )}
          
          {booking.status === "confirmed" && (
            <Button
              variant="outline"
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              onClick={() => {
                onClose();
                router.push("/dashboard/cancellation");
              }}
            >
              Request Cancellation
            </Button>
          )}
          
          {booking.payment_status === "unpaid" && (
            <Button
              variant="outline"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
              onClick={() => {
                onClose();
                router.push("/dashboard/payments");
              }}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Make Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
