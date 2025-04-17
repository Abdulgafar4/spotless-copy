"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { Calendar, Check, DollarSign } from "lucide-react"

interface CancellationApproveDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  request: any
  onConfirm: (refundAmount: number, notes: string) => void
}

export function CancellationApproveDialog({
  isOpen,
  setIsOpen,
  request,
  onConfirm
}: CancellationApproveDialogProps) {
  const [notes, setNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState<number>(0)
  
  if (!request) return null
  
  // When the dialog opens, set the initial refund amount to the full booking amount
  if (isOpen && refundAmount === 0 && request.total_amount) {
    setRefundAmount(request.total_amount)
  }
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
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
  
  const handleConfirm = () => {
    // Ensure refund amount is not negative and not greater than total amount
    const validRefundAmount = Math.min(
      Math.max(0, refundAmount), 
      request.total_amount || 0
    )
    
    onConfirm(validRefundAmount, notes)
    setNotes("") // Reset notes after submission
    setRefundAmount(0) // Reset refund amount
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Cancellation Request</DialogTitle>
          <DialogDescription>
            This will cancel the booking and process any refund
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3>Booking Details</h3>
            </div>
            <p className="text-green-700">
              <span className="font-medium">Service:</span> {request.service_type || "Not specified"}
            </p>
            <p className="text-green-700">
              <span className="font-medium">Date:</span> {request.booking_date ? formatDate(request.booking_date) : "Not specified"}
            </p>
            <p className="text-green-700">
              <span className="font-medium">Customer:</span> {request.customer_name || "Not specified"}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">
              Refund Amount
            </label>
            <div className="mt-1 relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="number"
                min="0"
                max={request.total_amount || 0}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Max refund: {formatCurrency(request.total_amount || 0)}</span>
              <span>Current: {formatCurrency(refundAmount)}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">
              Admin Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this cancellation and refund..."
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={handleConfirm}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve & Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}