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

  useEffect(() => {
    if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard');
    } else if (!user && (pathname === '/dashboard' || pathname === '/booking')) {
      router.push('/login');
    }
  }, [user, pathname, router]); 


  const logout = async () => {
    await supabase.auth.signOut();
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