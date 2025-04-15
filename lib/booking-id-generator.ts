// utils/booking-id-generator.ts

/**
 * Generates a unique booking ID in the format BOK-XXX
 * @param existingIds - Optional array of existing booking IDs to ensure uniqueness
 * @param prefix - Optional prefix for the booking ID (default: "BOK")
 * @param padLength - Optional padding length for the numeric part (default: 3)
 * @returns A unique booking ID string
 */
export const generateUniqueBookingId = async (
    existingIds?: string[],
    prefix: string = "BOK",
    padLength: number = 3
  ): Promise<string> => {
    // If no existing IDs are provided, fetch them from the database
    let bookingIds = existingIds;
    
    if (!bookingIds) {
      try {
        // Import supabase client inside the function to avoid circular dependencies
        const { supabase } = await import("@/lib/supabaseClient");
        
        // Fetch all existing booking IDs
        const { data, error } = await supabase
          .from("bookings")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(100); // Limit to recent bookings for performance
        
        if (error) {
          console.error("Error fetching booking IDs:", error);
          // Fallback to a timestamp-based ID if we can't fetch existing IDs
          return `${prefix}-${Date.now().toString().substring(7)}`;
        }
        
        bookingIds = data?.map(booking => booking.id) || [];
      } catch (err) {
        console.error("Error in generateUniqueBookingId:", err);
        // Fallback to a timestamp-based ID
        return `${prefix}-${Date.now().toString().substring(7)}`;
      }
    }
    
    // Find the highest numeric value in the existing IDs with the same prefix
    let highestNum = 0;
    
    bookingIds.forEach(id => {
      if (id.startsWith(`${prefix}-`)) {
        const numPart = id.substring(prefix.length + 1); // +1 for the hyphen
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });
    
    // Increment the highest number by 1
    const nextNum = highestNum + 1;
    
    // Pad the numeric part with leading zeros
    const paddedNum = nextNum.toString().padStart(padLength, '0');
    
    // Combine prefix and padded number
    return `${prefix}-${paddedNum}`;
  };
  
  /**
   * Synchronous version of generateUniqueBookingId that doesn't fetch from database
   * Useful when you already have the existing IDs or need a synchronous operation
   */
  export const generateBookingIdSync = (
    highestId: number = 0, 
    prefix: string = "BOK", 
    padLength: number = 3
  ): string => {
    const nextNum = highestId + 1;
    const paddedNum = nextNum.toString().padStart(padLength, '0');
    return `${prefix}-${paddedNum}`;
  };