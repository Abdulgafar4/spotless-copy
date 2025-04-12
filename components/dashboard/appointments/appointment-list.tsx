// components/dashboard/appointments/appointment-list.tsx
import { AppointmentCard } from "@/components/dashboard/appointments/appointment-card";
import { Appointment } from "@/hooks/use-client-appointments";

interface AppointmentListProps {
  appointments: Appointment[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
