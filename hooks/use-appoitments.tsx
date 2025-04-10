import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface UseAdminAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>;
  createAppointment: (
    appointmentData: Partial<Appointment>
  ) => Promise<Appointment>;
  updateAppointment: (
    id: string,
    appointmentData: Partial<Appointment>
  ) => Promise<Appointment>;
  deleteAppointment: (id: string) => Promise<boolean>;
  getAppointmentById: (id: string) => Promise<Appointment>;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing appointments with admin authorization using Supabase
 */
export const useAdminAppointments = (): UseAdminAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  // Fetch all appointments with optional filters
  const fetchAppointments = useCallback(
    async (filters: AppointmentFilters = {}) => {
      if (!isAdmin) {
        setError(new Error("Unauthorized: Admin access required"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Start building the query
        let query = supabase
          .from("appointments")
          .select(
            `
          *,
          customers:customer_id (*),
          employees:employee_id (*),
          branches:branch_id (*)
        `
          )
          .order("appointment_date", { ascending: false });

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle date range filters
            if (key === "date_from") {
              query = query.gte("appointment_date", value);
            } else if (key === "date_to") {
              query = query.lte("appointment_date", value);
            } else if (key === "status") {
              query = query.eq("status", value);
            } else if (key === "branch_id") {
              query = query.eq("branch_id", value);
            } else if (key === "employee_id") {
              query = query.eq("employee_id", value);
            }
          }
        });

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        setAppointments(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Create a new appointment
  const createAppointment = useCallback(
    async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("appointments")
          .insert([{ ...appointmentData, created_at: new Date() }])
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const newAppointment = data[0] as Appointment;
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          newAppointment,
        ]);
        return newAppointment;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to create appointment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Update an existing appointment
  const updateAppointment = useCallback(
    async (
      id: string,
      appointmentData: Partial<Appointment>
    ): Promise<Appointment> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("appointments")
          .update({ ...appointmentData, updated_at: new Date() })
          .eq("id", id)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedAppointment = data[0] as Appointment;
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === id ? updatedAppointment : appointment
          )
        );
        return updatedAppointment;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update appointment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Delete an appointment
  const deleteAppointment = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { error: supabaseError } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw supabaseError;
        }

        setAppointments((prevAppointments) =>
          prevAppointments.filter((appointment) => appointment.id !== id)
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete appointment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Get a single appointment by ID
  const getAppointmentById = useCallback(
    async (id: string): Promise<Appointment> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("appointments")
          .select(
            `
          *,
          customers:customer_id (*),
          employees:employee_id (*),
          branches:branch_id (*)
        `
          )
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        return data as Appointment;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get appointment with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Initialize by fetching appointments on first load
  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [fetchAppointments, isAdmin]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    isAuthorized: isAdmin,
  };
};
