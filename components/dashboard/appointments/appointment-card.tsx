// components/dashboard/appointments/appointment-card.tsx
import { useState } from "react";
import { 
  Clock, Calendar, MapPin, Building, ArrowRight, 
  CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/hooks/use-client-appointments";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const statusConfig = {
    confirmed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Confirmed",
      icon: CheckCircle,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      icon: AlertCircle,
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-200",
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
    <>
      <div className="bg-white border rounded-lg hover:shadow-md transition-shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start mb-2">
            <Badge className={config.className}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {config.label}
            </Badge>
            <span className="text-sm font-medium text-gray-500">#{appointment.id}</span>
          </div>
          <h3 className="font-bold text-lg mb-1">{appointment.title || appointment.service_type}</h3>
          <p className="text-gray-500">{appointment.service_type}</p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="truncate" title={appointment.address}>
              {appointment.address}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-500" />
            <span>{appointment.branch}</span>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setIsDetailsOpen(true)}
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <AppointmentDetailsDialog
        appointment={appointment}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}