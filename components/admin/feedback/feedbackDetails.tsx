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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  Send, 
  User, 
  Mail, 
  Calendar, 
  Clock,
  MessageCircle,
  Flag,
  Eye,
  Image as ImageIcon
} from "lucide-react"
import { useReviews } from "@/hooks/use-reviews"

interface FeedbackDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  feedback: any
}

export function FeedbackDetailsDialog({
  isOpen,
  setIsOpen,
  feedback
}: FeedbackDetailsDialogProps) {
  const [responseText, setResponseText] = useState("")
  const { updateReview } = useReviews();

  if (!feedback) return null

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customer Feedback Details</span>
            <Badge className={`${
              feedback.status === "published" ? "bg-green-100 text-green-800" : 
              feedback.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
              "bg-red-100 text-red-800"
            }`}>
              {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          <div className="col-span-2">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {feedback.user_name.split(' ').map((name: string) => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{feedback.user_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(feedback.rating)}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(feedback.created_at), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(feedback.created_at), "h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Feedback:</h4>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{feedback.comment}</p>
                </div>
              </div>

              {feedback.response && (
                <div>
                  <h4 className="font-medium mb-2">Our Response:</h4>
                  <div className="p-4 bg-green-50 rounded-md">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>ST</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Spotless Transitions</div>
                        <p className="text-gray-700 mt-2">{feedback.response}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          
          <div>
            <div className="border rounded-md p-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="space-y-2">
                  {feedback.booking_id && (
                    <div className="flex items-center text-sm">
                      <MessageCircle className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        <span className="font-medium">Booking ID:</span> #{feedback.booking_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Customer Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{feedback.user_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${feedback.user_email}`} className="text-blue-600 hover:underline">
                      {feedback.user_email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}