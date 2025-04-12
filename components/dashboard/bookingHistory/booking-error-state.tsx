// components/dashboard/bookingHistory/booking-error-state.tsx
import { Button } from "@/components/ui/button";

interface BookingErrorStateProps {
  onRetry: () => void;
}

export function BookingErrorState({ onRetry }: BookingErrorStateProps) {
  return (
    <div className="p-8 text-center text-red-500">
      <p>Error loading booking history</p>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}