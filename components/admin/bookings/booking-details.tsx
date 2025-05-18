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
  FileText,
  Image as ImageIcon,
  Home,
  Bed,
  Bath,
  Car,
  Tag
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString || "N/A"
    }
  }
  
  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "h:mm a")
    } catch (error) {
      return "N/A"
    }
  }

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "in-progress":
        return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "due":
        return <Badge className="bg-red-200 text-red-900">Overdue</Badge>
      default:
        return <Badge>{status || "Unknown"}</Badge>
    }
  }

  // Parse price breakdown if available
  const getPriceBreakdown = () => {
    if (!booking.price_breakdown) return []
    
    try {
      if (typeof booking.price_breakdown === 'string') {
        return JSON.parse(booking.price_breakdown)
      }
      return booking.price_breakdown || []
    } catch (error) {
      console.error("Error parsing price breakdown:", error)
      return []
    }
  }

  // Parse property details if available
  const getPropertyDetails = () => {
    if (!booking.property_details) return null
    
    try {
      if (typeof booking.property_details === 'string') {
        return JSON.parse(booking.property_details)
      }
      return booking.property_details
    } catch (error) {
      console.error("Error parsing property details:", error)
      return null
    }
  }

  // Parse images if available
  const getImages = () => {
    if (!booking.images) return []
    
    try {
      if (typeof booking.images === 'string') {
        return JSON.parse(booking.images)
      }
      return Array.isArray(booking.images) ? booking.images : []
    } catch (error) {
      console.error("Error parsing images:", error)
      return []
    }
  }

  const propertyDetails = getPropertyDetails()
  const priceBreakdown = getPriceBreakdown()
  const images = getImages()


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95%] max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-10">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Booking Details - {booking.reference_number || booking.refId || "N/A"}</span>
            {getStatusBadge(booking.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4 sm:mt-6">
          <TabsList className="grid grid-cols-4 w-full max-w-[600px] mx-auto">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="staff">Staff & Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 sm:mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Service Type</h3>
                <p className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  {booking.service_type || booking.service || "N/A"}
                </p>
              </div>

              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                <p className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  {booking.branch || booking.branch_id || "N/A"}
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
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {booking.time || "N/A"}
                </p>
              </div>

              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {formatDate(booking.created_at || booking.modified)} 
                  {booking.created_at || booking.modified ? ` at ${formatTime(booking.created_at || booking.modified)}` : ""}
                </p>
              </div>

              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {formatDate(booking.updated_at || booking.modified)} 
                  {booking.updated_at || booking.modified ? ` at ${formatTime(booking.updated_at || booking.modified)}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Service Address</h3>
              <p className="text-base flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span>{booking.address || "N/A"}</span>
              </p>
              {booking.city && (
                <p className="text-base flex items-start gap-2 ml-6">
                  <span>City: {booking.city}</span>
                </p>
              )}
              {booking.postal_code && (
                <p className="text-base flex items-start gap-2 ml-6">
                  <span>Postal Code: {booking.postal_code}</span>
                </p>
              )}
            </div>

            {propertyDetails && (
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Property Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span>Bedrooms: {propertyDetails.bedrooms || "0"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-400" />
                    <span>Bathrooms: {propertyDetails.bathrooms || "0"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span>Living Rooms: {propertyDetails.livingRooms || "0"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>Garages: {propertyDetails.garages || "0"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span>Den: {propertyDetails.den ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-green-100 text-green-600 text-xl font-bold">
                    {(booking.customer_name || booking.customerName || "User").split(' ')
                      .map((name: string) => name[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {booking.customer_name || booking.customerName || "N/A"}
                  </h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-green-500" />
                      {booking.customer_email || booking.customerEmail ? (
                        <a
                          href={`mailto:${booking.customer_email || booking.customerEmail}`}
                          className="text-green-600 hover:underline"
                        >
                          {booking.customer_email || booking.customerEmail}
                        </a>
                      ) : (
                        <span className="text-gray-500">No email provided</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-green-500" />
                      {booking.phone || booking.customerPhone ? (
                        <a
                          href={`tel:${booking.phone || booking.customerPhone}`}
                          className="text-gray-700 hover:underline"
                        >
                          {booking.phone || booking.customerPhone}
                        </a>
                      ) : (
                        <span className="text-gray-500">No phone provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onMessageCustomer(booking)}
                className="w-full mt-2 bg-green-500 hover:bg-green-600 transition-colors"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message to Customer
              </Button>
            </div>

            {booking.status === "cancelled" && booking.cancellationReason && (
              <div className="space-y-2 p-4 border rounded-md border-red-200 bg-red-50">
                <h3 className="text-sm font-medium text-red-500">Cancellation Reason</h3>
                <p className="text-base">{booking.cancellationReason}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
              {booking.status === "pending" && (
                <>
                  <Button
                    className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                    onClick={() => onUpdateStatus(booking, "confirmed")}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
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
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => onUpdateStatus(booking, "cancelled")}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                </>
              )}

              {booking.status === "in-progress" && (
                <Button
                  className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                  onClick={() => onUpdateStatus(booking, "completed")}
                >
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Mark Completed
                </Button>
              )}

              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => onAssignStaff(booking)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
              )}

              {booking.status === "due" && (
                <>
                  <Button
                    className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                    onClick={() => onUpdateStatus(booking, "confirmed")}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Confirm Late Booking
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => onUpdateStatus(booking, "rejected")}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Reject Booking
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-4 sm:mt-6 space-y-4">
            {images && images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((imageUrl: string, index: number) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div className="aspect-video relative">
                      <img 
                        src={imageUrl} 
                        alt={`Booking image ${index + 1}`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/api/placeholder/400/300";
                          (e.target as HTMLImageElement).alt = "Image failed to load";
                        }}
                      />
                    </div>
                    <div className="p-2 bg-gray-50">
                      <p className="text-sm text-gray-500 text-center">Image {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50">
                <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No Images Available</h3>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  No property or service images have been uploaded for this booking.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payment" className="mt-4 sm:mt-6 space-y-4">
            <div className="space-y-2 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
                <Badge className={booking.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : "Unknown"}
                </Badge>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Option</span>
                  <span className="font-medium">{booking.payment_option || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">${booking.total_amount || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium">${booking.payment_amount || "0.00"}</span>
                </div>
                {booking.total_amount && booking.payment_amount && 
                 Number(booking.total_amount) > Number(booking.payment_amount) && (
                  <div className="flex justify-between font-medium">
                    <span className="text-red-600">Balance Due</span>
                    <span className="text-red-600">
                      ${(Number(booking.total_amount) - Number(booking.payment_amount)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {priceBreakdown && priceBreakdown.length > 0 && (
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Price Breakdown</h3>
                <div className="mt-2 space-y-2">
                  {priceBreakdown.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        {item.item}
                      </span>
                      <span className={Number(item.price) < 0 ? "text-red-600" : ""}>
                        ${Number(item.price) > 0 ? Number(item.price).toFixed(2) : `(${Math.abs(Number(item.price)).toFixed(2)})`}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t border-gray-300 font-medium">
                    <span>Total</span>
                    <span>${booking.total_amount || "0.00"}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="mt-4 sm:mt-6 space-y-4">
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Assigned Staff</h3>
              {booking.assigned_staff || (booking.assignedStaff && booking.assignedStaff.length > 0) ? (
                <ul className="mt-2 space-y-2">
                  {/* Handle both string and array formats */}
                  {Array.isArray(booking.assigned_staff || booking.assignedStaff) ? 
                    (booking.assigned_staff || booking.assignedStaff).map((staff: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{staff}</span>
                      </li>
                    )) : 
                    <li className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{booking.assigned_staff || booking.assignedStaff}</span>
                    </li>
                  }
                </ul>
              ) : (
                <p className="text-gray-500 mt-2 italic">No staff assigned yet</p>
              )}

              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => onAssignStaff(booking)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {booking.assigned_staff || (booking.assignedStaff && booking.assignedStaff.length > 0) 
                    ? "Reassign Staff" 
                    : "Assign Staff"}
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

        <DialogFooter className="mt-4 sm:mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}