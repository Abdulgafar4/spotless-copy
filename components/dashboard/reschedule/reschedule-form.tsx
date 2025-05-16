import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Appointment } from "@/hooks/use-client-appointments";
import { CalendarComponent } from "@/components/dashboard/overview/Calendar";
import { formatLongDate } from "@/lib/utils";

interface RescheduleRequestFormProps {
  appointments: Appointment[];
  onSubmit: (appointmentId: string, requestedDate: string, requestedTime: string, reason: string) => Promise<boolean>;
  onAppointmentSelect: (appointmentId: string) => void;
  onDateSelect?: (date: string) => void;
}

// Define available time slots
const TIME_SLOTS = [
  "9:00 ", "9:30 ", "10:00 ", "10:30 ", 
  "11:00 ", "11:30 ", "12:00 ", "12:30 ",
  "1:00 ", "1:30 ", "2:00 ", "2:30 ", 
  "3:00 ", "3:30 ", "4:00 ", "4:30 ",
  "5:00 ", "5:30 "
];

export function RescheduleRequestForm({
  appointments,
  onSubmit,
  onAppointmentSelect,
  onDateSelect
}: RescheduleRequestFormProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle appointment selection
  const handleAppointmentChange = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedDate("");
    setSelectedTime("");
    onAppointmentSelect(appointmentId);
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Handle time selection
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentId || !selectedDate || !selectedTime || !reason) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await onSubmit(
      selectedAppointmentId,
      selectedDate,
      selectedTime,
      reason
    );

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setSelectedAppointmentId("");
      setSelectedDate("");
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
                {appointment.service_type} - {formatLongDate(appointment.date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid layout for date selection and reason */}
      {selectedAppointmentId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection - Using CalendarComponent from Quick Booking */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred New Date</label>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <CalendarComponent 
                onSelectDate={handleDateSelect}
              />
            </div>
          </div>

          {/* Right column for time and reason */}
          <div className="space-y-4">
            {/* Time Selection - Only show if a date is selected */}
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Time</label>
                <Select value={selectedTime} onValueChange={handleTimeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reason Input - Only show if both date and time are selected */}
            {selectedDate && selectedTime && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Rescheduling</label>
                <Textarea
                  placeholder="Please provide a reason for rescheduling"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="resize-none h-full min-h-[300px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected New Date and Time Display */}
      {selectedDate && selectedTime && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="font-medium text-green-800">
            You're requesting to reschedule to: <span className="font-bold">{formatLongDate(selectedDate)} at {selectedTime}</span>
          </p>
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