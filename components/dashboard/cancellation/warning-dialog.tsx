import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { calculateCancellationFee } from "@/lib/utils";

interface CancellationWarningDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  appointmentDate: string;
}

export function CancellationWarningDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  appointmentDate,
}: CancellationWarningDialogProps) {
  // Calculate the days until appointment
  const appointment = new Date(appointmentDate);
  const today = new Date();
  
  appointment.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = appointment.getTime() - today.getTime();
  const daysUntilAppointment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Get fee information
  const { feePercentage, message } = calculateCancellationFee(appointmentDate);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Late Cancellation Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            <p className="mb-4">
              You are requesting to cancel an appointment that is scheduled in{" "}
              <strong className="text-amber-600">{daysUntilAppointment} days</strong>.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <p className="font-medium text-amber-800">Cancellation Fee Notice:</p>
              <p className="text-amber-700">
                {message}
              </p>
              {feePercentage > 0 && (
                <p className="mt-2 font-bold text-amber-800">
                  A {feePercentage}% cancellation fee will be applied.
                </p>
              )}
            </div>
            <p>Are you sure you want to continue with this cancellation request?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, Keep Appointment</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Yes, Request Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}