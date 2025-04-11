import { useState } from "react";
import { 
  Clock, Calendar, MapPin, Building, ArrowRight, 
  CheckCircle, AlertCircle, XCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  address: string;
  service_type: string;
  branch: string;
  notes?: string;
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
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
          <h3 className="font-bold text-lg mb-1">{appointment.title}</h3>
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${status === 'confirmed' ? 'text-green-500' : status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'}`} />
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
              onClick={() => setIsDetailsOpen(false)}
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
                    setIsDetailsOpen(false);
                    window.location.href = "/dashboard/cancellation";
                  }}
                >
                  Request Cancellation
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-auto w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    window.location.href = "/dashboard/reschedule";
                  }}
                >
                  Request Reschedule
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}