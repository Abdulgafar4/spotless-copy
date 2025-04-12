// components/dashboard/appointments/appointment-empty-state.tsx
import { Calendar } from "lucide-react";

export function AppointmentEmptyState() {
  return (
    <div className="p-8 text-center text-gray-500">
      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
      <p className="font-medium">No appointments found</p>
      <p className="text-sm mt-1">You don't have any upcoming appointments</p>
    </div>
  );
}
