"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { appointmentFormSchema, AppointmentFormValues } from "@/model/appointment-schema"
import { 
  SelectField, 
  InputField, 
  TextareaField, 
  DatePickerField, 
  CheckboxGroupField 
} from "@/components/shared/FormFields"
import { 
  TIME_SLOTS, 
  DURATIONS, 
  SERVICE_TYPES, 
  BRANCHES, 
  STATUSES,
  staffMembers
} from "@/constants/appointment-constants"

interface AddAppointmentDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onAdd: (appointment: any) => void
  selectedDate: Date | null
}

export function AddAppointmentDialog({
  isOpen,
  setIsOpen,
  onAdd,
  selectedDate
}: AddAppointmentDialogProps) {
  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: "",
      customer: "",
      phone: "",
      address: "",
      date: selectedDate || new Date(),
      time: "09:00",
      duration: "3 hours",
      branch: "",
      status: "confirmed",
      staff: [],
      notes: "",
    },
  })

  // Update date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate)
    }
  }, [selectedDate, form])

  // Form submission handler
  const onSubmit = (data: AppointmentFormValues) => {
    // Format the date to string for consistency with mock data
    const formattedData = {
      ...data,
      date: format(data.date, "yyyy-MM-dd")
    }
    onAdd(formattedData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new service appointment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                control={form.control}
                name="title"
                label="Service Type"
                placeholder="Select service"
                options={SERVICE_TYPES}
              />

              <SelectField
                control={form.control}
                name="branch"
                label="Branch"
                placeholder="Select branch"
                options={BRANCHES}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                control={form.control}
                name="customer"
                label="Customer Name"
                placeholder="Full name"
              />

              <InputField
                control={form.control}
                name="phone"
                label="Phone Number"
                placeholder="e.g. 416-555-9876"
              />
            </div>

            <InputField
              control={form.control}
              name="address"
              label="Service Address"
              placeholder="Full address"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DatePickerField 
                control={form.control} 
                name="date" 
              />

              <SelectField
                control={form.control}
                name="time"
                label="Time"
                placeholder="Select time"
                options={TIME_SLOTS}
              />

              <SelectField
                control={form.control}
                name="duration"
                label="Duration"
                placeholder="Select duration"
                options={DURATIONS}
              />
            </div>

            <SelectField
              control={form.control}
              name="status"
              label="Status"
              placeholder="Select status"
              options={STATUSES}
            />
            
            <CheckboxGroupField
              control={form.control}
              name="staff"
              label="Assign Staff"
              options={staffMembers}
            />

            <TextareaField
              control={form.control}
              name="notes"
              label="Notes (Optional)"
              placeholder="Any special instructions or notes for this appointment"
            />

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Schedule Appointment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}