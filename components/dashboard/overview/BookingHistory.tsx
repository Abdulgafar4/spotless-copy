import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  date: string;
  refId: string;
  status: "Past" | "Upcoming" | "Canceled" | "Waiting Approval";
}

export function BookingHistoryTable({ bookings }: { bookings: Booking[] }) {
  const statusClasses = {
    Past: "bg-red-100 text-red-500",
    Upcoming: "bg-blue-100 text-blue-500",
    Canceled: "bg-red-100 text-red-500",
    "Waiting Approval": "bg-yellow-100 text-yellow-500",
  };

  // Helper function to determine actual status based on date
  const getActualStatus = (booking: Booking): Booking["status"] => {
    // If already canceled or waiting approval, keep those statuses
    if (booking.status === "Canceled" || booking.status === "Waiting Approval") {
      return booking.status;
    }

    // Check if date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    // Parse the booking date safely (assuming format is YYYY-MM-DD)
    const bookingDate = new Date(booking.date);
    
    // If the date string is in YYYY-MM-DD format, parse it safely to avoid timezone issues
    if (booking.date.includes('-') && booking.date.length === 10) {
      const [year, month, day] = booking.date.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
      parsedDate.setHours(0, 0, 0, 0);
      
      return parsedDate < today ? "Past" : "Upcoming";
    }
    
    // Fallback for other date formats
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today ? "Past" : "Upcoming";
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
          {bookings.map((booking, index) => {
            const actualStatus = getActualStatus(booking);
            
            return (
              <tr key={`${booking.refId}`} className="border-t">
                <td className="py-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${statusClasses[actualStatus]}`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                </td>
                <td className="py-4">#{booking.refId}</td>
                <td className="py-4">{booking.date}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[actualStatus]}`}>
                    {actualStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}