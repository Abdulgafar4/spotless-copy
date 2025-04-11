"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { ReviewForm } from "@/components/dashboard/mediaReview/review-form";
import { ReviewHistory } from "@/components/dashboard/mediaReview/review-history";
import { Loader2, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { staffMembers } from "@/constants/appointment-constants";
import { supabase } from "@/lib/supabaseClient";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
  staff_assigned?: string[];
}

interface Review {
  id: string;
  appointment_id: string;
  staff_name: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  appointment?: Appointment;
}

export default function MediaReview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCompletedAppointments(),
        fetchReviews()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      // Fetch completed appointments that haven't been reviewed yet
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Add mock staff for demo purposes
      const appointmentsWithStaff = data?.map(appointment => ({
        ...appointment,
        staff_assigned: [
          staffMembers[Math.floor(Math.random() * staffMembers.length)],
          staffMembers[Math.floor(Math.random() * staffMembers.length)]
        ].filter((staff, index, self) => self.indexOf(staff) === index) // Remove duplicates
      })) || [];

      setAppointments(appointmentsWithStaff);
    } catch (err) {
      console.error("Error fetching completed appointments:", err);
      toast.error("Failed to load completed appointments");
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          appointment:appointments(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      setReviews(reviewsData || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to load review history");
    }
  };

  const handleSubmitReview = async (
    appointmentId: string, 
    staffName: string, 
    rating: number, 
    comment: string, 
    images?: string[]
  ) => {
    try {
      setLoading(true);
      
      // Create review
      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([
          {
            appointment_id: appointmentId,
            user_id: user.id,
            staff_name: staffName,
            rating,
            comment,
            images
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast.success("Review submitted successfully");
      
      // Refresh data
      await fetchData();
      
      return true;
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Failed to submit review");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // For UI demonstration purposes
  const mockAppointments: Appointment[] = [
    {
      id: "APT12345",
      title: "Move-Out Cleaning",
      date: "2024-06-10",
      time: "10:30 AM",
      status: "completed",
      service_type: "Move-Out Cleaning",
      branch: "Toronto Downtown",
      staff_assigned: ["John Smith", "Maria Garcia"]
    },
    {
      id: "APT12346",
      title: "Carpet Cleaning",
      date: "2024-05-20",
      time: "2:00 PM",
      status: "completed",
      service_type: "Carpet Cleaning",
      branch: "North York",
      staff_assigned: ["Alex Johnson"]
    }
  ];

  const mockReviews: Review[] = [
    {
      id: "REV123",
      appointment_id: "APT12347",
      staff_name: "David Kim",
      rating: 5,
      comment: "David was extremely professional and thorough with the window cleaning. Would definitely recommend!",
      created_at: "2024-04-15T14:30:00Z",
      appointment: {
        id: "APT12347",
        title: "Window Cleaning",
        date: "2024-04-10",
        time: "1:00 PM",
        status: "completed",
        service_type: "Window Cleaning",
        branch: "Mississauga"
      }
    },
    {
      id: "REV124",
      appointment_id: "APT12348",
      staff_name: "Sarah Lee",
      rating: 4,
      comment: "Sarah did a great job with the deep cleaning. The bathroom looks brand new!",
      images: ["/assets/review1.jpg", "/assets/review2.jpg"],
      created_at: "2024-03-25T09:15:00Z",
      appointment: {
        id: "APT12348",
        title: "Deep Cleaning",
        date: "2024-03-20",
        time: "11:00 AM",
        status: "completed",
        service_type: "Deep Cleaning",
        branch: "Toronto Downtown"
      }
    }
  ];

  // If no data from DB, use mock data for display
  const displayAppointments = appointments.length > 0 ? appointments : mockAppointments;
  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  return (
    <DashboardLayout>
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write a Review</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Write a Review</CardTitle>
              <CardDescription>
                Share your experience and provide feedback about our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading appointments</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => fetchData()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : displayAppointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No completed appointments found</p>
                  <p className="text-sm mt-1">You don't have any completed appointments to review</p>
                </div>
              ) : (
                <ReviewForm 
                  appointments={displayAppointments} 
                  onSubmit={handleSubmitReview} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Review History</CardTitle>
              <CardDescription>
                View all your previous reviews and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading review history</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => fetchData()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : displayReviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No reviews found</p>
                  <p className="text-sm mt-1">You haven't submitted any reviews yet</p>
                </div>
              ) : (
                <ReviewHistory reviews={displayReviews} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}