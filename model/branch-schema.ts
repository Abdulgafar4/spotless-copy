import { z } from "zod"

export const branchFormSchema = z.object({
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
  
 export type BranchFormValues = z.infer<typeof branchFormSchema>