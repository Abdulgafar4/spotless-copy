"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteUnavailableDateDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => void
  dateInfo?: {
    date: string
    reason: string
    branch: string
  }
}

export function DeleteUnavailableDateDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  dateInfo,
}: DeleteUnavailableDateDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this unavailable date?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete the unavailable date:
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div><span className="font-medium">Date:</span> {dateInfo?.date}</div>
              <div><span className="font-medium">Branch:</span> {dateInfo?.branch}</div>
              <div><span className="font-medium">Reason:</span> {dateInfo?.reason}</div>
            </div>
            This action cannot be undone and customers will be able to book appointments on this date again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}