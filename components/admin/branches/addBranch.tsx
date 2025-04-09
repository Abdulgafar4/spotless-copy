"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
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

// Define form schema
const branchFormSchema = z.object({
  name: z.string().min(2, { message: "Branch name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  manager: z.string().min(2, { message: "Manager name must be at least 2 characters" }),
  status: z.enum(["active", "inactive", "pending"]),
  employees: z.coerce.number().min(0),
  opendate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
})

type BranchFormValues = z.infer<typeof branchFormSchema>

interface AddBranchDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onAdd: (branch: BranchFormValues) => void
  onUpdate: (branch: BranchFormValues & { id: number }) => void
  branch?: any
}

export function AddBranchDialog({
  isOpen,
  setIsOpen,
  onAdd,
  onUpdate,
  branch,
}: AddBranchDialogProps) {
  const isEditMode = !!branch

  // Initialize form
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      manager: "",
      status: "active",
      employees: 0,
      opendate: new Date().toISOString().split('T')[0],
    },
  })

  // Update form values when editing
  useEffect(() => {
    if (isEditMode && branch) {
      form.reset({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        manager: branch.manager,
        status: branch.status,
        employees: branch.employees,
        opendate: branch.opendate,
      })
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        manager: "",
        status: "active",
        employees: 0,
        opendate: new Date().toISOString().split('T')[0],
      })
    }
  }, [form, branch, isEditMode, isOpen])

  // Form submission handler
  const onSubmit = (data: BranchFormValues) => {
    if (isEditMode) {
      onUpdate({ ...data, id: branch.id })
    } else {
      onAdd(data)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the branch information below."
              : "Fill in the details to create a new branch location."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Toronto Downtown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full branch address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 416-555-0100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Manager</FormLabel>
                    <FormControl>
                      <Input placeholder="Manager's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employees</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="opendate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}