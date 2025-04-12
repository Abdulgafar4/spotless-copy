"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  EyeOff, 
  Check,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminLayout from "@/components/admin/admin-layout"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"

// Define the form schemas
const accountSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }).optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AccountSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountUpdated, setAccountUpdated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { userSettings, loading, error, updateSettings, updatePassword } = useSettings()

  // Initialize form
  const accountForm = useForm<z.infer<typeof accountSettingsSchema>>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Update form when userSettings is loaded
  useEffect(() => {
    if (userSettings) {
      accountForm.reset({
        name: userSettings.name,
        email: userSettings.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [userSettings, accountForm])

  // Form submission handler
  const onSubmitAccountSettings = async (data: z.infer<typeof accountSettingsSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Update user info
      await updateSettings({
        name: data.name,
        email: data.email,
      })
      
      // Update password if provided
      if (data.newPassword) {
        await updatePassword(data.currentPassword, data.newPassword)
      }
      
      // Show success message
      toast.success("Account settings updated successfully")
      setAccountUpdated(true)
      
      // Reset password fields
      accountForm.setValue("currentPassword", "")
      accountForm.setValue("newPassword", "")
      accountForm.setValue("confirmPassword", "")
      
      // Hide success message after 3 seconds
      setTimeout(() => setAccountUpdated(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to update account settings"
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!userSettings?.name) return "AU"
    
    return userSettings.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account details and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                Error loading settings: {error.message}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{userSettings?.name}</h3>
                    <p className="text-sm text-gray-600">{userSettings?.role.toLocaleUpperCase() || "Administrator"}</p>
                    {userSettings?.lastLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last login: {new Date(userSettings.lastLogin).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <Form {...accountForm}>
                  <form 
                    onSubmit={accountForm.handleSubmit(onSubmitAccountSettings)} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={accountForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={accountForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="absolute right-0 top-0 h-full aspect-square"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={accountForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showNewPassword ? "text" : "password"}
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full aspect-square"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                  >
                                    {showNewPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Leave blank if you don't want to change your password
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={accountForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full aspect-square"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Account Settings"
                      )}
                    </Button>
                    
                    {accountUpdated && (
                      <div className="flex items-center p-4 mt-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                        <Check className="h-5 w-5 mr-2" />
                        Account information updated successfully
                      </div>
                    )}
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}