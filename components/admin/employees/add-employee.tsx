"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface AddEmployeeDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onAdd: (employee: any) => void
  branches: string[]
}

// Define available roles
const availableRoles = [
  "Cleaner",
  "Team Lead",
  "Supervisor",
  "Manager",
  "Administrator"
];

// Define available skills
const availableSkills = [
  "Deep Cleaning",
  "Move-Out Cleaning",
  "Move-In Cleaning",
  "Carpet Cleaning",
  "Window Cleaning",
  "Appliance Cleaning",
  "Post-Construction Cleaning",
  "Team Management",
  "Quality Control",
  "Staff Training",
  "Customer Relations"
];

// Define schema for the form
const employeeSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  role: z.string().min(1, { message: "Please select a role" }),
  branch: z.string().min(1, { message: "Please select a branch" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  postalCode: z.string().min(5, { message: "Please enter a valid postal code" }),
  availability: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function AddEmployeeDialog({
  isOpen,
  setIsOpen,
  onAdd,
  branches
}: AddEmployeeDialogProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      branch: "",
      address: "",
      postalCode: "",
      availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      skills: [],
      notes: "",
    },
  });

  // Form submission handler
  const onSubmit = (data: EmployeeFormValues) => {
    onAdd(data);
    form.reset();
  };

  // Days of the week for availability selection
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new employee to your team.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Availability</FormLabel>
                    <FormDescription>
                      Select days when the employee is available to work
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="availability"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day}
                              className="flex flex-col items-center space-y-1"
                            >
                              <FormControl>
                                <div className="flex flex-col items-center">
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value || [], day])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day
                                            )
                                          )
                                    }}
                                  />
                                  <div className="text-xs mt-1">{day.substring(0, 3)}</div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Skills & Specialties</FormLabel>
                    <FormDescription>
                      Select the employee's skills and specializations
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSkills.map((skill) => (
                      <FormField
                        key={skill}
                        control={form.control}
                        name="skills"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={skill}
                              className="flex items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(skill)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value || [], skill])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== skill
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="leading-none mt-0.5">
                                <div className="text-sm font-medium">{skill}</div>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information about this employee"
                      className="resize-none min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any relevant notes about the employee
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Employee</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}