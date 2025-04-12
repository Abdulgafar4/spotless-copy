import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: Error | null;
  fetchReviews: () => Promise<void>;
  createReview: (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => Promise<Review>;
  updateReview: (id: string, reviewData: Partial<Review>) => Promise<Review>;
  deleteReview: (id: string) => Promise<boolean>;
  isAuthorized: boolean;
  canCreate: boolean;
  canViewAll: boolean;
  canViewPersonal: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export const useReviews = (): UseReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { userId, isAdmin } = useAuth();

  // Role-based permissions
  const canViewAll = isAdmin;
  const canCreate = !!userId; // Any logged-in user can create reviews
  const canViewPersonal = !!userId; // Any logged-in user can view their own reviews
  const canUpdate = !!userId; // Users can update their own reviews, admins can update any
  const canDelete = !!userId; // Users can delete their own reviews, admins can delete any

  // Fetch reviews based on user role
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      // Non-admin users can only see their own reviews
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setReviews(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId]);

  // Create a new review
  const createReview = useCallback(
    async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> => {
      try {
        setLoading(true);
        
        if (!userId) {
          throw new Error("You must be logged in to create a review");
        }

        const { data, error: supabaseError } = await supabase
          .from('reviews')
          .insert([{
            ...reviewData,
            user_id: userId
          }])
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const newReview = data[0] as Review;
        setReviews(prev => [newReview, ...prev]);
        return newReview;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to create review:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Update a review
  const updateReview = useCallback(
    async (id: string, reviewData: Partial<Review>): Promise<Review> => {
      try {
        setLoading(true);
        
        if (!userId) {
          throw new Error("You must be logged in to update a review");
        }

        // For non-admins, verify they own the review before updating
        if (!isAdmin) {
          const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();
            
          if (fetchError) {
            throw fetchError;
          }
          
          if (existingReview.user_id !== userId) {
            throw new Error("You can only update your own reviews");
          }
        }
        
        const { data, error: supabaseError } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', id)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedReview = data[0] as Review;
        setReviews(prev => prev.map(r => r.id === id ? updatedReview : r));
        return updatedReview;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update review:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, userId]
  );

  // Delete a review
  const deleteReview = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        
        if (!userId) {
          throw new Error("You must be logged in to delete a review");
        }

        // For non-admins, verify they own the review before deleting
        if (!isAdmin) {
          const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();
            
          if (fetchError) {
            throw fetchError;
          }
          
          if (existingReview.user_id !== userId) {
            throw new Error("You can only delete your own reviews");
          }
        }
        
        const { error: supabaseError } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);

        if (supabaseError) {
          throw supabaseError;
        }

        setReviews(prev => prev.filter(r => r.id !== id));
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete review:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, userId]
  );

  // Initialize by fetching reviews on first load
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    isAuthorized: !!userId,
    canCreate,
    canViewAll,
    canViewPersonal,
    canUpdate,
    canDelete,
  };
};