import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface UseSettingsReturn {
  userSettings: UserSettings | null;
  loading: boolean;
  error: Error | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<UserSettings>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

/**
 * Custom hook for managing user settings using Supabase Auth
 */
export const useSettings = (): UseSettingsReturn => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch user settings from Supabase Auth
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setError(new Error("Unauthorized: User not logged in"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user data from the auth system
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!userData.user) {
        throw new Error("User not found");
      }
      
      console.log(userData)
      // Create user settings from auth data
      const settings: UserSettings = {
        id: userData.user.id,
        email: userData.user.email || '',
        name: `${userData.user.user_metadata?.firstName + " " + userData.user.user_metadata?.lastName}` ||  '',
        role: userData.user.user_metadata?.user_role || 'client',
        lastLogin: userData.user.last_sign_in_at
      };
      
      setUserSettings(settings);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch user settings:", err);
      toast.error("Failed to load user settings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user settings in Supabase Auth
  const updateSettings = useCallback(
    async (settingsData: Partial<UserSettings>): Promise<UserSettings> => {
      if (!user) {
        throw new Error("Unauthorized: User not logged in");
      }

      try {
        setLoading(true);
        
        // Prepare user metadata
        const metadata: Record<string, any> = {};
        
        // Only update the fields that were provided
        if (settingsData.name) metadata.name = settingsData.name;
        if (settingsData.role) metadata.user_role = settingsData.role;
        
        // Update user metadata in auth
        const { data, error } = await supabase.auth.updateUser({ 
          data: metadata 
        });
        
        if (error) {
          throw error;
        }
        
        if (!data.user) {
          throw new Error("User update failed");
        }
        
        // Create updated settings object
        const updatedSettings: UserSettings = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
          role: data.user.user_metadata?.user_role || 'client',
          lastLogin: data.user.last_sign_in_at
        };
        
        setUserSettings(updatedSettings);
        toast.success("Settings updated successfully");
        
        return updatedSettings;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update user settings:", err);
        toast.error("Failed to update settings");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Update password
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      if (!user) {
        throw new Error("Unauthorized: User not logged in");
      }

      try {
        setLoading(true);
        
        // First verify the current password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email || '',
          password: currentPassword,
        });

        if (verifyError) {
          toast.error("Current password is incorrect");
          throw new Error("Current password is incorrect");
        }

        // Update the password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          toast.error(`Failed to update password: ${updateError.message}`);
          throw updateError;
        }

        toast.success("Password updated successfully");
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update password:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Initialize by fetching settings on first load
  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [fetchSettings, user]);

  return {
    userSettings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updatePassword,
  };
};