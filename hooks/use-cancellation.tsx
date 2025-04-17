import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface CancellationRequest {
  id: string;
  appointment_id: string;
  booking_id?: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  booking_date?: string;
  booking_time?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
  refund_amount?: number;
  total_amount?: number;
}

interface UseCancellationReturn {
  cancellationRequests: CancellationRequest[];
  loading: boolean;
  error: Error | null;
  fetchCancellationRequests: (filters?: CancellationFilters) => Promise<void>;
  approveCancellationRequest: (id: string, refundAmount?: number, notes?: string) => Promise<boolean>;
  rejectCancellationRequest: (id: string, notes?: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<boolean>;
}

interface CancellationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  date_from?: string;
  date_to?: string;
}

export const useAdminCancellation = (): UseCancellationReturn => {
  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const fetchCancellationRequests = useCallback(async (filters: CancellationFilters = {}) => {
    if (authLoading) return;
    
    if (!isAdmin) {
      setError(new Error("Unauthorized: Admin access required"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch cancellation requests
      let query = supabase
        .from('cancellation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: requestsData, error: requestsError } = await query;

      if (requestsError) {
        throw requestsError;
      }

      // If no cancellation requests, return empty array
      if (!requestsData || requestsData.length === 0) {
        setCancellationRequests([]);
        setLoading(false);
        return;
      }

      // Step 2: Get the unique booking IDs and user IDs from the requests
      const bookingIds = [...new Set(requestsData.map(req => req.appointment_id))].filter(Boolean);
      const userIds = [...new Set(requestsData.map(req => req.user_id))].filter(Boolean);

      // Step 3: Fetch bookings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('id', bookingIds);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        // Continue processing even with error - we'll use placeholder data
      }

      // Step 4: Fetch users/profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue processing even with error - we'll use placeholder data
      }

      // Create lookup maps for O(1) access
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

      // Step 5: Combine the data for frontend use
      const combinedData: CancellationRequest[] = requestsData.map(request => {
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
          booking_date: booking.date,
          booking_time: booking.time,
          reason: request.reason,
          status: request.status,
          created_at: request.created_at,
          updated_at: request.updated_at,
          admin_notes: request.admin_notes,
          refund_amount: request.refund_amount,
          total_amount: booking.total_amount
        };
      });

      setCancellationRequests(combinedData);
    } catch (err) {
      console.error("Error fetching cancellation requests:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      toast.error("Failed to load cancellation requests");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const approveCancellationRequest = useCallback(async (
    id: string, 
    refundAmount?: number, 
    notes?: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // Step 1: Get the cancellation request
      const { data: requestData, error: requestError } = await supabase
        .from('cancellation_requests')
        .select('appointment_id')
        .eq('id', id)
        .single();
        
      if (requestError) {
        throw requestError;
      }
      
      // Step 2: Update the booking status to cancelled
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestData.appointment_id);
        
      if (bookingError) {
        throw bookingError;
      }
      
      // Step 3: Update the cancellation request status
      const { data, error: updateError } = await supabase
        .from('cancellation_requests')
        .update({
          status: 'approved',
          admin_notes: notes,
          refund_amount: refundAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
        
      if (updateError) {
        throw updateError;
      }
      
      // Step 4: Update local state
      setCancellationRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { 
                ...request, 
                status: 'approved', 
                admin_notes: notes, 
                refund_amount: refundAmount,
                updated_at: new Date().toISOString() 
              }
            : request
        )
      );
      
      toast.success("Cancellation request approved successfully");
      return true;
    } catch (err) {
      console.error("Error approving cancellation request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to approve cancellation request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const rejectCancellationRequest = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // Update the cancellation request status to rejected
      const { data, error: updateError } = await supabase
        .from('cancellation_requests')
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
      setCancellationRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'rejected', admin_notes: notes, updated_at: new Date().toISOString() }
            : request
        )
      );
      
      toast.success("Cancellation request rejected");
      return true;
    } catch (err) {
      console.error("Error rejecting cancellation request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reject cancellation request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Admin access required");
      return false;
    }

    try {
      setLoading(true);
      
      // Update the booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success(`Booking status updated to ${status}`);
      return true;
    } catch (err) {
      console.error("Error updating booking status:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update booking status");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initialize by fetching all cancellation requests when component mounts
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchCancellationRequests();
    }
  }, [fetchCancellationRequests, isAdmin, authLoading]);

  return {
    cancellationRequests,
    loading: loading || authLoading,
    error,
    fetchCancellationRequests,
    approveCancellationRequest,
    rejectCancellationRequest,
    updateBookingStatus
  };
};