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
import { format, parseISO } from "date-fns"
import { Calendar, Check } from "lucide-react"

interface RescheduleApproveDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  request: any
  onConfirm: (notes: string) => void
}

export function RescheduleApproveDialog({
  isOpen,
  setIsOpen,
  request,
  onConfirm
}: RescheduleApproveDialogProps) {
  const [notes, setNotes] = useState("")
  
  if (!request) return null
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }
  
  const handleConfirm = () => {
    onConfirm(notes)
    setNotes("") // Reset notes after submission
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Reschedule Request</DialogTitle>
          <DialogDescription>
            This will update the booking to the new date and time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3>New Appointment Details</h3>
            </div>
            <p className="text-green-700">
              <span className="font-medium">Date:</span> {request.requested_date ? formatDate(request.requested_date) : "Not specified"}
            </p>
            <p className="text-green-700">
              <span className="font-medium">Time:</span> {request.requested_time || "Not specified"}
            </p>
            <p className="text-green-700">
              <span className="font-medium">Service:</span> {request.service_type || "Not specified"}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">
              Admin Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this reschedule approval..."
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
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}