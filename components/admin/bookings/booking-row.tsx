import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingActions } from "./booking-actions"


const formatDate = (dateString: string) => format(new Date(dateString), "MMM d, yyyy")
const formatTime = (dateString: string) => format(new Date(dateString), "h:mm a")

const getStatusBadge = (status: string) => {
  const statusColors: Record<string, StatusBadge> = {
    "pending": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    "confirmed": { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
    "in-progress": { bg: "bg-purple-100", text: "text-purple-800", label: "In Progress" },
    "completed": { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
    "cancelled": { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelled" },
    "rejected": { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  }

  const statusInfo = statusColors[status] || { bg: "", text: "", label: status }

  console.log(statusInfo.label)
  return <span className="flex flex-row gap-2 items-center"><Badge className={`${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</Badge>{statusInfo.label}</span>
}



export const BookingRow: React.FC<BookingRowProps> = ({
  booking,
  onViewBooking,
  onUpdateStatus,
  onAssignStaff,
  onMessageCustomer
}) => (
  <TableRow className="px-6 py-4 whitespace-nowrap">
    <TableCell className="font-medium">{booking.id}</TableCell>
    <TableCell>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {booking.customerName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{booking.customerName}</div>
          <div className="text-xs text-gray-500">{booking.customerPhone}</div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="font-medium">{booking.service}</div>
      <div className="text-xs text-gray-500">{booking.branch}</div>
    </TableCell>
    <TableCell>
      <div className="font-medium">{formatDate(booking.date)}</div>
      <div className="text-xs text-gray-500">{formatTime(booking.date)}</div>
      <div className="text-xs text-gray-500">{booking.duration}</div>
    </TableCell>
    <TableCell>{getStatusBadge(booking.status)}</TableCell>
    <TableCell>
      {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
        <div>
          <div className="text-sm">{booking.assignedStaff[0]}</div>
          {booking.assignedStaff.length > 1 && (
            <div className="text-xs text-gray-500">+{booking.assignedStaff.length - 1} more</div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500">Not assigned</div>
      )}
    </TableCell>
    <TableCell className="font-medium">${booking.amount.toFixed(2)}</TableCell>
    <TableCell>
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewBooking(booking)}
        >
          View
        </Button>
        <BookingActions
          booking={booking}
          onViewBooking={onViewBooking}
          onUpdateStatus={onUpdateStatus}
          onAssignStaff={onAssignStaff}
          onMessageCustomer={onMessageCustomer}
        />
      </div>
    </TableCell>
  </TableRow>
)