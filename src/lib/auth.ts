"use client";

import { supabase } from "./supabase";

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  isGuest: boolean;
  expiresAt: number;
}

const AUTH_KEYS = {
  session: 'lifeos_session',
} as const;

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  // First check for guest session in localStorage
  try {
    const stored = localStorage.getItem(AUTH_KEYS.session);
    if (stored) {
      const session: Session = JSON.parse(stored);
      if (session.isGuest) {
        if (session.expiresAt < Date.now()) {
          localStorage.removeItem(AUTH_KEYS.session);
          return null;
        }
        return session;
      }
    }
  } catch {
    // Ignore error and continue to check Supabase
  }

  // Supabase session management is handled by the client
  // But for synchronous checks, we can try to get it from the client's internal storage or state
  // However, it's better to let AuthProvider handle the reactive state.
  // For this helper, we'll return what's in localStorage if it's a real user session we saved
  try {
    const stored = localStorage.getItem(AUTH_KEYS.session);
    if (stored) {
      const session: Session = JSON.parse(stored);
      if (!session.isGuest) {
        if (session.expiresAt < Date.now()) {
          localStorage.removeItem(AUTH_KEYS.session);
          return null;
        }
        return session;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEYS.session, JSON.stringify(session));
}

export async function signup(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Signup failed.' };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email || email,
    createdAt: data.user.created_at,
  };

  const session: Session = {
    userId: user.id,
    email: user.email,
    isGuest: false,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  saveSession(session);

  return { success: true, user };
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Login failed.' };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email || email,
    createdAt: data.user.created_at,
  };

  const session: Session = {
    userId: user.id,
    email: user.email,
    isGuest: false,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  saveSession(session);

  return { success: true, user };
}

export function loginAsGuest(): Session {
  const guestId = 'guest_' + Date.now().toString(36);
  const session: Session = {
    userId: guestId,
    email: 'guest',
    isGuest: true,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  saveSession(session);
  return session;
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const session = getSession();
  if (session?.isGuest) {
    clearGuestData(session.userId);
  } else {
    await supabase.auth.signOut();
  }
  
  localStorage.removeItem(AUTH_KEYS.session);
}

function clearGuestData(guestId: string): void {
  const prefix = `lifeos_${guestId}_`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function getUserStoragePrefix(): string {
  const session = getSession();
  if (!session) return 'lifeos_anon_';
  return `lifeos_${session.userId}_`;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
