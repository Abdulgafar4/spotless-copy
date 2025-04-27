// hooks/use-time-slots.ts

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";



interface UseTimeSlotsReturn {
  timeSlots: TimeSlot[];
  loading: boolean;
  error: Error | null;
  fetchTimeSlots: (date: string, branchId: string, serviceType: string) => Promise<void>;
}

export const useTimeSlots = (): UseTimeSlotsReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeSlots = useCallback(async (
    date: string, 
    branchId: string, 
    serviceType: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Call the SQL function to get available time slots
      const { data: slotsData, error: slotsError } = await supabase
        .rpc('get_available_time_slots', {
          p_date: date,
          p_branch_id: branchId
        });

      if (slotsError) throw slotsError;

      // Get service duration
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("duration")
        .eq("name", serviceType)
        .single();

      if (serviceError) throw serviceError;

      const serviceDuration = serviceData?.duration || 60;

      // Format the time slots and check if they can accommodate the service duration
      const formattedSlots = slotsData
        .filter((slot: any) => slot.is_available)
        .map((slot: any) => {
          // Check if there's enough time for the service
          const slotTime = new Date(`2000-01-01T${slot.slot_time}`);
          const endTime = new Date(slotTime.getTime() + serviceDuration * 60000);
          
          // For simplicity, we'll assume the slot is available if it's marked as available
          // You could add additional checks here
          return {
            startTime: slot.slot_time.slice(0, 5), // Format as HH:mm
            available: true
          };
        });
      
      setTimeSlots(formattedSlots);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch time slots"));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timeSlots,
    loading,
    error,
    fetchTimeSlots
  };
};