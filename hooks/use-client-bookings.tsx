// hooks/use-client-bookings.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
  address?: string;
  total_amount?: number;
  payment_status?: string;
  staff_assigned?: string[];
  notes?: string;
  user_id: string;
  reference_number: string;
  images?: string[];
  property_details?: any;
  payment_option?: string;
  payment_amount?: number;
}

interface BookingFilters {
  status?: string;
  dateRange?: string;
  searchTerm?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

interface UseClientBookingsReturn {
  bookings: Booking[];
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  loading: boolean;
  error: Error | null;
  filters: BookingFilters;
  pagination: Pagination;
  setStatusFilter: (status: string) => void;
  setDateFilter: (dateRange: string) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchBookings: () => Promise<void>;
  getBookingById: (id: string) => Promise<Booking | null>;
  rebookService: (serviceType: string, branchId: string) => Promise<string | null>;
}

export const useClientBookings = (
  initialItemsPerPage: number = 5
): UseClientBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [paginatedBookings, setPaginatedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(initialItemsPerPage);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage,
    startIndex: 0,
    endIndex: itemsPerPage - 1
  });
  
  const { user } = useAuth();

  // Apply filters and update pagination
  useEffect(() => {
    if (bookings.length === 0) {
      setFilteredBookings([]);
      setPaginatedBookings([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        itemsPerPage,
        startIndex: 0,
        endIndex: 0
      });
      return;
    }
    
    // Apply filters
    let filtered = [...bookings];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status.toLowerCase() === statusFilter
      );
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        if (dateFilter === "today") {
          return bookingDate.getTime() === today.getTime();
        } else if (dateFilter === "tomorrow") {
          return bookingDate.getTime() === tomorrow.getTime();
        } else if (dateFilter === "this-week") {
          return bookingDate >= today && bookingDate < nextWeek;
        }
        return true;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(term) ||
          booking.service_type.toLowerCase().includes(term) ||
          (booking.branch && booking.branch.toLowerCase().includes(term))
      );
    }
    
    // Update filtered bookings
    setFilteredBookings(filtered);
    
    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, filtered.length - 1);
    
    // Update pagination state
    setPagination({
      currentPage: validCurrentPage,
      totalPages,
      itemsPerPage,
      startIndex,
      endIndex: Math.max(endIndex, 0)
    });
    
    // Apply pagination
    setPaginatedBookings(filtered.slice(startIndex, startIndex + itemsPerPage));
    
  }, [bookings, statusFilter, dateFilter, searchTerm, currentPage, itemsPerPage]);

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
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
        .order("date", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch bookings"));
      toast.error("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get a booking by ID
  const getBookingById = useCallback(async (id: string): Promise<Booking | null> => {
    if (!user) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data as Booking;
    } catch (err) {
      console.error(`Error fetching booking ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new booking based on a previous service (rebook)
  const rebookService = useCallback(async (
    serviceType: string, 
    branchId: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to book a service");
      return null;
    }

    try {
      setLoading(true);
      
      // Create a new booking draft
      const { data, error: insertError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            service_type: serviceType,
            branch_id: branchId,
            status: "draft",
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to create booking");
      }

      toast.success("Booking initiated, please complete your details");
      return data[0].id;
    } catch (err) {
      console.error("Error initiating rebooking:", err);
      toast.error("Failed to initiate booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize by fetching data on component mount
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  return {
    bookings,
    filteredBookings,
    paginatedBookings,
    loading,
    error,
    filters: {
      status: statusFilter,
      dateRange: dateFilter,
      searchTerm
    },
    pagination,
    setStatusFilter,
    setDateFilter,
    setSearchTerm,
    setCurrentPage,
    fetchBookings,
    getBookingById,
    rebookService
  };
};