import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface UseAdminBranchesReturn {
  branches: Branch[];
  loading: boolean;
  error: Error | null;
  fetchBranches: () => Promise<void>;
  createBranch: (branchData: Partial<Branch>) => Promise<Branch>;
  updateBranch: (id: string, branchData: Partial<Branch>) => Promise<Branch>;
  deleteBranch: (id: string) => Promise<boolean>;
  getBranchById: (id: string) => Promise<Branch>;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing branches with admin authorization using Supabase
 */
export const useAdminBranches = (): UseAdminBranchesReturn => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin } = useAuth();

  // Fetch all branches
  const fetchBranches = useCallback(async () => {
    if (!isAdmin) {
      setError(new Error("Unauthorized: Admin access required"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("branches")
        .select("*")
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
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Create a new branch
  const createBranch = useCallback(
    async (branchData: Partial<Branch>): Promise<Branch> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("branches")
          .insert([{ ...branchData }])
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const newBranch = data[0] as Branch;
        setBranches((prevBranches) => [...prevBranches, newBranch]);
        return newBranch;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to create branch:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Update an existing branch
  const updateBranch = useCallback(
    async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
  
      try {
        setLoading(true);
  
        // Exclude id from branchData
        const { id: _ignoredId, ...safeBranchData } = branchData;
  
        const { data, error: supabaseError } = await supabase
          .from("branches")
          .update({ ...safeBranchData })
          .eq("id", id)
          .select();
  
        if (supabaseError) {
          throw supabaseError;
        }
  
        const updatedBranch = data[0] as Branch;
        setBranches((prevBranches) =>
          prevBranches.map((branch) =>
            branch.id === id ? updatedBranch : branch
          )
        );
        return updatedBranch;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update branch:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );
  

  // Delete a branch
  const deleteBranch = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { error: supabaseError } = await supabase
          .from("branches")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw supabaseError;
        }

        setBranches((prevBranches) =>
          prevBranches.filter((branch) => branch.id !== id)
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete branch:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Get a single branch by ID
  const getBranchById = useCallback(
    async (id: string): Promise<Branch> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("branches")
          .select("*")
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        return data as Branch;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get branch with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Initialize by fetching branches on first load
  useEffect(() => {
    if (isAdmin) {
      fetchBranches();
    }
  }, [fetchBranches, isAdmin]);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchById,
    isAuthorized: isAdmin,
  };
};
