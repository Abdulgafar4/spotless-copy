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
import { AlertCircle, X } from "lucide-react"

interface RescheduleRejectDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  request: any
  onConfirm: (notes: string) => void
}

export function RescheduleRejectDialog({
  isOpen,
  setIsOpen,
  request,
  onConfirm
}: RescheduleRejectDialogProps) {
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
    if (!notes.trim()) {
      // Require notes for rejection
      return
    }
    onConfirm(notes)
    setNotes("") // Reset notes after submission
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Reschedule Request</DialogTitle>
          <DialogDescription>
            The booking will remain at its original date and time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3>Requested Change (Being Rejected)</h3>
            </div>
            <p className="text-red-700">
              <span className="font-medium">Original Date:</span> {request.original_date ? formatDate(request.original_date) : "Not specified"}
            </p>
            <p className="text-red-700">
              <span className="font-medium">Requested Date:</span> {request.requested_date ? formatDate(request.requested_date) : "Not specified"}
            </p>
            <p className="text-red-700">
              <span className="font-medium">Requested By:</span> {request.customer_name || "Unknown Customer"}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why this reschedule request is being rejected..."
              className="mt-1"
              required
            />
            {notes.trim().length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please provide a reason for rejection
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={notes.trim().length === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}