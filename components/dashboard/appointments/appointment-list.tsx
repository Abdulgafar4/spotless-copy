// components/dashboard/appointments/confirmed-appointment-list.tsx
import { AppointmentCard } from "@/components/dashboard/appointments/appointment-card";
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentEmptyState } from "@/components/dashboard/appointments/appointment-empty-state";
import { AppointmentErrorState } from "@/components/dashboard/appointments/appointment-error-state";
import { useClientAppointments } from "@/hooks/use-client-appointments";

interface ConfirmedAppointmentListProps {
  showTitle?: boolean;
  maxItems?: number;
}

export function AppointmentList({ 
  showTitle = true,
  maxItems
}: ConfirmedAppointmentListProps) {
  const { appointments, loading, error, fetchAppointments } = useClientAppointments();
  
  // Limit the number of appointments to display if maxItems is provided
  const displayedAppointments = maxItems 
    ? appointments.slice(0, maxItems) 
    : appointments;

  return (
    <div className="space-y-4">
      
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <AppointmentErrorState onRetry={fetchAppointments} />
      ) : displayedAppointments.length === 0 ? (
        <AppointmentEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
      
      {maxItems && appointments.length > maxItems && (
        <div className="text-center mt-4">
          <Button 
            variant="link" 
            onClick={() => window.location.href = "/dashboard/confirmed-appointments"}
          >
            View all {appointments.length} appointments
          </Button>
        </div>
      )}
    </div>
  );
}