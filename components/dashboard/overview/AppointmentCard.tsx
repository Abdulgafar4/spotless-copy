import { Clock, Calendar } from "lucide-react";

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-500">
        <Clock className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-bold">{appointment.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Calendar className="h-4 w-4" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <Clock className="h-4 w-4" />
          <span>{appointment.time}</span>
        </div>
      </div>
    </div>
  );
}