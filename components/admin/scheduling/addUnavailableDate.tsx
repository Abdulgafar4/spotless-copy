"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { unavailableDateFormSchema, UnavailableDateFormValues, UnavailableDate } from "@/model/unavailable-date-schema"
import { useAdminBranches } from "@/hooks/use-branch"

interface AddUnavailableDateDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onAdd: (date: UnavailableDateFormValues) => void
  onUpdate: (date: UnavailableDateFormValues & { id: number }) => void
  unavailableDate?: UnavailableDate | null
}

export function AddUnavailableDateDialog({
  isOpen,
  setIsOpen,
  onAdd,
  onUpdate,
  unavailableDate,
}: AddUnavailableDateDialogProps) {
  const isEditMode = !!unavailableDate
  const [is_recurring, setIsRecurring] = useState(false)
  
  // Fetch branches from backend
  const { branches, loading: branchesLoading } = useAdminBranches()

  // Create branches array with "All Branches" option
  const branchOptions = [
    { name: "All Branches", value: "All Branches" },
    ...branches.map(branch => ({ name: branch.name, value: branch.name }))
  ]

  // Initialize form
  const form = useForm<UnavailableDateFormValues>({
    resolver: zodResolver(unavailableDateFormSchema),
    defaultValues: {
      date: new Date(),
      reason: "",
      branch: "",
      is_recurring: false,
      recurring_type: undefined,
      end_date: undefined,
    },
  })

  // Watch the isRecurring field to show/hide related fields
  const watchIs_recurring = form.watch("is_recurring")

  useEffect(() => {
    setIsRecurring(watchIs_recurring)
  }, [watchIs_recurring])

  // Update form values when editing
  useEffect(() => {
    if (isEditMode && unavailableDate) {
      form.reset({
        date: new Date(unavailableDate.date),
        reason: unavailableDate.reason,
        branch: unavailableDate.branch,
        is_recurring: unavailableDate.is_recurring,
        recurring_type: unavailableDate.recurring_type || undefined,
        end_date: unavailableDate.end_date ? new Date(unavailableDate.end_date) : undefined,
      })
      setIsRecurring(unavailableDate.is_recurring)
    } else {
      form.reset({
        date: new Date(),
        reason: "",
        branch: "",
        is_recurring: false,
        recurring_type: undefined,
        end_date: undefined,
      })
      setIsRecurring(false)
    }
  }, [form, unavailableDate, isEditMode, isOpen])

  // Form submission handler
  const onSubmit = (data: UnavailableDateFormValues) => {
    if (isEditMode && unavailableDate) {
      onUpdate({ ...data, id: unavailableDate.id })
    } else {
      onAdd(data)
    }
  }

  // Get today's date for minimum date validation
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Unavailable Date" : "Add Unavailable Date"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the unavailable date information below."
              : "Set a date when services will not be available."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const selectedDate = e.target.value ? new Date(e.target.value) : new Date()
                        field.onChange(selectedDate)
                      }}
                      min={today.toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={branchesLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branchOptions.map((branch) => (
                        <SelectItem key={branch.value} value={branch.value}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Holiday, Maintenance, Training" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Recurring Date
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This date will repeat annually, monthly, or weekly
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {is_recurring && (
              <>
                <FormField
                  control={form.control}
                  name="recurring_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recurring type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem> */}
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const selectedDate = e.target.value ? new Date(e.target.value) : null
                            field.onChange(selectedDate)
                          }}
                          min={form.getValues("date")?.toISOString().split('T')[0] || today.toISOString().split('T')[0]}
                          className="w-full"
                          placeholder="Select end date (optional)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </>
            )}
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={branchesLoading}>
                {isEditMode ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}