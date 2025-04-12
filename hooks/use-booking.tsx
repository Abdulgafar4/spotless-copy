import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

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
  isAuthorized: boolean;
  canCreate: boolean;
  canViewAll: boolean;
  canViewPersonal: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export const useAdminBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin, user } = useAuth();

  // Role-based permissions
  const isClient = user?.user_metadata?.user_role == "client"
  const userId = user?.id
  const canViewAll = isAdmin;
  const canCreate = true; // All users can create bookings
  const canUpdate = isAdmin || isClient;
  const canDelete = isAdmin;

  // Fetch bookings based on user role
  const fetchBookings = useCallback(async () => {
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
      const profilesMap : any = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // Step 5: Transform bookings to the required format
      const formattedBookings = bookingsData.map(booking => {
        const profile = profilesMap[booking.user_id] || {};
        
        return {
          id: booking.id || "",
          customerName: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : "Unknown Customer",
          customerPhone: profile.phone || "",
          customerEmail: profile.email || "",
          service: booking.service_type || "",
          branch: booking.branch_id || "",
          date: booking.date || "",
          duration: booking.duration || "",
          status: booking.status || "pending",
          assignedStaff: booking.assigned_staff || [],
          amount: booking.total_amount || 0,
          address: booking.address 
            ? `${booking.address}, ${booking.city || ""} ${booking.postal_code || ""}` 
            : (profile.address 
                ? `${profile.address}, ${profile.city || ""} ${profile.postal_code || ""}` 
                : ""),
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
  }, [isAdmin, userId]);
  
  // Helper function to format booking data even if profiles aren't available
  const formatBookingsData = (bookingsData: any) => {
    return bookingsData.map((booking: any) => ({
      id: booking.id || "",
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
        ? `${booking.address}, ${booking.city || ""} ${booking.postal_code || ""}` 
        : "",
      modified: booking.updated_at || booking.created_at || ""
    }));
  };
  
  // Create a new booking
  const createBooking = useCallback(
    async (bookingData: Partial<Booking>): Promise<Booking> => {
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
    [isAdmin, isClient, userId]
  );

  // Update a booking
  const updateBooking = useCallback(
    async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
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
    [isAdmin, isClient, userId, canUpdate]
  );

  // Update booking status specifically
  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus): Promise<Booking> => {
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
    [isAdmin]
  );

  // Assign staff to a booking
  const assignStaffToBooking = useCallback(
    async (id: string, staffNames: string[]): Promise<Booking> => {
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
    [isAdmin]
  );

  // Delete a booking
  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
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
    [canDelete]
  );

  // Get a single booking by ID
  const getBookingById = useCallback(
    async (id: string): Promise<Booking> => {
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
    [isAdmin, isClient, userId]
  );

  // Initialize by fetching bookings on first load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    updateBookingStatus,
    assignStaffToBooking,
    isAuthorized: true, // All users are authorized to at least create bookings
    canCreate,
    canViewAll,
    canViewPersonal: true,
    canUpdate,
    canDelete,
  };
};