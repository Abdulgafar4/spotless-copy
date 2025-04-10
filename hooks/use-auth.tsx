"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      // Check if user is admin based on user metadata
      if (currentUser) {
        checkAdminStatus(currentUser);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        // Check if user is admin when auth state changes
        if (currentUser) {
          checkAdminStatus(currentUser);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Helper function to check admin status
  const checkAdminStatus = async (user: any) => {
    try {
      // Option 1: Check user metadata if it contains role information
      if (user?.user_metadata?.user_role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    
      if (error) {
        toast.error(`Login error: ${error.message}`);
        return false;
      }
    
      const session = authData.session;
      const user = authData.user;
    
      if (session && user) {
        const role = user?.user_metadata.user_role || "client";
    
        // Set cookies
        document.cookie = `auth-token=${session.access_token}; path=/; max-age=86400`;
        document.cookie = `role=${role}; path=/; max-age=86400`;
    
        // Redirect based on role
        if (role === "admin") {
          toast.success("Welcome, Admin!");
          router.push("/admin");
        } else {
          toast.success("Login successful!");
          router.push("/dashboard");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();

      document.cookie = "auth-token=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";

      setUser(null);
      setIsAdmin(false);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(`Password reset error: ${error.message}`);
        return false;
      }

      toast.success("Password reset email sent! Please check your inbox.");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(`Password update error: ${error.message}`);
        return false;
      }

      toast.success("Password updated successfully!");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred while resetting your password.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAdmin, 
        loading, 
        login, 
        logout, 
        forgotPassword, 
        resetPassword, 
        supabase 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);