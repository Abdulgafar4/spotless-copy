"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email?: string;
  is_active: boolean;
}

export interface BookingData {
  service: string;
  city: string;
  address: string;
  postalCode: string;
  branch: string;
  date: string | Date;
}

interface UseClientServicesReturn {
  services: Service[];
  branches: Branch[];
  loading: boolean;
  error: Error | null;
  fetchServices: () => Promise<void>;
  fetchBranches: () => Promise<void>;
  submitBooking: (bookingData: BookingData) => Promise<boolean>;
}

export const useClientServices = (): UseClientServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all active services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (supabaseError) {
        throw supabaseError;
      }

      setServices(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch services:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all active branches
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
      .from("branches")
      .select("*")
      .eq("status", "active")
      .order("name");

      if (supabaseError) {
        throw supabaseError;
      }

      setBranches(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch branches:", err);
      toast.error("Failed to load branch locations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit a booking
  const submitBooking = useCallback(async (bookingData: BookingData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get user from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        toast.error("You must be logged in to book a service");
        throw userError;
      }
      
      // Create booking in database
      const { data, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            service_type: bookingData.service,
            date: bookingData.date,
            user_id: userData.user?.id,
            address: bookingData.address,
            postal_code: bookingData.postalCode,
            city: bookingData.city,
            branch_id: bookingData.branch,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (bookingError) {
        throw bookingError;
      }
      
      toast.success("Booking submitted successfully!");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to submit booking:", err);
      toast.error("Failed to submit booking");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize by fetching data on component mount
  useEffect(() => {
    fetchServices();
    fetchBranches();
  }, [fetchServices, fetchBranches]);

  return {
    services,
    branches,
    loading,
    error,
    fetchServices,
    fetchBranches,
    submitBooking
  };
};