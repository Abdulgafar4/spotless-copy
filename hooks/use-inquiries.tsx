import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  assignedTo: string | null;
  responses: InquiryResponse[];
}

interface InquiryResponse {
  id: string;
  inquiry_id: string;
  staff: string | null;
  message: string;
  date: string;
}

interface InquiryFilters {
  status?: string;
  assignedTo?: string;
  dateRange?: { start: string; end: string };
}

interface UseAdminInquiriesReturn {
  inquiries: Inquiry[];
  loading: boolean;
  error: Error | null;
  fetchInquiries: (filters?: InquiryFilters) => Promise<void>;
  updateInquiry: (id: string, inquiryData: Partial<Inquiry>) => Promise<Inquiry>;
  addResponse: (inquiryId: string, response: string, staffName: string) => Promise<InquiryResponse>;
  getInquiryById: (id: string) => Promise<Inquiry>;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing customer inquiries with admin authorization using Supabase
 */
export const useAdminInquiries = (): UseAdminInquiriesReturn => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  // Fetch all inquiries with optional filters
  const fetchInquiries = useCallback(
    async (filters: InquiryFilters = {}) => {
      if (!isAdmin) {
        setError(new Error("Unauthorized: Admin access required"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Start building the query
        let query = supabase
          .from("contact_messages")
          .select(`
            *,
            responses:inquiry_responses(*)
          `)
          .order("created_at", { ascending: false });

        // Apply filters
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        
        if (filters.assignedTo) {
          if (filters.assignedTo === "unassigned") {
            query = query.is("assigned_to", null);
          } else {
            query = query.eq("assigned_to", filters.assignedTo);
          }
        }
        
        if (filters.dateRange) {
          query = query
            .gte("created_at", filters.dateRange.start)
            .lte("created_at", filters.dateRange.end);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the data to match our Inquiry interface
        const transformedData = data?.map(item => ({
          id: item.id,
          full_name: item.full_name,
          email: item.email,
          phone: item.phone || '',
          subject: item.subject,
          message: item.message,
          date: item.created_at,
          status: item.status || 'new',
          assignedTo: item.assigned_to,
          responses: item.responses || []
        })) || [];

        setInquiries(transformedData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to fetch inquiries:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Update an existing inquiry
  const updateInquiry = useCallback(
    async (id: string, inquiryData: Partial<Inquiry>): Promise<Inquiry> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Transform the data to match database schema
        const dbData = {
          ...(inquiryData.status && { status: inquiryData.status }),
          ...(inquiryData.assignedTo !== undefined && { assigned_to: inquiryData.assignedTo }),
          updated_at: new Date()
        };

        // Update inquiry record
        const { data, error: supabaseError } = await supabase
          .from("contact_messages")
          .update(dbData)
          .eq("id", id)
          .select(`
            *,
            responses:inquiry_responses(*)
          `);

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the response to match our Inquiry interface
        const transformedData = {
          id: data[0].id,
          full_name: data[0].full_name,
          email: data[0].email,
          phone: data[0].phone || '',
          subject: data[0].subject,
          message: data[0].message,
          date: data[0].created_at,
          status: data[0].status || 'new',
          assignedTo: data[0].assigned_to,
          responses: data[0].responses || []
        };

        // Update local state
        setInquiries(prevInquiries =>
          prevInquiries.map(inquiry =>
            inquiry.id === id ? transformedData : inquiry
          )
        );

        return transformedData;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update inquiry:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Add a response to an inquiry
  const addResponse = useCallback(
    async (inquiryId: string, message: string, staffName: string): Promise<InquiryResponse> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Create response record
        const responseData = {
          inquiry_id: inquiryId,
          staff: staffName,
          message,
          created_at: new Date()
        };

        const { data, error: responseError } = await supabase
          .from("inquiry_responses")
          .insert(responseData)
          .select();

        if (responseError) {
          throw responseError;
        }

        // Update inquiry status to in-progress if it's new
        const { data: inquiryData, error: inquiryError } = await supabase
          .from("contact_messages")
          .select("status")
          .eq("id", inquiryId)
          .single();

        if (!inquiryError && inquiryData.status === "new") {
          await supabase
            .from("contact_messages")
            .update({ status: "in-progress", updated_at: new Date() })
            .eq("id", inquiryId);
        }

        // Transform the response to match our InquiryResponse interface
        const transformedResponse = {
          id: data[0].id,
          inquiry_id: data[0].inquiry_id,
          staff: data[0].staff,
          message: data[0].message,
          date: data[0].created_at
        };

        // Update local state
        setInquiries(prevInquiries =>
          prevInquiries.map(inquiry => {
            if (inquiry.id === inquiryId) {
              return {
                ...inquiry,
                responses: [...inquiry.responses, transformedResponse],
                status: inquiry.status === "new" ? "in-progress" : inquiry.status
              };
            }
            return inquiry;
          })
        );

        return transformedResponse;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to add response:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Get a single inquiry by ID
  const getInquiryById = useCallback(
    async (id: string): Promise<Inquiry> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("contact_messages")
          .select(`
            *,
            responses:inquiry_responses(*)
          `)
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the data to match our Inquiry interface
        return {
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          subject: data.subject,
          message: data.message,
          date: data.created_at,
          status: data.status || 'new',
          assignedTo: data.assigned_to,
          responses: data.responses || []
        };
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get inquiry with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Initialize by fetching inquiries on first load
  useEffect(() => {
    if (isAdmin) {
      fetchInquiries();
    }
  }, [fetchInquiries, isAdmin]);

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    updateInquiry,
    addResponse,
    getInquiryById,
    isAuthorized: isAdmin,
  };
};