// components/dashboard/reschedule/reschedule-form.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, CalendarIcon, Clock } from "lucide-react";
import { Appointment } from "@/hooks/use-client-appointments";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RescheduleRequestFormProps {
  appointments: Appointment[];
  timeSlots: string[];
  onSubmit: (appointmentId: string, requestedDate: string, requestedTime: string, reason: string) => Promise<boolean>;
  onAppointmentSelect: (appointmentId: string) => void;
  onDateSelect: (date: string) => void;
  loading?: boolean;
}

export function RescheduleRequestForm({
  appointments,
  timeSlots,
  onSubmit,
  onAppointmentSelect,
  onDateSelect,
  loading = false
}: RescheduleRequestFormProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle appointment selection
  const handleAppointmentChange = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedDate(undefined);
    setSelectedTime("");
    onAppointmentSelect(appointmentId);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (date) {
      onDateSelect(format(date, "yyyy-MM-dd"));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentId || !selectedDate || !selectedTime || !reason) {
      return;
    }

    setIsSubmitting(true);
    const requestedDate = format(selectedDate, "yyyy-MM-dd");

    const success = await onSubmit(
      selectedAppointmentId,
      requestedDate,
      selectedTime,
      reason
    );

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setSelectedAppointmentId("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setReason("");
    }
  };

  const selectedAppointment = appointments.find(apt => apt.id === selectedAppointmentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Appointment Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Appointment</label>
        <Select value={selectedAppointmentId} onValueChange={handleAppointmentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select appointment to reschedule" />
          </SelectTrigger>
          <SelectContent>
            {appointments.map((appointment) => (
              <SelectItem key={appointment.id} value={appointment.id}>
                {appointment.service_type} - {format(new Date(appointment.date), "MMMM d, yyyy")} at {appointment.time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Selection */}
      {selectedAppointmentId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  // Disable past dates and weekends (optional)
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0 || date.getDay() === 6;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Time</label>
          {loading ? (
            <div className="flex items-center justify-center p-4 border rounded-md bg-gray-50">
              <Clock className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading available times...</span>
            </div>
          ) : timeSlots.length > 0 ? (
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">No available time slots for this date</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Please select a different date or contact support.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reason for Rescheduling */}
      {selectedTime && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for Rescheduling</label>
          <Textarea
            placeholder="Please provide a reason for rescheduling"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      )}

      {/* Current Appointment Details */}
      {selectedAppointment && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-medium">Current Appointment Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Service</p>
              <p className="font-medium">{selectedAppointment.service_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Date & Time</p>
              <p className="font-medium">
                {format(new Date(selectedAppointment.date), "MMMM d, yyyy")} at {selectedAppointment.time}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Branch</p>
              <p className="font-medium">{selectedAppointment.branch}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{selectedAppointment.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!selectedAppointmentId || !selectedDate || !selectedTime || !reason || isSubmitting}
      >
        {isSubmitting ? "Submitting Request..." : "Submit Reschedule Request"}
      </Button>
    </form>
  );
}