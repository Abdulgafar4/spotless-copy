// hooks/use-client-reviews.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Appointment } from "@/hooks/use-client-appointments";

export interface Review {
  id: string;
  appointment_id: string;
  staff_name: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  user_id: string;
  appointment?: Appointment;
}

interface UseClientReviewsReturn {
  reviews: Review[];
  reviewableAppointments: Appointment[];
  loading: boolean;
  error: Error | null;
  fetchReviews: () => Promise<void>;
  submitReview: (
    appointmentId: string, 
    staffName: string, 
    rating: number, 
    comment: string, 
    images?: string[]
  ) => Promise<boolean>;
}

export const useClientReviews = (): UseClientReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableAppointments, setReviewableAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch reviews from Supabase
  const fetchReviews = useCallback(async () => {
    if (!user) {
      setError(new Error("User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          appointment:appointment_id (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      setReviews(reviewsData || []);
      
      // Fetch completed appointments that can be reviewed
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          staff_assigned(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (appointmentsError) {
        throw appointmentsError;
      }
      
      // Filter out appointments that have already been reviewed
      const reviewedAppointmentIds = new Set(reviewsData?.map(r => r.appointment_id) || []);
      
      const reviewableAppointments = appointmentsData?.filter(
        appointment => !reviewedAppointmentIds.has(appointment.id)
      ) || [];
      
      setReviewableAppointments(reviewableAppointments);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch reviews"));
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Submit a review
  const submitReview = useCallback(async (
    appointmentId: string, 
    staffName: string, 
    rating: number, 
    comment: string, 
    images?: string[]
  ): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to submit a review");
      return false;
    }

    try {
      setLoading(true);
      
      // Verify the appointment belongs to the user
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .select("id, user_id, status")
        .eq("id", appointmentId)
        .single();
      
      if (appointmentError) {
        throw appointmentError;
      }
      
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      
      if (appointment.user_id !== user.id) {
        throw new Error("You don't have permission to review this appointment");
      }
      
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
            images,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast.success("Review submitted successfully");
      await fetchReviews();
      return true;
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchReviews]);

  // Initialize by fetching data on component mount
  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, fetchReviews]);

  return {
    reviews,
    reviewableAppointments,
    loading,
    error,
    fetchReviews,
    submitReview
  };
};