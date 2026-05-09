import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@core/lib/supabase';
import { analytics } from '@core/services/analyticsService';

const NOT_CONFIGURED_MSG =
  'Authentication is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file, then restart Metro with cache reset.';

const mapAuthError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (m.includes('user already registered') || m.includes('already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('too many requests') || m.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (m.includes('weak password')) {
    return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return msg;
};

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ initialized: true });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      set({
        session: data.session,
        user: data.session?.user ?? null,
      });
    } catch (e) {
      // ignore — surfaces as "not signed in"
    } finally {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        session: newSession,
        user: newSession?.user ?? null,
      });
    });
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: NOT_CONFIGURED_MSG };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error && data.user) {
      analytics.userSignedIn(data.user.id, data.user.email ?? email);
    }
    return { error: error ? mapAuthError(error.message) : null };
  },

  signUp: async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      return { error: NOT_CONFIGURED_MSG, needsEmailConfirmation: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) {
      return { error: mapAuthError(error.message), needsEmailConfirmation: false };
    }
    if (data.user) {
      analytics.userSignedUp(data.user.id, data.user.email ?? email, fullName.trim());
    }
    const needsEmailConfirmation = !!data.user && !data.session;
    return { error: null, needsEmailConfirmation };
  },

  signOut: async () => {
    analytics.userSignedOut();
    if (!isSupabaseConfigured()) {
      set({ session: null, user: null });
      return;
    }
    await supabase.auth.signOut();
  },
}));
