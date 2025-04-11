import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { deleteServiceImage } from "@/lib/uploadUtils";

interface UseAdminServicesReturn {
  services: Service[];
  loading: boolean;
  error: Error | null;
  fetchServices: () => Promise<void>;
  createService: (serviceData: Partial<Service>) => Promise<Service>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<boolean>;
  getServiceById: (id: string) => Promise<Service>;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing services with admin authorization using Supabase
 */
export const useAdminServices = (): UseAdminServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin } = useAuth();

  // Fetch all services
  const fetchServices = useCallback(async () => {
    if (!isAdmin) {
      setError(new Error("Unauthorized: Admin access required"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select("*")
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
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Create a new service
  const createService = useCallback(
    async (serviceData: Partial<Service>): Promise<Service> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("services")
          .insert([{ ...serviceData }])
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const newService = data[0] as Service;
        setServices((prevServices) => [...prevServices, newService]);
        return newService;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to create service:", err);
        
        // If there was an error and an image was uploaded, try to clean it up
        if (serviceData.imageUrl) {
          try {
            await deleteServiceImage(serviceData.imageUrl);
          } catch (cleanupError) {
            console.error("Failed to clean up image after service creation error:", cleanupError);
          }
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Update an existing service
  const updateService = useCallback(
    async (id: string, serviceData: Partial<Service>): Promise<Service> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
  
      try {
        setLoading(true);
        
        // Get the current service data to check if image needs to be deleted
        const { data: currentServiceData, error: fetchError } = await supabase
          .from("services")
          .select("imageUrl")
          .eq("id", id)
          .single();
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Check if we need to delete the old image
        if (currentServiceData.imageUrl && 
            serviceData.imageUrl && 
            currentServiceData.imageUrl !== serviceData.imageUrl) {
          try {
            await deleteServiceImage(currentServiceData.imageUrl);
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError);
            // Continue with update even if image deletion fails
          }
        }
  
        // Exclude id from serviceData
        const { id: _ignoredId, ...safeServiceData } = serviceData;
  
        const { data, error: supabaseError } = await supabase
          .from("services")
          .update({ ...safeServiceData })
          .eq("id", id)
          .select();
  
        if (supabaseError) {
          throw supabaseError;
        }
  
        const updatedService = data[0] as Service;
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === id ? updatedService : service
          )
        );
        return updatedService;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update service:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Delete a service
  const deleteService = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { error: supabaseError } = await supabase
          .from("services")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw supabaseError;
        }

        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== id)
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete service:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Get a single service by ID
  const getServiceById = useCallback(
    async (id: string): Promise<Service> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        return data as Service;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get service with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Initialize by fetching services on first load
  useEffect(() => {
    if (isAdmin) {
      fetchServices();
    }
  }, [fetchServices, isAdmin]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    getServiceById,
    isAuthorized: isAdmin,
  };
};