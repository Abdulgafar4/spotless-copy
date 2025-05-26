// components/booking/booking-types.ts
import { z } from "zod"

// Define booking form schema
export const bookingFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  street: z.string().min(5, { message: "Street address is required" }),
  postalCode: z.string().min(5, { message: "Valid postal code is required" }),
  service: z.string().min(1, "Please select a service"), // Make sure this is required
  branch: z.string().min(1, "Please select a branch"),   // Make sure this is required
  date: z.string({ required_error: "Please select a date" }),
  notes: z.string().optional(),
  // Property details fields
  bedrooms: z.coerce.number().min(0).max(10),
  bathrooms: z.coerce.number().min(0).max(10),
  livingRooms: z.coerce.number().min(0).max(5),
  garages: z.coerce.number().min(0).max(3),
  den: z.boolean(), // Removed optional() to match form default value
  // Payment option
  paymentOption: z.enum(["full", "deposit"])
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export interface Branch {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  price: string | number;
  status: string;
}

export interface PriceBreakdownItem {
  item: string;
  price: number;
}

// File upload constants
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB