// components/dashboard/appointments/appointment-card.tsx
import {
  Clock, Calendar,
  CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/hooks/use-client-appointments";
import { formatLongDate, formatTime } from "@/lib/utils";
import Link from "next/link";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {


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

  return (
    <>
      <div className="bg-white border rounded-lg hover:shadow-md transition-shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start mb-2">
            <Badge className={config.className}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {config.label}
            </Badge>
            <span className="text-sm font-medium text-gray-500">#{appointment.refId}</span>
          </div>
          <h3 className="font-bold text-lg mb-1">{appointment.title || appointment.service_type}</h3>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatLongDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatTime(appointment.date)}</span>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex flex-col sm:flex-row justify-around">
          <Button
            variant="outline"
            className="sm:w-auto w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            <Link href="/dashboard/cancellation">
              Request Cancellation
            </Link>
          </Button>
          <Button
            variant="outline"
            className="sm:w-auto w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"


          >
            <Link href="/dashboard/reschedule">
              Request Reschedule

            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}