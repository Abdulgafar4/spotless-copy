"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock, MapPin, AlertTriangle } from "lucide-react";
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
import { formatLongDate, formatTime } from "@/lib/utils";
import { calculateCancellationFee } from "@/lib/utils";
import { CancellationWarningDialog } from "./warning-dialog";

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
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [formValues, setFormValues] = useState<CancellationFormValues | null>(null);

  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      appointmentId: "",
      reason: "",
    },
  });

  // Check if appointment is within 3 days
  const isWithinThreeDays = (date: string): boolean => {
    const { feePercentage } = calculateCancellationFee(date);
    return feePercentage > 0;
  };

  const handleFormSubmit = async (values: CancellationFormValues) => {
    // Store form values for later use after dialog
    setFormValues(values);
    
    // Check if selected appointment is within 3 days
    if (selectedAppointment && isWithinThreeDays(selectedAppointment.date)) {
      // Show warning dialog
      setShowWarningDialog(true);
    } else {
      // Continue with submission directly
      await submitCancellationRequest(values);
    }
  };

  const submitCancellationRequest = async (values: CancellationFormValues) => {
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

  const handleDialogConfirm = async () => {
    // User confirmed despite warning, proceed with cancellation
    if (formValues) {
      await submitCancellationRequest(formValues);
    }
    setShowWarningDialog(false);
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const selected = appointments.find(apt => apt.id === appointmentId) || null;
    setSelectedAppointment(selected);
  };

  // Get cancellation fee information if appointment is selected
  const cancellationFeeInfo = selectedAppointment 
    ? calculateCancellationFee(selectedAppointment.date)
    : null;

  return (
    <>
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
            <Card className={`${isWithinThreeDays(selectedAppointment.date) 
              ? "border-amber-200 bg-amber-50" 
              : "border-green-200 bg-green-50"}`}>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Appointment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    <span>{selectedAppointment.service_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{formatLongDate(selectedAppointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span>{selectedAppointment.address}</span>
                  </div>
                  
                  {cancellationFeeInfo && cancellationFeeInfo.feePercentage > 0 && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-amber-100 rounded-md border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <span className="font-medium">Late Cancellation Notice:</span>{" "}
                        {cancellationFeeInfo.message}
                        {cancellationFeeInfo.feePercentage > 0 && (
                          <p className="mt-1 font-medium">
                            A {cancellationFeeInfo.feePercentage}% cancellation fee will apply.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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

      {/* Warning Dialog */}
      {selectedAppointment && (
        <CancellationWarningDialog
          isOpen={showWarningDialog}
          onOpenChange={setShowWarningDialog}
          onConfirm={handleDialogConfirm}
          appointmentDate={selectedAppointment.date}
        />
      )}
    </>
  );
}