"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Clock,
  DollarSign,
  ClipboardList,
  MessageSquare,
  CalendarCheck,
  CalendarX,
  FileText
} from "lucide-react"

interface BookingDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  booking: any
  onUpdateStatus: (booking: any, status: string) => void
  onAssignStaff: (booking: any) => void
  onMessageCustomer: (booking: any) => void
}

export function BookingDetailsDialog({
  isOpen,
  setIsOpen,
  booking,
  onUpdateStatus,
  onAssignStaff,
  onMessageCustomer
}: BookingDetailsDialogProps) {
  if (!booking) return null

  // Helper to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  // Helper to format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a")
  }

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case "in-progress":
        return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details - {booking.id}</span>
            {getStatusBadge(booking.status)}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Booking Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Info</TabsTrigger>
            <TabsTrigger value="staff">Staff & Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Service Type</h3>
                <p className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  {booking.service}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                <p className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  {booking.branch}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(booking.date)}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Time & Duration</h3>
                <p className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {formatTime(booking.date)} ({booking.duration})
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  ${booking.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {formatDate(booking.created)} at {formatTime(booking.created)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Service Address</h3>
              <p className="text-base flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span>{booking.address}</span>
              </p>
            </div>
            
            {booking.status === "cancelled" && booking.cancellationReason && (
              <div className="space-y-2 p-4 border rounded-md border-red-200 bg-red-50">
                <h3 className="text-sm font-medium text-red-500">Cancellation Reason</h3>
                <p className="text-base">{booking.cancellationReason}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {booking.status === "pending" && (
                <>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => onUpdateStatus(booking, "confirmed")}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => onUpdateStatus(booking, "rejected")}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Reject Booking
                  </Button>
                </>
              )}
              
              {booking.status === "confirmed" && (
                <>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => onUpdateStatus(booking, "in-progress")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Mark In Progress
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => onUpdateStatus(booking, "cancelled")}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                </>
              )}
              
              {booking.status === "in-progress" && (
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => onUpdateStatus(booking, "completed")}
                >
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Mark Completed
                </Button>
              )}
              
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button 
                  variant="outline"
                  onClick={() => onAssignStaff(booking)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="customer" className="mt-6 space-y-4">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  {booking.customerName.split(' ').map((name: string) => name[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{booking.customerName}</h3>
                <div className="flex flex-col space-y-1 mt-1">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4" /> 
                    <a href={`mailto:${booking.customerEmail}`} className="text-blue-600 hover:underline">
                      {booking.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-4 w-4" /> 
                    <a href={`tel:${booking.customerPhone}`} className="text-blue-600 hover:underline">
                      {booking.customerPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={() => onMessageCustomer(booking)}
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message to Customer
            </Button>
          </TabsContent>
          
          <TabsContent value="staff" className="mt-6 space-y-4">
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Assigned Staff</h3>
              {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {booking.assignedStaff.map((staff: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{staff}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2 italic">No staff assigned yet</p>
              )}
              
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onAssignStaff(booking)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {booking.assignedStaff && booking.assignedStaff.length > 0 ? "Reassign Staff" : "Assign Staff"}
                </Button>
              )}
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Notes & Special Instructions</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                {booking.notes ? (
                  <p className="text-gray-700 whitespace-pre-line">{booking.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes provided</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}