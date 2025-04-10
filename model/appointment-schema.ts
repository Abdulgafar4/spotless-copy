import { z } from "zod";

export const appointmentFormSchema = z.object({
    title: z.string().min(3, { message: "Service title must be at least 3 characters" }),
    customer: z.string().min(2, { message: "Customer name must be at least 2 characters" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    date: z.date(),
    time: z.string(),
    duration: z.string().min(1, { message: "Duration is required" }),
    branch: z.string().min(1, { message: "Branch is required" }),
    status: z.enum(["confirmed", "pending", "cancelled"]),
    staff: z.array(z.string()).min(1, { message: "At least one staff member is required" }),
    notes: z.string().optional(),
  });
  
 export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>