// hooks/use-client-appointments.tsx
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

  // Fetch appointments from Supabase
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
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch appointments"));
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user]);

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