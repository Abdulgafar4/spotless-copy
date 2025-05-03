// components/dashboard/bookingHistory/booking-history-table.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClientBookings, Booking } from "@/hooks/use-client-bookings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { useClientServices } from "@/hooks/use-client-service";

interface BookingHistoryTableProps {
  bookings: Booking[];
}

export function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const router = useRouter();
  
  const { rebookService } = useClientBookings();
  const { services } = useClientServices();
  
  if (!bookings || bookings.length === 0) {
    return null;
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleRebook = async (serviceType: string, branchId: string) => {
    const bookingId = await rebookService(serviceType, branchId);
    if (bookingId) {
      router.push(`/booking?id=${bookingId}`);
    }
  };

  const statusConfig = {
    completed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Completed"
    },
    confirmed: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Confirmed"
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending"
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Cancelled"
    },
    "in-progress": {
      className: "bg-purple-100 text-purple-800 border-purple-200",
      label: "In Progress"
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
          minute: 'numeric',
          hour12: true
    };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  const getServicePrice = (serviceType: string) => {
    if (!services || !Array.isArray(services)) return null;
    
    const service = services.find(s => s.name === serviceType);
    return service ? service.price : null;
  };


  return (
    <>
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

            const price = booking.total_amount || getServicePrice(booking.service_type);

            return (
              <TableRow key={booking.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">#{booking.reference_number}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(booking.date)}</span>
                    <span className="text-xs text-gray-500">{formatTime(booking.date)}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                  {booking.service_type}
                </TableCell>
                <TableCell>
                  <Badge className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {`${formatCurrency(price)}/hr`}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onRebook={handleRebook}
        />
      )}
    </>
  );
}