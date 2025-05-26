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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, AlertTriangle, CreditCard } from "lucide-react"

interface RefundCancellationDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  booking: any
  onCancelWithRefund: (
    bookingId: string,
    reason: string,
    refundType: 'full' | 'partial' | 'none',
    customRefundAmount?: number
  ) => Promise<void>
}

export function RefundCancellationDialog({
  isOpen,
  setIsOpen,
  booking,
  onCancelWithRefund
}: RefundCancellationDialogProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial' | 'none'>('full')
  const [customAmount, setCustomAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!booking) return null

  const totalAmount = booking.payment_amount || booking.amount || 0
  const fullRefundAmount = totalAmount
  const partialRefundAmount = customAmount ? parseFloat(customAmount) : 0

  const handleCancel = () => {
    setRefundType('full')
    setCustomAmount('')
    setReason('')
    setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return // Reason is required
    }

    if (refundType === 'partial' && (!customAmount || partialRefundAmount <= 0)) {
      return // Custom amount required for partial refund
    }

    setIsProcessing(true)
    
    try {
      await onCancelWithRefund(
        booking.id,
        reason,
        refundType,
        refundType === 'partial' ? partialRefundAmount : undefined
      )
      
      // Reset form and close dialog
      setRefundType('full')
      setCustomAmount('')
      setReason('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to cancel booking with refund:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-500" />
            Cancel Booking with Refund
          </DialogTitle>
          <DialogDescription>
            Cancel booking {booking.refId} and process refund for customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm"><strong>Customer:</strong> {booking.customerName}</p>
            <p className="text-sm"><strong>Service:</strong> {booking.service}</p>
            <p className="text-sm"><strong>Amount Paid:</strong> ${totalAmount}</p>
            <p className="text-sm"><strong>Payment Status:</strong> {booking.payment_status || 'Unknown'}</p>
          </div>

          {/* Refund Type Selection */}
          <div className="space-y-3">
            <Label>Refund Type</Label>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={() => setRefundType('full')}
                  className="text-green-600"
                />
                <span className="flex-1">
                  Full Refund - <strong>${fullRefundAmount}</strong>
                  <span className="text-sm text-gray-500 block">
                    Complete refund of payment amount
                  </span>
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={() => setRefundType('partial')}
                  className="text-yellow-600"
                />
                <span className="flex-1">
                  Partial Refund - Custom Amount
                  <span className="text-sm text-gray-500 block">
                    Specify partial refund amount
                  </span>
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  value="none"
                  checked={refundType === 'none'}
                  onChange={() => setRefundType('none')}
                  className="text-red-600"
                />
                <span className="flex-1">
                  No Refund
                  <span className="text-sm text-gray-500 block">
                    Cancel without refunding payment
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Custom Amount Input for Partial Refund */}
          {refundType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="customAmount">Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="customAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              {partialRefundAmount > totalAmount && (
                <p className="text-sm text-red-500">
                  Refund amount cannot exceed payment amount (${totalAmount})
                </p>
              )}
            </div>
          )}

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this booking is being cancelled..."
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The booking will be cancelled and 
              {refundType === 'full' && ` a full refund of $${fullRefundAmount} will be processed.`}
              {refundType === 'partial' && ` a partial refund of $${partialRefundAmount} will be processed.`}
              {refundType === 'none' && ' no refund will be issued.'}
              {refundType !== 'none' && ' Refunds typically take 3-5 business days to process.'}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              !reason.trim() ||
              (refundType === 'partial' && (!customAmount || partialRefundAmount <= 0 || partialRefundAmount > totalAmount))
            }
          >
            {isProcessing ? 'Processing...' : 'Cancel Booking & Process Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}