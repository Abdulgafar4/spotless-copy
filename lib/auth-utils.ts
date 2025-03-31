import { z } from "zod"

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Signup schema
export const signupSchema = z
  .object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignupFormValues = z.infer<typeof signupSchema>

// Mock authentication functions
export const login = async (data: LoginFormValues) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would validate credentials with a backend
  // For now, we'll just return a success response
  return {
    success: true,
    user: {
      id: "1",
      name: "John Smith",
      email: data.email,
    },
  }
}

export const signup = async (data: SignupFormValues) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would register the user with a backend
  // For now, we'll just return a success response
  return {
    success: true,
    user: {
      id: "1",
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
    },
  }
}

