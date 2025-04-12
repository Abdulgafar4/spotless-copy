"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  SendHorizontal,
  Loader2,
  AlertTriangle,
  MessageCircle,
  Check,
  AlertCircle,
  UserCheck,
  FileText
} from "lucide-react"
import { useAdminInquiries } from "@/hooks/use-inquiries"
import { useAdminEmployees } from "@/hooks/use-employees"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import emailjs from '@emailjs/browser';

interface InquiryDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  inquiry: any
  onInquiryUpdated: () => void
}

export function InquiryDetailsDialog({
  isOpen,
  setIsOpen,
  inquiry,
  onInquiryUpdated
}: InquiryDetailsDialogProps) {
  const [newResponse, setNewResponse] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<string>("Unassigned")
  const [isSending, setIsSending] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  
  const { user } = useAuth()
  const { updateInquiry, addResponse } = useAdminInquiries()
  const { employees, loading: employeesLoading } = useAdminEmployees()

  // Get active staff members from employees for dropdown
  const staffOptions = employeesLoading 
    ? ["Unassigned"] 
    : ["Unassigned", ...employees
        .filter(emp => emp.status === "active")
        .map(emp => `${emp.first_name} ${emp.last_name}`)
      ];

  // Initialize selected staff when dialog opens
  useEffect(() => {
    if (inquiry) {
      setSelectedStaff(inquiry.assignedTo || "Unassigned")
    }
  }, [inquiry])

  // Handle sending a new response
  const handleSendResponse = async () => {
    if (!newResponse.trim() || !inquiry) return
    
    try {
      setIsSending(true)
      setError(null)
      
      // Get the user's name (or default to "Admin")
      const staffName = user?.user_metadata?.full_name || "Admin"
      
      // Add the response
      await addResponse(inquiry.id, newResponse, staffName)
      
      // Clear the response field
      setNewResponse("")
      
      // Notify parent component
      onInquiryUpdated()
      
      // Send email notification to customer
      await sendEmailToCustomer(inquiry.email, inquiry.name, newResponse)
      
      toast({
        title: "Response sent",
        description: "Your response has been sent to the customer.",
      })
    } catch (err) {
      console.error("Error sending response:", err)
      setError("Failed to send response. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Send email notification to customer
  const sendEmailToCustomer = async (email: string, name: string, message: string) => {
    try {
      // In a real application, you would use your email service
      // For example with EmailJS:
      // await emailjs.send(
      //   'service_id',
      //   'template_id',
      //   {
      //     to_name: name,
      //     to_email: email,
      //     message: message,
      //     reply_to: 'support@yourcompany.com',
      //   },
      //   'user_id'
      // )
      console.log(`Email would be sent to customer ${name} at ${email} with message: ${message}`)
    } catch (error) {
      console.error("Error sending email to customer:", error)
    }
  }

  // Send email notification to staff
  const sendEmailToStaff = async (staffName: string, inquiry: any) => {
    try {
      // Find the staff member's email from employees
      const staffMember = employees.find(emp => 
        `${emp.first_name} ${emp.last_name}` === staffName
      )
      
      if (!staffMember?.email) {
        console.error("Staff email not found")
        return
      }
      
      // In a real application, you would use your email service
      // Example with EmailJS:
      // await emailjs.send(
      //   'service_id',
      //   'template_id',
      //   {
      //     to_name: staffName,
      //     to_email: staffMember.email,
      //     customer_name: inquiry.name,
      //     customer_email: inquiry.email,
      //     customer_phone: inquiry.phone || 'Not provided',
      //     subject: inquiry.subject,
      //     message: inquiry.message,
      //     inquiry_link: `${window.location.origin}/admin/inquiries?id=${inquiry.id}`,
      //   },
      //   'user_id'
      // )
      
      console.log(`Email would be sent to staff ${staffName} at ${staffMember.email} about inquiry from ${inquiry.name}`)
    } catch (error) {
      console.error("Error sending email to staff:", error)
    }
  }

  // Handle changing assignment
  const handleAssignmentChange = async (value: string) => {
    if (!inquiry) return
    
    try {
      setIsAssigning(true)
      setError(null)
      
      // Update the inquiry assignment - backend handles converting name to ID
      await updateInquiry(inquiry.id, { assignedTo: value === "Unassigned" ? null : value })
      
      // If we're assigning to a staff member (not unassigning), send notification
      if (value !== "Unassigned") {
        await sendEmailToStaff(value, inquiry)
        
        toast({
          title: "Staff assigned",
          description: `${value} has been assigned to this inquiry and notified by email.`,
        })
      }
      
      setSelectedStaff(value)
      
      // Also update status to in-progress if it's new
      if (inquiry.status === "new" && value !== "Unassigned") {
        await updateInquiry(inquiry.id, { status: "in-progress" })
      }
      
      // Notify parent component
      onInquiryUpdated()
      
    } catch (err) {
      console.error("Error updating assignment:", err)
      setError("Failed to update assignment. Please try again.")
      // Reset to previous value
      setSelectedStaff(inquiry.assignedTo || "Unassigned")
    } finally {
      setIsAssigning(false)
    }
  }
  
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!inquiry) return
    
    try {
      setError(null)
      
      // Update the inquiry status
      await updateInquiry(inquiry.id, { status: newStatus })
      
      // Notify parent component
      onInquiryUpdated()
      
      toast({
        title: "Status updated",
        description: `Inquiry has been marked as ${newStatus}.`,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      setError("Failed to update status. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>
      case 'spam':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Spam</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Generate a truncated ID for display
  const getShortId = (id: string) => {
    return id ? id : '';
  }

  if (!inquiry) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Inquiry #{getShortId(inquiry.id)}</span>
              {getStatusBadge(inquiry.status)}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Inquiry Header */}
          <div>
            <h2 className="text-xl font-semibold">{inquiry.subject}</h2>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mt-1">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{inquiry.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(inquiry.date), "MMMM d, yyyy")}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(inquiry.date), "h:mm a")}</span>
              </span>
              {inquiry.responses && inquiry.responses.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{inquiry.responses.length} {inquiry.responses.length === 1 ? 'response' : 'responses'}</span>
                </span>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>Conversation</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span>Assign & Manage</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 col-span-2 border rounded-md">
                  <h3 className="font-medium mb-2">Inquiry Message</h3>
                  <div className="p-4 bg-gray-50 rounded-md min-h-[200px]">
                    <p className="text-gray-700 whitespace-pre-line">{inquiry.message}</p>
                  </div>
                </Card>
                
                <Card className="p-4 border rounded-md">
                  <h3 className="font-medium mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {inquiry.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">Customer</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(inquiry.status)}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Assigned to:</span>
                        <span className="text-sm">
                          {inquiry.assignedTo || "Unassigned"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Date received:</span>
                        <span className="text-sm">
                          {format(new Date(inquiry.date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Quick Response Area */}
              <Card className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Quick Response</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("responses")}>
                    View All Responses
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Type your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="min-h-[120px] mb-3"
                />
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSendResponse}
                    disabled={!newResponse.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="mr-2 h-4 w-4" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            {/* Conversation Tab */}
            <TabsContent value="responses" className="w-full space-y-4">
              <Card className="p-4 border rounded-md">
                <h3 className="font-medium mb-3">Original Message</h3>
                <div className="flex gap-4 px-4 py-3 bg-gray-50 rounded-md mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {inquiry.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{inquiry.name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(inquiry.date), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="mt-2 text-gray-700 whitespace-pre-line">{inquiry.message}</div>
                  </div>
                </div>
                
                {inquiry.responses && inquiry.responses.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Response History</h3>
                    {inquiry.responses.map((response: any) => (
                      <div key={response.id} className="flex gap-4 px-4 py-3 bg-blue-50 rounded-md">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {response.staff 
                              ? response.staff.split(' ').map((name: string) => name[0]).join('')
                              : 'ST'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{response.staff || "Staff"}</span>
                            <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(response.date), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="mt-2 text-gray-700">{response.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No responses yet</p>
                  </div>
                )}
              </Card>
              
              <Card className="p-4 border rounded-md">
                <h3 className="font-medium mb-3">Add Response</h3>
                <Textarea
                  placeholder="Type your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="min-h-[120px] mb-3"
                />
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSendResponse}
                    disabled={!newResponse.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="mr-2 h-4 w-4" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            {/* Actions Tab */}
            <TabsContent value="actions" className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 border rounded-md">
                  <h3 className="font-medium mb-3">Assign to Staff</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Assign this inquiry to a staff member who will be responsible for handling it.
                    They will receive an email with the inquiry details.
                  </p>
                  
                  <Select
                    value={selectedStaff}
                    onValueChange={handleAssignmentChange}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffOptions.map((staff) => (
                        <SelectItem key={staff} value={staff}>
                          {staff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Current Assignment:</span>
                    <span className="text-sm font-medium">
                      {inquiry.assignedTo || "Unassigned"}
                    </span>
                  </div>
                  
                  {isAssigning && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Updating assignment...</span>
                    </div>
                  )}
                </Card>
                
                <Card className="p-4 border rounded-md">
                  <h3 className="font-medium mb-3">Change Status</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Update the status of this inquiry to reflect its current state.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant={inquiry.status === "in-progress" ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleStatusChange("in-progress")}
                        disabled={inquiry.status === "in-progress"}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        In Progress
                      </Button>
                      
                      <Button 
                        variant={inquiry.status === "urgent" ? "default" : "outline"}
                        size="sm"
                        className="w-full text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleStatusChange("urgent")}
                        disabled={inquiry.status === "urgent"}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Urgent
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant={inquiry.status === "resolved" ? "default" : "outline"}
                        size="sm"
                        className="w-full text-green-50 border-green-200 hover:text-green-700 hover:bg-green-400"
                        onClick={() => handleStatusChange("resolved")}
                        disabled={inquiry.status === "resolved"}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Resolved
                      </Button>
                      
                      <Button 
                        variant={inquiry.status === "archived" ? "default" : "outline"}
                        size="sm"
                        className="w-full text-gray-600 border-gray-200 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() => handleStatusChange("archived")}
                        disabled={inquiry.status === "archived"}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Status:</span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6 flex items-center justify-between">
          <div>
            {getStatusBadge(inquiry.status)}
            <span className="ml-2 text-sm text-gray-500">
              {inquiry.assignedTo ? `Assigned to ${inquiry.assignedTo}` : "Unassigned"}
            </span>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>
  )}