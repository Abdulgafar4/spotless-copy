// hooks/use-confirmed-appointments.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";


export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  address: string;
  service_type: string;
  branch: string;
  notes?: string;
  user_id: string;
}

interface UseClientAppointmentsReturn {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  loading: boolean;
  error: Error | null;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  fetchAppointments: () => Promise<void>;
  requestCancellation: (appointmentId: string, reason: string) => Promise<boolean>;
  requestReschedule: (appointmentId: string, date: string, time: string, reason: string) => Promise<boolean>;
}

export const useClientAppointments = (): UseClientAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();

  // Filter appointments based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((appointment) => appointment.status === statusFilter)
      );
    }
  }, [statusFilter, appointments]);

  // Fetch confirmed appointments from bookings
  const fetchAppointments = useCallback(async () => {
    if (!user) {
      setError(new Error("User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .order("date", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform bookings to appointments format
      const transformedAppointments: Appointment[] = (data || []).map(booking => ({
        id: booking.id,
        refId: booking.reference_number,
        title: booking.service_type, // Using service_type as title
        date: booking.date,
        time: booking.time,
        status: booking.status,
        address: booking.address || "",
        service_type: booking.service_type,
        branch: booking.branch || "",
        notes: booking.notes,
        user_id: booking.user_id
      }));

      setAppointments(transformedAppointments);
    } catch (err) {
      console.error("Error fetching confirmed appointments:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch confirmed appointments"));
      toast.error("Failed to load confirmed appointments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize by fetching data on component mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  // Set up real-time subscription for booking status changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in the bookings table
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (insert, update, delete)
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}` // Only for this user's bookings
        },
        (payload) => {
          // If a booking is updated to "confirmed" status
          if (
            payload.eventType === 'UPDATE' && 
            payload.new && 
            payload.new.status === 'confirmed'
          ) {
            // Refresh the appointments list
            fetchAppointments();
          }
          
          // If a new confirmed booking is created
          if (
            payload.eventType === 'INSERT' && 
            payload.new && 
            payload.new.status === 'confirmed'
          ) {
            // Refresh the appointments list
            fetchAppointments();
          }
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, [user, fetchAppointments]);

  // Submit a cancellation request
  const requestCancellation = useCallback(async (appointmentId: string, reason: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to request a cancellation");
      return false;
    }

    try {
      setLoading(true);
      
      // Verify the appointment belongs to the user
      const { data: appointment, error: appointmentError } = await supabase
        .from("bookings")
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
        throw new Error("You don't have permission to cancel this appointment");
      }
      
      if (appointment.status === "cancelled") {
        throw new Error("This appointment is already cancelled");
      }
      
      // Create cancellation request
      const { data, error: insertError } = await supabase
        .from("cancellation_requests")
        .insert([
          {
            appointment_id: appointmentId,
            user_id: user.id,
            reason,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast.success("Cancellation request submitted successfully");
      await fetchAppointments();
      return true;
    } catch (err) {
      console.error("Error submitting cancellation request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit cancellation request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAppointments]);

  // Submit a reschedule request
  const requestReschedule = useCallback(async (
    appointmentId: string, 
    requestedDate: string, 
    requestedTime: string, 
    reason: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to request a reschedule");
      return false;
    }

    try {
      setLoading(true);
      
      // Verify the appointment belongs to the user
      const { data: appointment, error: appointmentError } = await supabase
        .from("bookings")
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
        throw new Error("You don't have permission to reschedule this appointment");
      }
      
      if (appointment.status === "cancelled") {
        throw new Error("Cannot reschedule a cancelled appointment");
      }
      
      // Create reschedule request
      const { data, error: insertError } = await supabase
        .from("reschedule_requests")
        .insert([
          {
            appointment_id: appointmentId,
            user_id: user.id,
            requested_date: requestedDate,
            requested_time: requestedTime,
            reason,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast.success("Reschedule request submitted successfully");
      await fetchAppointments();
      return true;
    } catch (err) {
      console.error("Error submitting reschedule request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit reschedule request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAppointments]);

  // Initialize by fetching data on component mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  return {
    appointments,
    filteredAppointments,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    fetchAppointments,
    requestCancellation,
    requestReschedule
  };
};