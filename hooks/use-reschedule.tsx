import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface RescheduleRequest {
  id: string;
  appointment_id: string;
  booking_id?: string;
  user_id: string;
  customer_name?: string;
  service_type?: string;
  original_date?: string;
  requested_date: string;
  requested_time: string;
  original_time?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
}

interface UseRescheduleReturn {
  rescheduleRequests: RescheduleRequest[];
  loading: boolean;
  error: Error | null;
  fetchRescheduleRequests: (filters?: RescheduleFilters) => Promise<void>;
  approveRescheduleRequest: (id: string, notes?: string) => Promise<boolean>;
  rejectRescheduleRequest: (id: string, notes?: string) => Promise<boolean>;
  updateBookingDate: (bookingId: string, newDate: string, newTime: string) => Promise<boolean>;
}

interface RescheduleFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  date_from?: string;
  date_to?: string;
}

export const useAdminReschedule = (): UseRescheduleReturn => {
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const fetchRescheduleRequests = useCallback(async (filters: RescheduleFilters = {}) => {
    if (authLoading) return;
    
    if (!isAdmin) {
      setError(new Error("Unauthorized: Admin access required"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Start building the query - only select from reschedule_requests
      let query = supabase
        .from('reschedule_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: requestsData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }
      
      if (!requestsData || requestsData.length === 0) {
        setRescheduleRequests([]);
        return;
      }

      // Extract unique IDs for secondary queries
      const bookingIds = requestsData.map(req => req.appointment_id).filter(Boolean);
      const userIds = requestsData.map(req => req.user_id).filter(Boolean);

      // Fetch related bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('id', bookingIds);
      
      if (bookingsError) {
        console.error("Error fetching related bookings:", bookingsError);
      }

      // Fetch related profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching related profiles:", profilesError);
      }

      // Create lookup maps for faster access
      const bookingsMap: Record<string, any> = {};
      if (bookingsData) {
        bookingsData.forEach(booking => {
          bookingsMap[booking.id] = booking;
        });
      }

      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      // Transform data to include customer name and service details
      const transformedData = requestsData.map(request => {
        const booking = bookingsMap[request.appointment_id] || {};
        const profile = profilesMap[request.user_id] || {};

        
        return {
          id: request.id,
          appointment_id: request.appointment_id,
          booking_id: booking.id,
          user_id: request.user_id,
          customer_name: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : "Unknown Customer",
          customer_email: profile.email,
          customer_phone: profile.phone,
          service_type: booking.service_type || "Unknown Service",
          original_date: booking.date,
          original_time: booking.time,
          requested_date: request.requested_date,
          requested_time: request.requested_time,
          reason: request.reason,
          status: request.status,
          created_at: request.created_at,
          updated_at: request.updated_at,
          admin_notes: request.admin_notes
        };
      });

      setRescheduleRequests(transformedData);
    } catch (err) {
      console.error("Error fetching reschedule requests:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const approveRescheduleRequest = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // First, get the reschedule request to access the booking info
      const { data: requestData, error: requestError } = await supabase
        .from('reschedule_requests')
        .select(`
          appointment_id,
          requested_date,
          requested_time
        `)
        .eq('id', id)
        .single();
        
      if (requestError) {
        throw requestError;
      }
      
      // Update the booking with the new date and time
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          date: requestData.requested_date,
          time: requestData.requested_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestData.appointment_id);
        
      if (bookingError) {
        throw bookingError;
      }
      
      // Update the reschedule request status
      const { data, error: updateError } = await supabase
        .from('reschedule_requests')
        .update({
          status: 'approved',
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setRescheduleRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'approved', admin_notes: notes, updated_at: new Date().toISOString() }
            : request
        )
      );
      
      toast.success("Reschedule request approved successfully");
      return true;
    } catch (err) {
      console.error("Error approving reschedule request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to approve reschedule request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const rejectRescheduleRequest = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // Update the reschedule request status
      const { data, error: updateError } = await supabase
        .from('reschedule_requests')
        .update({
          status: 'rejected',
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setRescheduleRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'rejected', admin_notes: notes, updated_at: new Date().toISOString() }
            : request
        )
      );
      
      toast.success("Reschedule request rejected");
      return true;
    } catch (err) {
      console.error("Error rejecting reschedule request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reject reschedule request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const updateBookingDate = useCallback(async (
    bookingId: string, 
    newDate: string, 
    newTime: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // Update the booking with the new date and time
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          date: newDate,
          time: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Booking date updated successfully");
      return true;
    } catch (err) {
      console.error("Error updating booking date:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update booking date");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initialize by fetching all reschedule requests when component mounts
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchRescheduleRequests();
    }
  }, [fetchRescheduleRequests, isAdmin, authLoading]);

  return {
    rescheduleRequests,
    loading: loading || authLoading,
    error,
    fetchRescheduleRequests,
    approveRescheduleRequest,
    rejectRescheduleRequest,
    updateBookingDate
  };
};