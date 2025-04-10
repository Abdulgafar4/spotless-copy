import { CalendarCheck, CalendarClock, CalendarX, Check, Clock, MessageSquare, MoreHorizontal, User, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export const BookingActions: React.FC<BookingActionsProps> = ({ 
    booking, 
    onViewBooking, 
    onUpdateStatus, 
    onAssignStaff, 
    onMessageCustomer 
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
          label: "Reject Booking", 
          icon: X, 
          color: "text-red-500", 
          action: () => onUpdateStatus(booking, "rejected") 
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
          label: "Cancel Booking", 
          icon: CalendarX, 
          color: "text-red-500", 
          action: () => onUpdateStatus(booking, "cancelled") 
        },
        { 
          label: "Mark In Progress", 
          icon: Clock, 
          color: "text-blue-500", 
          action: () => onUpdateStatus(booking, "in-progress") 
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