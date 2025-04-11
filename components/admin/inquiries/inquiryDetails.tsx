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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  SendHorizontal,
  Loader2,
  AlertTriangle 
} from "lucide-react"
import { useAdminInquiries } from "@/hooks/use-inquiries"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InquiryDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  inquiry: any
  onInquiryUpdated: () => void
}

// Mock staff members data (this would come from the employees in a real implementation)
const staffMembers = [
  "Unassigned",
  "Lisa Wong",
  "David Parker",
  "Robert Johnson",
  "Emily Davis",
  "Michael Wilson",
  "Jennifer Brown"
]

export function InquiryDetailsDialog({
  isOpen,
  setIsOpen,
  inquiry,
  onInquiryUpdated
}: InquiryDetailsDialogProps) {
  const [newResponse, setNewResponse] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<string>("Unassigned")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { updateInquiry, addResponse } = useAdminInquiries()

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
    } catch (err) {
      console.error("Error sending response:", err)
      setError("Failed to send response. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Handle changing assignment
  const handleAssignmentChange = async (value: string) => {
    if (!inquiry) return
    
    try {
      setError(null)
      // In database, "Unassigned" should be stored as null
      const assignedTo = value === "Unassigned" ? null : value
      
      // Update the inquiry assignment
      await updateInquiry(inquiry.id, { assignedTo })
      
      setSelectedStaff(value)
      
      // Notify parent component
      onInquiryUpdated()
    } catch (err) {
      console.error("Error updating assignment:", err)
      setError("Failed to update assignment. Please try again.")
      // Reset to previous value
      setSelectedStaff(inquiry.assignedTo || "Unassigned")
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
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (!inquiry) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Inquiry Details</span>
            {getStatusBadge(inquiry.status)}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          <div className="col-span-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{inquiry.subject}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(inquiry.date), "MMMM d, yyyy")}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(inquiry.date), "h:mm a")}</span>
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700 whitespace-pre-line">{inquiry.message}</p>
              </div>
              
              {inquiry.responses && inquiry.responses.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium">Conversation History</h4>
                  <div className="space-y-4">
                    {inquiry.responses.map((response: any) => (
                      <div key={response.id} className="flex gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {response.staff 
                              ? response.staff.split(' ').map((name: string) => name[0]).join('')
                              : inquiry.name.split(' ').map((name: string) => name[0]).join('')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{response.staff || inquiry.name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(response.date), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-700">{response.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-medium mb-3">Customer Information</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{inquiry.name}</span>
                </div>
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
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-3">Assign to Staff</h4>
              <Select
                value={selectedStaff}
                onValueChange={handleAssignmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Separator className="my-4" />
              
              <h4 className="font-medium mb-3">Change Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange("resolved")}
                  disabled={inquiry.status === "resolved"}
                >
                  Mark Resolved
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleStatusChange("urgent")}
                  disabled={inquiry.status === "urgent"}
                >
                  Flag Urgent
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Reply to Inquiry</h4>
          <Textarea
            placeholder="Type your response here..."
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}