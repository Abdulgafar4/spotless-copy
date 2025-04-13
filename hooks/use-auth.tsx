"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Helper function to check admin status
  const checkAdminStatus = async (currentUser: any) => {
    try {
      // Default to false if no user
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      
      // Check user metadata if it contains role information
      if (currentUser?.user_metadata?.user_role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  // Add auto-login check function
  const checkExistingSession = async () => {
    try {
      // Check if we have cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      
      if (!tokenCookie) {
        return false;
      }
      
      // We have a token, validate it with Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Invalid or expired token, clear cookies
        document.cookie = "auth-token=; path=/; max-age=0";
        document.cookie = "role=; path=/; max-age=0";
        return false;
      }
      
      // Valid session exists, set user data
      setUser(data.session.user);
      await checkAdminStatus(data.session.user);
      return true;
    } catch (error) {
      console.error("Error checking existing session:", error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First try to get session from Supabase
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user || null;
        
        if (currentUser) {
          // We have a session in Supabase
          setUser(currentUser);
          await checkAdminStatus(currentUser);
        } else {
          // No Supabase session, but check if we have cookies
          const autoLoginSuccess = await checkExistingSession();
          
          if (!autoLoginSuccess) {
            // No valid session found
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // If we get a session change, update cookies accordingly
        if (currentUser) {
          const role = currentUser?.user_metadata?.user_role || "client";
          // Session cookies (browser session only)
          document.cookie = `auth-token=${session?.access_token || ""}; path=/`;
          document.cookie = `role=${role}; path=/`;
        } else {
          // Clear cookies on signout
          document.cookie = "auth-token=; path=/; max-age=0";
          document.cookie = "role=; path=/; max-age=0";
        }
        
        await checkAdminStatus(currentUser);
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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
        const role = user?.user_metadata?.user_role || "client";
    
        // Set session cookies (no expiry = browser session only)
        document.cookie = `auth-token=${session.access_token}; path=/`;
        document.cookie = `role=${role}; path=/`;
    
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