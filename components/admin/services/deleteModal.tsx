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

interface DeleteServiceDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => void
  serviceName?: string
}

export function DeleteServiceDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  serviceName,
}: DeleteServiceDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this service?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete the service <span className="font-medium">{serviceName}</span>. 
            This action cannot be undone and will permanently remove all data associated with this service.
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