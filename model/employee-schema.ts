import { supabase } from "@/lib/supabaseClient";
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
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const validateEmployeeEmail = async (email: string) => {
  try {
    // Check if employee exists
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmployee) {
      return false;
    }

    // Check if auth user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    return !authUsers?.users?.some(user => user.email === email);
  } catch (error) {
    // If there's an error checking, assume email is available
    return true;
  }
};