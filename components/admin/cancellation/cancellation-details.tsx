"use client"

import { format, parseISO } from "date-fns"
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
import {
  Calendar,
  DollarSign,
  Check,
  X,
  AlignJustify,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react"

interface CancellationDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  request: any
  onApprove: (request: any) => void
  onReject: (request: any) => void
}

export function CancellationDetailsDialog({
  isOpen,
  setIsOpen,
  request,
  onApprove,
  onReject
}: CancellationDetailsDialogProps) {
  if (!request) return null

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

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95%] max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Cancellation Request Details</span>
            {getStatusBadge(request.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-green-100 text-green-600 text-xl font-bold">
                  {request.customer_name
                    ? request.customer_name.split(' ').map((name: string) => name[0]).join('').toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-800">{request.customer_name}</h3>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-green-500" />
                    <span>Customer ID: {request.user_id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-green-500" />
                    <a href={`mailto:${request.customer_email}`} className="text-green-600 hover:underline">
                      {request.customer_email || "No email available"}
                    </a>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <a href={`tel:${request.customer_phone}`} className="text-gray-700 hover:underline">
                      {request.customer_phone || "No phone available"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service and Date Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service Details</h3>
              <p className="text-base font-medium">{request.service_type}</p>
              <p className="text-sm text-gray-500 mt-1">Booking ID: {request.booking_id || request.appointment_id}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Booking Date</h3>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-base font-medium">
                    {request.booking_date 
                      ? formatDate(request.booking_date)
                      : "Date not available"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.booking_time || "Time not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment and Request Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h3>
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-base font-medium">
                    Total Amount: {formatCurrency(request.total_amount || 0)}
                  </p>
                  {request.refund_amount > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Refund: {formatCurrency(request.refund_amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Request Date</h3>
              <p className="text-base font-medium">{formatDateTime(request.created_at)}</p>
              {request.updated_at && request.status !== 'pending' && (
                <p className="text-sm text-gray-500">
                  {request.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDateTime(request.updated_at)}
                </p>
              )}
            </div>
          </div>
          
          {/* Reason and Notes */}
          <div className="space-y-2 border rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer's Reason for Cancellation</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex gap-2">
                <AlignJustify className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 whitespace-pre-line">{request.reason || "No reason provided"}</p>
              </div>
            </div>
          </div>
          
          {/* Admin Notes (if available) */}
          {request.admin_notes && (
            <div className="space-y-2 border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Notes</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex gap-2">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 whitespace-pre-line">{request.admin_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:order-first">
            Close
          </Button>
          
          {request.status === 'pending' && (
            <>
              <Button 
                variant="destructive"
                onClick={() => {
                  onReject(request);
                  setIsOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  onApprove(request);
                  setIsOpen(false);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}