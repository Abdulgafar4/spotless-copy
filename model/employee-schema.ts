import { z } from "zod";

// Define schema for the form
export const employeeSchema = z.object({
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

export type EmployeeFormValues = z.infer<typeof employeeSchema>;