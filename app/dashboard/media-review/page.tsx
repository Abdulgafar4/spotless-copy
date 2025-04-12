"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/dashboard/mediaReview/review-form";
import { ReviewHistory } from "@/components/dashboard/mediaReview/review-history";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { useClientReviews } from "@/hooks/use-client-review";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("write");
  const { 
    reviews, 
    reviewableAppointments, 
    loading, 
    submitReview 
  } = useClientReviews();

  // Add staff members to appointments for demo
  // In a real app, this would come from the database
  const appointmentsWithStaff = reviewableAppointments.map(appointment => ({
    ...appointment,
    staff_assigned: [
      "Sarah Johnson",
      "Michael Smith",
      "David Williams"
    ]
  }));

  // Handle review submission
  const handleReviewSubmit = async (
    appointmentId: string, 
    staffName: string, 
    rating: number, 
    comment: string, 
    images?: string[]
  ) => {
    const success = await submitReview(appointmentId, staffName, rating, comment, images);
    
    if (success) {
      // Switch to history tab to show the new review
      setActiveTab("history");
    }
    
    return success;
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">
          Share your feedback about our services and view your past reviews
        </p>
      </div>

      <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write a Review</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8">Loading appointments...</div>
          ) : appointmentsWithStaff.length > 0 ? (
            <ReviewForm 
              appointments={appointmentsWithStaff} 
              onSubmit={handleReviewSubmit}
            />
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Eligible Appointments</h3>
              <p className="text-gray-500 mt-2 mb-4">
                You don't have any completed appointments to review yet.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/dashboard/appointments"}
              >
                View All Appointments
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <ReviewHistory reviews={reviews} />
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Reviews</h3>
              <p className="text-gray-500 mt-2">
                You haven't submitted any reviews yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );}