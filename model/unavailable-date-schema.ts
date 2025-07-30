import { z } from "zod"

export const unavailableDateFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  reason: z.string().min(1, "Reason is required").max(255, "Reason must be less than 255 characters"),
  branch: z.string().min(1, "Branch is required"),
  is_recurring: z.boolean().default(false),
  recurring_type: z.enum(["weekly", "monthly", "yearly"]).optional(),
  end_date: z.date().optional(),
})

export type UnavailableDateFormValues = z.infer<typeof unavailableDateFormSchema>

export interface UnavailableDate {
  id: number
  date: string // YYYY-MM-DD format
  reason: string
  branch: string
  is_recurring: boolean
  recurring_type?: "weekly" | "monthly" | "yearly"
  end_date?: string
  createdAt: string
  updatedAt: string
}