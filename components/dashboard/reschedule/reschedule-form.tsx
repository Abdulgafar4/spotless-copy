import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn, formatLongDate, formatTime } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  address: string;
  service_type: string;
  branch: string;
}

interface RescheduleRequestFormProps {
  appointments: Appointment[];
  timeSlots: string[];
  onSubmit: (
    appointmentId: string, 
    requestedDate: string, 
    requestedTime: string, 
    reason: string
  ) => Promise<boolean>;
}

const rescheduleFormSchema = z.object({
  appointmentId: z.string({
    required_error: "Please select an appointment",
  }),
  requestedDate: z.date({
    required_error: "Please select a date",
  }).refine(date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, {
    message: "Requested date must be today or in the future",
  }),
  requestedTime: z.string({
    required_error: "Please select a time",
  }),
  reason: z.string()
    .min(10, { message: "Reason must be at least 10 characters" })
    .max(500, { message: "Reason must not exceed 500 characters" }),
});

type RescheduleFormValues = z.infer<typeof rescheduleFormSchema>;

const DatePicker = ({ selected, onSelect, minDate }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const isToday = (day: any) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelected = (day: any) => {
    if (!selected) return false;
    return (
      day === selected.getDate() &&
      currentMonth.getMonth() === selected.getMonth() &&
      currentMonth.getFullYear() === selected.getFullYear()
    );
  };
  
  const isDisabled = (day: any) => {
    if (!minDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < minDate;
  };
  
  const handleDateClick = (day: any) => {
    if (isDisabled(day)) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect(newDate);
  };
  
  const monthName = format(currentMonth, "MMMM yyyy");
  
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const generateCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled(day)}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm",
            isSelected(day) && "bg-green-600 text-white",
            isToday(day) && !isSelected(day) && "border border-green-600",
            isDisabled(day) && "text-gray-300 cursor-not-allowed",
            !isSelected(day) && !isDisabled(day) && "hover:bg-gray-100"
          )}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <button 
          type="button" 
          onClick={prevMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          &lt;
        </button>
        <div className="font-medium">{monthName}</div>
        <button 
          type="button" 
          onClick={nextMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map(day => (
          <div key={day} className="h-8 w-8 flex items-center justify-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>
    </div>
  );
};

export function RescheduleRequestForm({ appointments, timeSlots, onSubmit }: RescheduleRequestFormProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: {
      appointmentId: "",
      requestedDate: undefined,
      requestedTime: "",
      reason: "",
    },
  });

  const handleFormSubmit = async (values: RescheduleFormValues) => {
    setSubmitting(true);
    try {
      const formattedDate = format(values.requestedDate, "yyyy-MM-dd");
      const success = await onSubmit(
        values.appointmentId, 
        formattedDate, 
        values.requestedTime, 
        values.reason
      );
      
      if (success) {
        // Reset form on success
        form.reset();
        setSelectedAppointment(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const selected = appointments.find(apt => apt.id === appointmentId) || null;
    setSelectedAppointment(selected);
  };

  const formatTimeForDisplay = (timeString: string) => {
    // Convert 24-hour format to 12-hour format if needed
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString; // Already in display format
  };

  // Function to get today's date with time set to 00:00:00
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <div className="mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Reschedule Appointment</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="appointmentId"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-base font-medium">Select Appointment</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleAppointmentChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select an appointment to reschedule" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {appointment.service_type} - {formatLongDate(appointment.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedAppointment && (
            <Card className="border-green-200 bg-green-50 mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 text-green-800">Current Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{formatLongDate(selectedAppointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{formatTime(selectedAppointment.time || selectedAppointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{selectedAppointment.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="requestedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-medium">Requested Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 pl-3 text-left font-normal flex justify-between items-center",
                            !field.value && "text-gray-400"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            "Select a date"
                          )}
                          <Calendar className="h-4 w-4 text-gray-500" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                        minDate={getToday()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select your preferred new date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Requested Time</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((timeSlot) => (
                        <SelectItem key={timeSlot} value={timeSlot}>
                          {formatTimeForDisplay(timeSlot)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your preferred new time
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Reason for Rescheduling</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide the reason for requesting a reschedule"
                    className="resize-none h-32 p-3"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Providing a detailed reason helps us process your request faster
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Reschedule Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}