import { CalendarCheck, CalendarClock, CalendarX, Check, Clock, MessageSquare, MoreHorizontal, User, X, CreditCard } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface BookingActionsProps {
  booking: any;
  onViewBooking: (booking: any) => void;
  onUpdateStatus: (booking: any, status: string) => void;
  onAssignStaff: (booking: any) => void;
  onMessageCustomer: (booking: any) => void;
  onCancelWithRefund: (booking: any) => void; // Add this new prop
}

export const BookingActions: React.FC<BookingActionsProps> = ({ 
    booking, 
    onViewBooking, 
    onUpdateStatus, 
    onAssignStaff, 
    onMessageCustomer,
    onCancelWithRefund // Add this
  }) => {
    
    const actionsByStatus: Record<string, BookingAction[]> = {
      "pending": [
        { 
          label: "Confirm Booking", 
          icon: Check, 
          color: "text-green-500", 
          action: () => onUpdateStatus(booking, "confirmed") 
        },
        { 
          label: "Cancel with Refund", 
          icon: CreditCard, 
          color: "text-red-500", 
          action: () => onCancelWithRefund(booking) 
        }
      ],
      "pending_review": [
        { 
          label: "Confirm Booking", 
          icon: Check, 
          color: "text-green-500", 
          action: () => onUpdateStatus(booking, "confirmed") 
        },
        { 
          label: "Cancel with Refund", 
          icon: CreditCard, 
          color: "text-red-500", 
          action: () => onCancelWithRefund(booking) 
        }
      ],
      "confirmed": [
        { 
          label: "Assign Staff", 
          icon: User, 
          color: "", 
          action: () => onAssignStaff(booking) 
        },
        { 
          label: "Cancel with Refund", 
          icon: CreditCard, 
          color: "text-red-500", 
          action: () => onCancelWithRefund(booking) 
        }
      ],
      "in-progress": [
        { 
          label: "Mark Completed", 
          icon: CalendarCheck, 
          color: "text-green-500", 
          action: () => onUpdateStatus(booking, "completed") 
        }
      ]
    }
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {actionsByStatus[booking.status]?.map(({ label, icon: Icon, color, action }) => (
            <DropdownMenuItem key={label} onClick={action}>
              <Icon className={`mr-2 h-4 w-4 ${color}`} />
              {label}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => onMessageCustomer(booking)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Customer
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onViewBooking(booking)}>
            <CalendarClock className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }