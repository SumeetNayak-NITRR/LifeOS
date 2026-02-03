"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout as authLogout, Session, saveSession } from '@/lib/auth';
import { initRealtimeSync } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial session check
    const currentSession = getSession();
    setSession(currentSession);
    
    if (currentSession) {
      initRealtimeSync();
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
      if (supabaseSession) {
        const newSession: Session = {
          userId: supabaseSession.user.id,
          email: supabaseSession.user.email || '',
          isGuest: false,
          expiresAt: (supabaseSession.expires_at || 0) * 1000,
        };
        saveSession(newSession);
        setSession(newSession);
        initRealtimeSync();
      } else {
        // Only clear if not guest
        const current = getSession();
        if (current && !current.isGuest) {
          setSession(null);
          localStorage.removeItem('lifeos_session');
        }
      }
      setIsLoading(false);
    });

    // If no Supabase session, we still might have a guest session
    if (!currentSession) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle redirection
  useEffect(() => {
    if (!isLoading && !session && pathname !== '/login') {
      router.push('/login');
    }
  }, [session, isLoading, pathname, router]);


  const logout = async () => {
    await authLogout();
    setSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!session && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
