import { SignupFormValues } from "@/model/signup-schema"
import { LoginFormValues } from "@/model/login-schema"


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

