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

interface CancellationRequestFormProps {
  appointments: Appointment[];
  onSubmit: (appointmentId: string, reason: string) => Promise<boolean>;
}

const cancellationFormSchema = z.object({
  appointmentId: z.string({
    required_error: "Please select an appointment to cancel",
  }),
  reason: z.string()
    .min(10, { message: "Reason must be at least 10 characters" })
    .max(500, { message: "Reason must not exceed 500 characters" }),
});

type CancellationFormValues = z.infer<typeof cancellationFormSchema>;

export function CancellationRequestForm({ appointments, onSubmit }: CancellationRequestFormProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      appointmentId: "",
      reason: "",
    },
  });

  const handleFormSubmit = async (values: CancellationFormValues) => {
    setSubmitting(true);
    try {
      const success = await onSubmit(values.appointmentId, values.reason);
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
                    <SelectValue placeholder="Select an appointment to cancel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.service_type} - {formatDate(appointment.date)} at {appointment.time}
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
              <h3 className="font-medium mb-3">Appointment Details</h3>
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

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Cancellation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide the reason for cancellation"
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Providing a detailed reason helps us improve our services.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Cancellation Request"}
        </Button>
      </form>
    </Form>
  );
}