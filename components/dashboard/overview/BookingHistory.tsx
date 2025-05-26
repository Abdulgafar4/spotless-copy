import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  date: string;
  refId: string;
  status: "Finished" | "Upcoming" | "Canceled" | "Waiting Approval";
}

export function BookingHistoryTable({ bookings }: { bookings: Booking[] }) {
  const statusClasses = {
    Finished: "bg-green-100 text-green-500",
    Upcoming: "bg-green-100 text-green-500",
    Canceled: "bg-red-100 text-red-500",
    "Waiting Approval": "bg-yellow-100 text-yellow-500",
  };


  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="pb-2 font-medium"></th>
            <th className="pb-2 font-medium">ID</th>
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={`${booking.refId}`} className="border-t">
              <td className="py-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${statusClasses[booking.status]}`}
                >
                  <Clock className="h-4 w-4" />
                </div>
              </td>
              <td className="py-4">#{booking.refId}</td>
              <td className="py-4">{booking.date}</td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[booking.status]}`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}