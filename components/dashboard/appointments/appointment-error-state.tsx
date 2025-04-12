// components/dashboard/appointments/appointment-error-state.tsx
import { Button } from "@/components/ui/button";

interface AppointmentErrorStateProps {
  onRetry: () => void;
}

export function AppointmentErrorState({ onRetry }: AppointmentErrorStateProps) {
  return (
    <div className="p-8 text-center text-red-500">
      <p>Error loading appointments</p>
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