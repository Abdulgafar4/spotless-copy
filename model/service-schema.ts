import { z } from "zod"

export const serviceFormSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  price: z.coerce.string().min(0, { message: "Price must be a positive number" }),
  category: z.string().min(2, { message: "Category must be at least 2 characters" }),
  status: z.enum(["active", "inactive", "seasonal"]),
  staffRequired: z.coerce.string().min(1, { message: "At least 1 staff member is required" }),
  imageUrl: z.string().optional(),
})
  
export type ServiceFormValues = z.infer<typeof serviceFormSchema>