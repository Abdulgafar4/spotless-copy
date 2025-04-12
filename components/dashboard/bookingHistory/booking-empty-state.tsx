// components/dashboard/bookingHistory/booking-empty-state.tsx
import { FileText } from "lucide-react";

export function BookingEmptyState() {
  return (
    <div className="text-center py-10">
      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">No booking history</h3>
      <p className="mt-2 text-sm text-gray-500">
        You haven't made any bookings yet.
      </p>
    </div>
  );
}
