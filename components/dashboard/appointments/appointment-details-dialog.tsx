// components/dashboard/appointments/appointment-details-dialog.tsx
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  Info 
} from "lucide-react";
import { Appointment } from "@/hooks/use-client-appointments";
import { useRouter } from "next/navigation";

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailsDialog({ 
  appointment, 
  isOpen, 
  onClose 
}: AppointmentDetailsDialogProps) {
  const router = useRouter();
  
  if (!appointment) return null;
  
  const statusConfig = {
    confirmed: {
      className: "text-green-500",
      label: "Confirmed",
      icon: CheckCircle,
    },
    pending: {
      className: "text-yellow-500",
      label: "Pending",
      icon: AlertCircle,
    },
    cancelled: {
      className: "text-red-500",
      label: "Cancelled",
      icon: XCircle,
    },
  };

  // Select the status config or default to pending
  const status = appointment.status.toLowerCase();
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${config.className}`} />
            {appointment.title}
          </DialogTitle>
          <DialogDescription>
            Appointment #{appointment.id} - {config.label}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium">Date & Time</span>
              <p className="text-sm text-gray-500">
                {formatDate(appointment.date)} at {appointment.time}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium">Location</span>
              <p className="text-sm text-gray-500">{appointment.address}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium">Branch</span>
              <p className="text-sm text-gray-500">{appointment.branch}</p>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
              <Info className="h-5 w-5 text-gray-500" />
              <div>
                <span className="font-medium">Notes</span>
                <p className="text-sm text-gray-500">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:w-auto w-full"
          >
            Close
          </Button>
          {status === 'confirmed' && (
            <>
              <Button
                variant="outline"
                className="sm:w-auto w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/cancellation");
                }}
              >
                Request Cancellation
              </Button>
              <Button
                variant="outline"
                className="sm:w-auto w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/reschedule");
                }}
              >
                Request Reschedule
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}