"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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

  const logout = async () => {
    await supabase.auth.signOut();

    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    setUser(null);
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, supabase, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
