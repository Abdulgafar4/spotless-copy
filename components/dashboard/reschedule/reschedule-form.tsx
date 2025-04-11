"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock, MapPin, Building } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Appointment</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleAppointmentChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an appointment to reschedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.service_type} - {formatDate(appointment.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAppointment && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Current Appointment Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  <span>{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>{selectedAppointment.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span>{selectedAppointment.branch}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requestedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Requested Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
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
                <FormLabel>Requested Time</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
              <FormLabel>Reason for Rescheduling</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide the reason for requesting a reschedule"
                  className="resize-none h-32"
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

        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Reschedule Request"}
        </Button>
      </form>
    </Form>
  );
}