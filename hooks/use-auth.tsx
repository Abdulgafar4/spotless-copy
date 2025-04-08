"use client"
import { createContext, useContext, useLayoutEffect, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePathname, useRouter } from 'next/navigation';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);


  const logout = async () => {
    await supabase.auth.signOut();
  
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
  
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, supabase, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);