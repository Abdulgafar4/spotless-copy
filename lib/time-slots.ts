// utils/time-slots.ts

import { supabase } from "./supabaseClient";

  export interface BranchHours {
    openingTime: string;
    closingTime: string;
    lunchStart?: string;
    lunchEnd?: string;
  }
  
  export interface Booking {
    start_time: string;
    end_time: string;
  }
  
  export const generateTimeSlots = (
    date: string,
    branchHours: BranchHours,
    existingBookings: Booking[],
    slotDuration: number = 30, // minutes
    serviceDuration: number = 60 // minutes
  ): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Parse opening and closing times
    const [openHour, openMinute] = branchHours.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = branchHours.closingTime.split(':').map(Number);
    
    // Create date objects for the selected date
    const startDate = new Date(date);
    startDate.setHours(openHour, openMinute, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(closeHour, closeMinute, 0, 0);
    
    // Generate slots
    let currentSlot = new Date(startDate);
    
    while (currentSlot < endDate) {
      const slotTime = formatTime(currentSlot);
      const slotEndTime = new Date(currentSlot.getTime() + serviceDuration * 60000);
      
      // Check if slot is during lunch break
      const isDuringLunch = isTimeDuringLunch(
        slotTime,
        formatTime(slotEndTime),
        branchHours.lunchStart,
        branchHours.lunchEnd
      );
      
      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => 
        isTimeConflicting(slotTime, formatTime(slotEndTime), booking.start_time, booking.end_time)
      );
      
      // Check if the slot exceeds closing time
      const exceedsClosingTime = slotEndTime > endDate;
      
      // Only add slot if it's valid
      if (!isDuringLunch && !hasConflict && !exceedsClosingTime) {
        slots.push({
          startTime: slotTime,
          available: true,
          label: formatTimeLabel(slotTime)
        });
      }
      
      // Move to next slot
      currentSlot = new Date(currentSlot.getTime() + slotDuration * 60000);
    }
    
    return slots;
  };
  
  // Helper functions
  const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5); // Returns "HH:mm"
  };
  
  const formatTimeLabel = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };
  
  const isTimeDuringLunch = (
    startTime: string,
    endTime: string,
    lunchStart?: string,
    lunchEnd?: string
  ): boolean => {
    if (!lunchStart || !lunchEnd) return false;
    
    return isTimeConflicting(startTime, endTime, lunchStart, lunchEnd);
  };
  
  const isTimeConflicting = (
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    
    return s1 < e2 && e1 > s2;
  };
  
  const timeToMinutes = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  
  // Example usage:
  export const fetchAvailableTimeSlots = async (
    date: string,
    branchId: string,
    serviceType: string
  ) => {
    try {
      // Fetch branch hours
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("opening_time, closing_time, lunch_start, lunch_end")
        .eq("id", branchId)
        .single();
        
      if (branchError) throw branchError;
      
      // Fetch service duration
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("duration")
        .eq("name", serviceType)
        .single();
        
      if (serviceError) throw serviceError;
      
      // Fetch existing bookings for the date
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("date", date)
        .eq("branch_id", branchId);
        
      if (bookingsError) throw bookingsError;
      
      // Generate available time slots
      const slots = generateTimeSlots(
        date,
        {
          openingTime: branchData.opening_time,
          closingTime: branchData.closing_time,
          lunchStart: branchData.lunch_start,
          lunchEnd: branchData.lunch_end
        },
        bookingsData || [],
        30, // 30-minute intervals
        serviceData?.duration || 60
      );
      
      return slots;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  };