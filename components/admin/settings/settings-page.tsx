"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  UserPlus,
  Badge
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminLayout from "@/components/admin/admin-layout"

// Define the form schemas
const accountSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


// Mock admin users data
const mockAdminUsers = [
  {
    id: 1,
    name: "John Admin",
    email: "john.admin@example.com",
    role: "Administrator",
    lastActive: "2025-04-06T15:30:00",
    status: "active"
  },
  {
    id: 2,
    name: "Sarah Manager",
    email: "sarah.manager@example.com",
    role: "Manager",
    lastActive: "2025-04-05T12:15:00",
    status: "active"
  },
  {
    id: 3,
    name: "Mike Supervisor",
    email: "mike.supervisor@example.com",
    role: "Supervisor",
    lastActive: "2025-04-04T09:45:00",
    status: "inactive"
  },
  {
    id: 4,
    name: "Emily Staff",
    email: "emily.staff@example.com",
    role: "Staff",
    lastActive: "2025-04-07T10:20:00",
    status: "active"
  }
];

export default function AccountSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountUpdated, setAccountUpdated] = useState(false)

  // Initialize forms
  const accountForm = useForm<z.infer<typeof accountSettingsSchema>>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      name: "Admin User",
      email: "admin@spotlesstransitions.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Form submission handlers
  const onSubmitAccountSettings = (data: z.infer<typeof accountSettingsSchema>) => {
    console.log("Account settings updated:", data)
    setAccountUpdated(true)
    // Reset password fields
    accountForm.reset({
      ...data,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    // Hide success message after 3 seconds
    setTimeout(() => setAccountUpdated(false), 3000)
  }


  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    })
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Your Account</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">Admin User</h3>
                    <p className="text-sm text-gray-600">Administrator</p>
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
                    >
                      Save Account Settings
                    </Button>
                    
                    {accountUpdated && (
                      <div className="flex items-center p-4 mt-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                        <Check className="h-5 w-5 mr-2" />
                        Account information updated successfully
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.role === "Administrator" ? "bg-purple-100 text-purple-800" :
                            user.role === "Manager" ? "bg-blue-100 text-blue-800" :
                            user.role === "Supervisor" ? "bg-orange-100 text-orange-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <Badge className={user.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          }>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className={user.status === "active" ? "text-red-600" : "text-green-600"}>
                                {user.status === "active" ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">4</span> of <span className="font-medium">4</span> team members
                  </p>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}