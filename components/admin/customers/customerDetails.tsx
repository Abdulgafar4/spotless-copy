"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  CreditCard,
  Clock,
  ClipboardList,
  PenLine,
  Save,
  FileText
} from "lucide-react"

interface CustomerDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  customer: any
}

// Mock booking history data
const mockBookingHistory = [
  {
    id: "BOK-10245",
    service: "Move-Out Cleaning",
    date: "2025-03-28T10:00:00",
    status: "completed",
    amount: 245.50,
    branch: "Toronto Downtown",
    staff: ["Emma Wilson", "David Lee"],
    address: "123 Main Street, Toronto, ON"
  },
  {
    id: "BOK-10198",
    service: "Deep Cleaning",
    date: "2025-02-15T13:30:00",
    status: "completed",
    amount: 189.75,
    branch: "Toronto Downtown",
    staff: ["Michael Brown", "Jessica Clark"],
    address: "123 Main Street, Toronto, ON"
  },
  {
    id: "BOK-10156",
    service: "Window Cleaning",
    date: "2025-01-10T09:00:00",
    status: "completed",
    amount: 120.25,
    branch: "Toronto Downtown",
    staff: ["Laura Taylor"],
    address: "123 Main Street, Toronto, ON"
  },
  {
    id: "BOK-10134",
    service: "Carpet Cleaning",
    date: "2024-12-05T14:00:00",
    status: "completed",
    amount: 150.00,
    branch: "Toronto Downtown",
    staff: ["Kevin Wilson"],
    address: "123 Main Street, Toronto, ON"
  },
  {
    id: "BOK-10098",
    service: "Move-In Cleaning",
    date: "2024-11-20T11:30:00",
    status: "completed",
    amount: 265.00,
    branch: "North York",
    staff: ["Christopher White", "Elizabeth Davis"],
    address: "789 University Avenue, Toronto, ON"
  }
]

export function CustomerDetailsDialog({
  isOpen,
  setIsOpen,
  customer
}: CustomerDetailsDialogProps) {
  // No state for editing needed - admin is only viewing customer details

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  // Format datetime helper
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  }

  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customer Details</span>
            <Badge className={customer.status === "active" 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
            }>
              {customer.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start gap-4 my-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {customer.firstName[0]}{customer.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">
              {customer.firstName} {customer.lastName}
            </h2>
            <div className="flex flex-col space-y-1 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Mail className="h-4 w-4" /> 
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone className="h-4 w-4" /> 
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Building className="h-4 w-4" /> 
                <span>{customer.preferredBranch || "No preferred branch"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="address">Address & Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                <p className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(customer.registrationDate)}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Last Booking</h3>
                <p className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {customer.lastBookingDate ? formatDate(customer.lastBookingDate) : "No bookings yet"}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <p className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  {customer.totalBookings} bookings
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                <p className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  ${customer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Customer Notes</h3>
              </div>
              <div className="mt-2 min-h-20 p-2 bg-gray-50 rounded-md">
                {customer.notes ? (
                  <p className="text-sm">{customer.notes}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No notes available for this customer</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-6">
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockBookingHistory.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(booking.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${booking.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="address" className="mt-6 space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>
                    {customer.address}<br />
                    Postal Code: {customer.postalCode}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Customer Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-28">
                {customer.notes ? (
                  <p className="text-sm whitespace-pre-line">{customer.notes}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No notes available for this customer</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )}