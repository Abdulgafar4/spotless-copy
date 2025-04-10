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
import { CheckCircle, Mail, Send, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface MessageEmployeeDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  employee: any
  onSendMessage: (message: string) => void
}

// Template options
const messageTemplates = [
  { value: "schedule", label: "Schedule Update" },
  { value: "assignment", label: "New Assignment" },
  { value: "meeting", label: "Team Meeting" },
  { value: "feedback", label: "Performance Feedback" },
  { value: "alert", label: "Important Alert" },
  { value: "custom", label: "Custom Message" },
];

// Template content
const templateContent = {
  schedule: `Hi {{firstName}},

This is to inform you about a change in your work schedule. Please review the updated schedule in your employee portal.

If you have any questions or concerns about these changes, please let me know.

Best regards,
Management Team`,

  assignment: `Hi {{firstName}},

You have been assigned to a new job:

Service: [Service Type]
Date: [Date]
Time: [Time]
Location: [Address]

Please confirm that you are available for this assignment.

Best regards,
Management Team`,

  meeting: `Hi {{firstName}},

This is a reminder about our upcoming team meeting:

Date: [Date]
Time: [Time]
Location: [Meeting Location/Link]

Please make sure to attend. We will be discussing important updates and upcoming changes.

Best regards,
Management Team`,

  feedback: `Hi {{firstName}},

I wanted to provide some feedback on your recent performance. You've been doing excellent work, particularly with [specific aspect].

Let's schedule some time to discuss your progress and any questions you might have.

Best regards,
Management Team`,

  alert: `IMPORTANT NOTICE

Hi {{firstName}},

This is an urgent message regarding [specific issue]. Please [required action] as soon as possible.

If you have any questions, contact the office immediately.

Best regards,
Management Team`,

  custom: ""
};

export function MessageEmployeeDialog({
  isOpen,
  setIsOpen,
  employee,
  onSendMessage
}: MessageEmployeeDialogProps) {
  const [messageContent, setMessageContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("custom")
  const [messageSent, setMessageSent] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [sendSMS, setSendSMS] = useState(false)
  
  // Handle template selection
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    
    let content = templateContent[template as keyof typeof templateContent] || "";
    
    // Replace placeholders with actual data if employee exists
    if (employee) {
      content = content.replace(/{{firstName}}/g, employee.firstName);
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
  
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Message to Employee</DialogTitle>
          <DialogDescription>
            Send a notification to {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
              <div className="text-sm text-gray-500">
                {employee.role} | {employee.branch}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="email-toggle" 
                checked={sendEmail} 
                onCheckedChange={setSendEmail} 
              />
              <Label htmlFor="email-toggle" className="text-sm">
                <Mail className="h-4 w-4 inline-block mr-1" />
                Send email
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="sms-toggle" 
                checked={sendSMS} 
                onCheckedChange={setSendSMS}
              />
              <Label htmlFor="sms-toggle" className="text-sm">
                <MessageSquare className="h-4 w-4 inline-block mr-1" />
                Send SMS
              </Label>
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
                Will be sent to: {employee.email}
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
            disabled={!messageContent.trim() || messageSent || (!sendEmail && !sendSMS)}
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