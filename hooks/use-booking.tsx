import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "./use-notifications";

interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: Error | null;
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<Booking>;
  updateBooking: (id: string, bookingData: Partial<Booking>) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<boolean>;
  getBookingById: (id: string) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Booking>;
  assignStaffToBooking: (id: string, staffIds: string[]) => Promise<Booking>;
  updateOverdueBookings: () => Promise<void>;
  updatePayment: (bookingId: string, paymentData: any) => Promise<Booking>; // Add this line

  isAuthorized: boolean;
  canCreate: boolean;
  canViewAll: boolean;
  canViewPersonal: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  cancelBookingWithRefund: (
    bookingId: string,
    reason: string,
    refundType?: 'full' | 'partial' | 'none',
    customRefundAmount?: number
  ) => Promise<boolean>;

}

export const useAdminBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { sendBookingCancellation, sendFinalConfirmation } = useNotifications();

  // Get auth context with loading state
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Role-based permissions - only set these when auth is not loading
  const isClient = !authLoading && user?.user_metadata?.user_role === "client";
  const userId = user?.id;
  const canViewAll = !authLoading && isAdmin === true;
  const canCreate = !authLoading; // All users can create bookings
  const canUpdate = !authLoading && (isAdmin === true || isClient === true);
  const canDelete = !authLoading && isAdmin === true;

  // Fetch bookings based on user role
  const fetchBookings = useCallback(async () => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    try {
      setLoading(true);
      // Step 1: Fetch bookings without trying to join
      let bookingsQuery = supabase.from("bookings").select("*");

      // Filter bookings based on user role
      if (!isAdmin && userId) {
        bookingsQuery = bookingsQuery.eq("user_id", userId);
      } else if (!isAdmin && !userId) {
        setError(new Error("User ID is required to fetch your bookings"));
        setLoading(false);
        return;
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery.order("date", { ascending: false });

      if (bookingsError) {
        throw bookingsError;
      }

      // If no bookings, set empty array and return
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Step 2: Get unique user IDs from bookings
      const userIds = [...new Set(bookingsData.map(booking => booking.user_id))];

      // Step 3: Fetch profiles for those user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Just return bookings without profiles if there's an error
        setBookings(formatBookingsData(bookingsData));
        return;
      }

      // Step 4: Create a map for quick profile lookups
      const profilesMap: any = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      // Step 5: Transform bookings to the required format
      const formattedBookings = bookingsData.map(booking => {
        const profile = profilesMap[booking?.user_id] || {};
        return {
          id: booking.id || "",
          refId: booking.reference_number,
          customerName: profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : booking.customer_name || "",
          customerPhone: profile.phone || booking.phone || "",
          customerEmail: profile.email || booking.customer_email || "",
          service: booking.service_type || "",
          branch: booking.branch_id || "",
          date: booking.date || "",
          duration: booking.duration || "",
          status: booking.status || "pending",
          assignedStaff: booking.assigned_staff || [],
          amount: booking.total_amount || 0,

          address: booking.address
            ? `${booking.address}${booking.city ? `, ${booking.city}` : ''}${booking.postal_code ? ` ${booking.postal_code}` : ''}`
            : "",

          // Ensure these fields are passed through
          price_breakdown: booking.price_breakdown,
          property_details: booking.property_details,
          images: booking.images,
          payment_status: booking.payment_status,
          payment_option: booking.payment_option,
          payment_amount: booking.payment_amount,
          notes: booking.notes,
          modified: booking.updated_at || booking.created_at || ""
        };
      });

      setBookings(formattedBookings);

    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId, authLoading]);

  const updateOverdueBookings = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAdmin) {
      return; // Only admins should run this function
    }

    try {
      // Get all pending bookings
      const { data: pendingBookings, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending");

      if (fetchError) {
        throw fetchError;
      }

      if (!pendingBookings || pendingBookings.length === 0) {
        return;
      }

      // Get current date and time
      const now = new Date();
      const overdueBookings = pendingBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        // If booking date has passed and status is still pending
        return bookingDate < now;
      });

      if (overdueBookings.length === 0) {
        return;
      }

      // Update all overdue bookings to 'due' status
      const updates = overdueBookings.map(booking =>
        supabase
          .from("bookings")
          .update({ status: "due" })
          .eq("id", booking.id)
      );

      await Promise.all(updates);

      // Refresh bookings to reflect the changes
      await fetchBookings();

    } catch (err) {
      console.error("Failed to update overdue bookings:", err);
    }
  }, [isAdmin, authLoading, fetchBookings]);


  // Helper function to format booking data even if profiles aren't available
  const formatBookingsData = (bookingsData: any) => {
    return bookingsData.map((booking: any) => ({
      id: booking.id || "",
      refId: booking.reference_number,
      customerName: "Unknown Customer",
      customerPhone: "",
      customerEmail: "",
      service: booking.service_type || "",
      branch: booking.branch_id || "",
      date: booking.date || "",
      duration: booking.duration || "",
      status: booking.status || "pending",
      assignedStaff: booking.assigned_staff || [],
      amount: booking.total_amount || 0,
      address: booking.address
        ? `${booking.address}${booking.city ? `, ${booking.city}` : ''}${booking.postal_code ? ` ${booking.postal_code}` : ''}`
        : "",

      // Ensure these fields are passed through
      price_breakdown: booking.price_breakdown,
      property_details: booking.property_details,
      images: booking.images,
      payment_status: booking.payment_status,
      payment_option: booking.payment_option,
      payment_amount: booking.payment_amount,
      notes: booking.notes,
      modified: booking.updated_at || booking.created_at || ""
    }));
  };

  // Create a new booking
  const createBooking = useCallback(
    async (bookingData: Partial<Booking>): Promise<Booking> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      try {
        setLoading(true);
        // Ensure client_id is set to current user if not admin
        const finalBookingData = {
          ...bookingData,
          // If not admin or the client_id wasn't provided, set it to the current user
          client_id: isAdmin && bookingData.id ? bookingData.id : userId,
        };

        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .insert([finalBookingData])
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const newBooking = data[0] as Booking;

        // Only update state if the user can see this booking
        if (isAdmin || (isClient && newBooking.id === userId)) {
          setBookings((prev) => [...prev, newBooking]);
        }

        return newBooking;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to create booking:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, isClient, userId, authLoading]
  );

  // Update a booking
  const updateBooking = useCallback(
    async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      if (!canUpdate) {
        throw new Error("Unauthorized: You don't have permission to update bookings");
      }

      try {
        setLoading(true);
        // For clients, verify they own the booking before updating
        if (isClient && !isAdmin) {
          const { data: existingBooking, error: fetchError } = await supabase
            .from("bookings")
            .select("client_id")
            .eq("id", id)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          if (existingBooking.client_id !== userId) {
            throw new Error("Unauthorized: You can only update your own bookings");
          }
        }

        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .update(bookingData)
          .eq("id", id)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedBooking = data[0] as Booking;

        setBookings((prev) =>
          prev.map((booking) => (booking.id === id ? updatedBooking : booking))
        );

        return updatedBooking;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update booking:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, isClient, userId, canUpdate, authLoading]
  );

  // Update booking status specifically
 const updateBookingStatus = useCallback(
  async (id: string, status: BookingStatus): Promise<Booking> => {
    if (authLoading) {
      throw new Error("Authentication is still loading");
    }
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select();
        
      if (supabaseError) {
        throw supabaseError;
      }
      
      const updatedBooking = data[0] as Booking;
      
      // Send emails with proper error handling
      try {
        if (status === 'confirmed') {
          console.log('Sending confirmation email...');
          await sendFinalConfirmation({
            booking_id: updatedBooking.refId || id,
            user_email: updatedBooking.customerEmail,
            booking_details: {
              customerName: updatedBooking.customerName,
              service: updatedBooking.service,
              date: updatedBooking.date,
              address: updatedBooking.address,
              amount: updatedBooking.amount,
              assignedStaff: updatedBooking.assignedStaff
            }
          });
          console.log('Confirmation email sent successfully');
        } else {
          console.log('Sending cancellation email...');
          await sendBookingCancellation({
            booking_id: updatedBooking.refId || id,
            user_email: updatedBooking.customerEmail,
            reason: updatedBooking.cancellationReason || "Booking cancelled by admin",
            booking_details: {
              customerName: updatedBooking.customerName,
              service: updatedBooking.service,
              date: updatedBooking.date,
              address: updatedBooking.address,
              amount: updatedBooking.amount
            },
            refund_amount: typeof updatedBooking.refund_amount === "number"
              ? updatedBooking.refund_amount
              : updatedBooking.refund_amount
              ? Number(updatedBooking.refund_amount)
              : 0
          });
          console.log('Cancellation email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw here - we still want to update the booking status
        // Just log the error and optionally show a warning to the user
      }
      
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? updatedBooking : booking))
      );
      
      return updatedBooking;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to update booking status:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  [isAdmin, authLoading]
);
  // Assign staff to a booking
  const assignStaffToBooking = useCallback(
    async (id: string, staffNames: string[]): Promise<Booking> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        // Update the booking with assigned staff names
        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .update({ assigned_staff: staffNames })
          .eq("id", id)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedBooking = data[0] as Booking;

        setBookings((prev) =>
          prev.map((booking) => (booking.id === id ? updatedBooking : booking))
        );

        return updatedBooking;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to assign staff to booking:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, authLoading]
  );

  // Delete a booking
  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      if (!canDelete) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { error: supabaseError } = await supabase
          .from("bookings")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw supabaseError;
        }

        setBookings((prev) => prev.filter((booking) => booking.id !== id));
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete booking:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canDelete, authLoading]
  );

  // Get a single booking by ID
  const getBookingById = useCallback(
    async (id: string): Promise<Booking> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Verify access permissions for non-admins
        if (!isAdmin && data.client_id !== userId) {
          throw new Error("Unauthorized: You don't have permission to view this booking");
        }

        return data as Booking;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get booking with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, isClient, userId, authLoading]
  );

  const cancelBookingWithRefund = useCallback(
    async (
      bookingId: string,
      reason: string,
      refundType: 'full' | 'partial' | 'none' = 'full',
      customRefundAmount?: number
    ): Promise<boolean> => {

      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Get current booking details
        const { data: currentBooking, error: fetchError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (fetchError || !currentBooking) {
          throw new Error("Booking not found");
        }

        // Calculate refund amount based on type
        let refundAmount = 0;

        if (refundType === 'full') {
          refundAmount = currentBooking.payment_amount || currentBooking.total_amount || 0;
        } else if (refundType === 'partial' && customRefundAmount) {
          refundAmount = customRefundAmount;
        }
        // refundType === 'none' results in refundAmount = 0

        console.log(`💰 Cancelling booking ${currentBooking.reference_number}:`, {
          refundType,
          refundAmount,
          reason
        });

        // Process refund through API
        const refundResponse = await fetch('/api/payments/process-refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: currentBooking.reference_number,
            reason: reason,
            refund_amount: refundAmount,
            admin_id: user?.id,
            refund_type: refundType
          })
        });

        if (!refundResponse.ok) {
          const errorData = await refundResponse.json();
          throw new Error(errorData.error || 'Refund processing failed');
        }

        const refundResult = await refundResponse.json();
        console.log('✅ Refund processed:', refundResult);

        // Send cancellation email to customer
        await sendBookingCancellation({
          booking_id: currentBooking.reference_number,
          user_email: currentBooking.customer_email,
          reason: reason,
          booking_details: {
            customerName: currentBooking.customer_name,
            service: currentBooking.service_type,
            date: currentBooking.date,
            address: currentBooking.address,
            amount: currentBooking.total_amount
          },
          refund_amount: refundAmount
        });

        // Refresh bookings list
        await fetchBookings();

        return true;

      } catch (error) {
        console.error("❌ Failed to cancel booking with refund:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user?.id, authLoading, sendBookingCancellation, fetchBookings]
  );

  const updatePayment = useCallback(
    async (bookingId: string, paymentData: any): Promise<Booking> => {
      if (authLoading) {
        throw new Error("Authentication is still loading");
      }

      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Update the booking with new payment information
        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .update({
            payment_amount: paymentData.payment_amount,
            payment_status: paymentData.payment_status,
            total_amount: paymentData.total_amount,
            payment_notes: paymentData.payment_note,
            updated_at: new Date().toISOString()
          })
          .eq("id", bookingId)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedBooking = data[0] as Booking;

        // Update local state
        setBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? updatedBooking : booking))
        );

        return updatedBooking;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update payment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, authLoading]
  );


  // Initialize by fetching bookings only after auth loading is complete
  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [fetchBookings, authLoading]);

  // Set loading state to match auth loading
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
    }
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      updateOverdueBookings();

      const interval = setInterval(() => {
        updateOverdueBookings();
      }, 86400000);

      return () => clearInterval(interval);
    }
  }, [authLoading, isAdmin, updateOverdueBookings]);

  return {
    bookings,
    loading: loading || authLoading, // Consider hook loading if auth is loading
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    updateBookingStatus,
    assignStaffToBooking,
    isAuthorized: !authLoading, // Only authorized when auth is loaded
    canCreate,
    canViewAll,
    canViewPersonal: !authLoading,
    canUpdate,
    canDelete,
    updateOverdueBookings,
    cancelBookingWithRefund,
    updatePayment,
  };
};

