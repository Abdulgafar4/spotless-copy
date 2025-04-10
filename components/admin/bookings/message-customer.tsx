"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Mail, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MessageCustomerDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  booking: any
  onSendMessage: (message: string) => void
}

// Template options
const messageTemplates = [
  { value: "confirmation", label: "Booking Confirmation" },
  { value: "reminder", label: "Appointment Reminder" },
  { value: "cancellation", label: "Booking Cancellation" },
  { value: "reschedule", label: "Reschedule Request" },
  { value: "followup", label: "Service Follow-up" },
  { value: "custom", label: "Custom Message" },
];

// Template content
const templateContent = {
  confirmation: `Dear {{customerName}},

Thank you for booking with Spotless Transitions. Your booking for {{service}} on {{date}} at {{time}} has been confirmed.

Please ensure someone is available to provide access to the property. If you have any questions or need to make changes, please contact us.

Best regards,
Spotless Transitions Team`,

  reminder: `Dear {{customerName}},

This is a friendly reminder about your upcoming appointment with Spotless Transitions for {{service}} tomorrow, {{date}} at {{time}}.

Please ensure the property is accessible for our team. If you need to reschedule, please contact us as soon as possible.

Best regards,
Spotless Transitions Team`,

  cancellation: `Dear {{customerName}},

We're sorry to inform you that your booking for {{service}} on {{date}} at {{time}} has been cancelled.

Please contact our customer service if you would like to reschedule or if you have any questions.

We apologize for any inconvenience.

Best regards,
Spotless Transitions Team`,

  reschedule: `Dear {{customerName}},

We need to reschedule your appointment for {{service}} on {{date}} at {{time}}.

Please contact us at your earliest convenience to arrange a new date and time.

We apologize for any inconvenience.

Best regards,
Spotless Transitions Team`,

  followup: `Dear {{customerName}},

Thank you for choosing Spotless Transitions for your recent {{service}} on {{date}}.

We hope you were satisfied with our service. We would appreciate your feedback to help us improve our services.

Best regards,
Spotless Transitions Team`,

  custom: ""
};

export function MessageCustomerDialog({
  isOpen,
  setIsOpen,
  booking,
  onSendMessage
}: MessageCustomerDialogProps) {
  const [messageContent, setMessageContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("custom")
  const [messageSent, setMessageSent] = useState(false)
  
  // Handle template selection
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    
    let content = templateContent[template as keyof typeof templateContent] || "";
    
    // Replace placeholders with actual data if booking exists
    if (booking) {
      const date = new Date(booking.date);
      content = content
        .replace(/{{customerName}}/g, booking.customerName)
        .replace(/{{service}}/g, booking.service)
        .replace(/{{date}}/g, date.toLocaleDateString())
        .replace(/{{time}}/g, date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    
    setMessageContent(content);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!messageContent.trim()) return;
    
    onSendMessage(messageContent);
    setMessageSent(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setMessageSent(false);
      setMessageContent("");
      setIsOpen(false);
    }, 3000);
  };
  
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Message to Customer</DialogTitle>
          <DialogDescription>
            Send an email or SMS notification to {booking.customerName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {booking.customerName.split(' ').map((name: string) => name[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{booking.customerName}</h3>
              <div className="text-sm text-gray-500">
                Booking ID: {booking.id} | {booking.service}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Message Template
            </label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Message Content
            </label>
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px] mt-1"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Will be sent to: {booking.customerEmail}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!messageContent.trim() || messageSent}
          >
            {messageSent ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Message Sent
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}