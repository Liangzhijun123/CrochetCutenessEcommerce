'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, supabaseDB } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Minimum time between auth requests (ms) to prevent rapid re-submissions
const AUTH_DEBOUNCE_MS = 5000;

// Legacy-compatible user shape consumed by header, cart, messaging, etc.
interface LegacyUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'creator' | 'admin' | 'seller';
  createdAt: string;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  coins: number;
  points: number;
  loginStreak: number;
  isActive: boolean;
  sellerProfile?: {
    approved: boolean;
    bio: string;
    storeName: string;
    onboardingCompleted?: boolean;
    credentialsGenerated?: boolean;
    sellerUsername?: string;
  };
  sellerApplication?: unknown;
  patternTestingApproved?: boolean;
  testerLevel?: number;
  testerXP?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'customer' | 'seller' | 'admin' | 'pending_seller';
  is_seller: boolean;
  seller_id?: string;
  seller_application_status?: 'none' | 'submitted' | 'approved' | 'rejected';
  seller_onboarding_completed?: boolean;
  seller_username?: string;
  seller_generated_password?: string;
  pattern_testing_approved?: boolean;
  tester_level?: number;
  tester_xp?: number;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    marketing: boolean;
  };
}

interface AuthContextType {
  // Legacy fields (header, auth-status, cart, messaging, etc.)
  user: LegacyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<LegacyUser>) => Promise<boolean>;
  refreshUser: (userId?: string) => Promise<boolean>;
  // Supabase-native fields (login/register pages)
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: 'customer' | 'seller') => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isPendingSeller: boolean;
  becomeSeller: (shopName: string, description: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Guards to prevent double auth requests (React Strict Mode, rapid clicks)
  const signUpInProgress = useRef(false);
  const signInInProgress = useRef(false);
  const lastSignUpTime = useRef(0);
  const lastSignInTime = useRef(0);

  // Wraps a promise with a hard timeout so Supabase auth calls never hang forever
  // (e.g. paused project, network black-hole on Vercel edge)
  function withTimeout<T>(promise: Promise<T>, ms = 15000, msg = 'Request timed out. Please try again.'): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
    ]);
  }

  // Checks that Supabase env vars are configured — throws immediately if not
  function assertSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || url.includes('placeholder') || !key || key === 'placeholder') {
      throw new Error('Authentication service is not configured. Please contact support.');
    }
  }

  // ─── 1. Get session on refresh  2. Listen for auth changes ───
  useEffect(() => {
    withTimeout(supabase.auth.getSession(), 10000)
      .then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setAccessToken(session.access_token);
          fetchUserProfile(session.user.id);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Timed out or network error — clear loading so the app doesn't freeze
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setAccessToken(session.access_token);
        await fetchUserProfile(session.user.id);
      } else {
        setSupabaseUser(null);
        setUserProfile(null);
        setAccessToken(null);
      }
      setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await supabaseDB.getUser(userId);
      if (profile) {
        setUserProfile(profile as UserProfile);
        return profile as UserProfile;
      }
      return null;
    } catch (error: any) {
      // PGRST116 = no rows found (profile not created yet) — not a real error
      const code = error?.code ?? error?.details?.code;
      const msg: string = error?.message ?? '';
      const isNotFound = code === 'PGRST116' || msg.includes('No rows') || msg.includes('JSON object requested');
      if (!isNotFound) {
        console.error('Error fetching user profile:', error);
      }
      return null;
    }
  };

  // ─── Map Supabase profile → legacy User shape ───
  // If the DB profile hasn't loaded yet, fall back to supabase auth metadata so the
  // header always shows logged-in state for an authenticated user.
  const user: LegacyUser | null = supabaseUser
    ? userProfile
      ? {
          id: userProfile.id,
          name: userProfile.full_name || '',
          email: userProfile.email || '',
          password: '',
          role: mapRole(userProfile.role),
          createdAt: new Date().toISOString(),
          loyaltyPoints: 0,
          loyaltyTier: 'bronze' as const,
          coins: 0,
          points: 0,
          loginStreak: 0,
          isActive: true,
          sellerProfile: userProfile.is_seller
            ? {
                approved: true,
                bio: '',
                storeName: userProfile.seller_id || '',
                onboardingCompleted: userProfile.seller_onboarding_completed || false,
                credentialsGenerated: !!userProfile.seller_generated_password,
                sellerUsername: userProfile.seller_username || '',
              }
            : undefined,
          patternTestingApproved: userProfile.pattern_testing_approved || false,
          testerLevel: userProfile.tester_level || 0,
          testerXP: userProfile.tester_xp || 0,
        }
      : {
          // Fallback: DB profile not yet available — use auth session metadata
          id: supabaseUser.id,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
          email: supabaseUser.email || '',
          password: '',
          role: 'user' as const,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          loyaltyPoints: 0,
          loyaltyTier: 'bronze' as const,
          coins: 0,
          points: 0,
          loginStreak: 0,
          isActive: true,
          patternTestingApproved: false,
          testerLevel: 0,
          testerXP: 0,
        }
    : null;

  const isAuthenticated = !!supabaseUser;
  const isAdmin = userProfile?.role === 'admin' || false;
  const isPendingSeller = userProfile?.role === 'pending_seller' || false;

  const refreshUserProfile = async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  };

  // ─── Supabase-native methods ───

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'seller' = 'customer') => {
    if (signUpInProgress.current) {
      console.warn('⚠️ signUp already in progress, ignoring duplicate call');
      return;
    }

    const now = Date.now();
    if (now - lastSignUpTime.current < AUTH_DEBOUNCE_MS) {
      throw new Error('Please wait a few seconds before trying again.');
    }

    signUpInProgress.current = true;
    lastSignUpTime.current = now;

    try {
      assertSupabaseConfigured();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('email rate limit exceeded') || msg.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please wait a few minutes before trying again.');
        }
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          throw new Error('This email is already registered. Please log in instead or use a different email.');
        }
        if (msg.includes('invalid') && msg.includes('email')) {
          throw new Error('Please enter a valid email address.');
        }
        if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('least'))) {
          throw new Error('Password is too weak. Please use at least 8 characters with a mix of letters and numbers.');
        }
        if (msg.includes('network') || msg.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw new Error(error.message || 'Signup failed. Please try again.');
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('This email is already registered but not confirmed. Please check your inbox for a confirmation email, or try logging in.');
      }

      if (data.user) {
        createProfileInBackground(data.user.id, email, fullName, role);
        setSupabaseUser(data.user);
      }
    } catch (err) {
      throw err;
    } finally {
      signUpInProgress.current = false;
    }
  };

  const createProfileInBackground = async (userId: string, email: string, fullName: string, role: 'customer' | 'seller' = 'customer') => {
    // If user chose 'seller', store as 'pending_seller' — they need admin approval
    const dbRole = role === 'seller' ? 'pending_seller' : role;

    try {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        await fetchUserProfile(userId);
        return;
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: userId, email, full_name: fullName, role: dbRole, avatar_url: '' }]);

      if (profileError) {
        console.error('Profile creation error:', profileError.code, profileError.message);
        return;
      }

      // Award signup XP bonus via API (server-side with service_role)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch('/api/xp/earn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ activity: 'signup_bonus' }),
          });
        }
      } catch (xpErr) {
        console.error('Signup XP bonus failed (non-blocking):', xpErr);
      }

      await fetchUserProfile(userId);
    } catch (err) {
      console.error('Background profile creation failed:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (signInInProgress.current) {
      console.warn('⚠️ signIn already in progress, ignoring duplicate call');
      return;
    }

    const now = Date.now();
    if (now - lastSignInTime.current < AUTH_DEBOUNCE_MS) {
      throw new Error('Please wait a few seconds before trying again.');
    }

    signInInProgress.current = true;
    lastSignInTime.current = now;

    try {
      assertSupabaseConfigured();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        setSupabaseUser(data.user);
        const profile = await fetchUserProfile(data.user.id);
        // If no profile row exists (e.g. signup completed but profile creation failed),
        // create one now so the user isn't stuck in a logged-in-but-no-profile loop
        if (!profile) {
          createProfileInBackground(
            data.user.id,
            data.user.email!,
            data.user.user_metadata?.full_name || ''
          );
        }
      }
    } catch (err) {
      throw err;
    } finally {
      signInInProgress.current = false;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSupabaseUser(null);
    setUserProfile(null);
    setAccessToken(null);
  };

  const becomeSeller = async (shopName: string, description: string) => {
    if (!supabaseUser) throw new Error('User not authenticated');

    try {
      const seller = await supabaseDB.createSeller(supabaseUser.id, shopName, description);
      await supabaseDB.updateUser(supabaseUser.id, {
        is_seller: true,
        seller_id: seller.id,
        role: 'seller',
      });
      await fetchUserProfile(supabaseUser.id);
    } catch (error) {
      console.error('Error becoming seller:', error);
      throw error;
    }
  };

  // ─── Legacy-compatible methods ───

  const logout = () => {
    signOut().catch((err) => console.error('Logout failed:', err));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signIn(email, password);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await signUp(email, password, name);
      return true;
    } catch {
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!supabaseUser) throw new Error('Not authenticated');
    const { error } = await supabase.from('users').update(updates).eq('id', supabaseUser.id);
    if (error) throw error;
    await fetchUserProfile(supabaseUser.id);
  };

  const updateUser = async (): Promise<boolean> => false;
  const refreshUser = async (userId?: string): Promise<boolean> => {
    try {
      const id = userId || supabaseUser?.id;
      if (id) {
        await fetchUserProfile(id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token: accessToken || supabaseUser?.id || null,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    signIn,
    signUp,
    signOut,
    userProfile,
    isAdmin,
    isPendingSeller,
    becomeSeller,
    refreshUserProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function mapRole(role: string): LegacyUser['role'] {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'seller':
      return 'seller';
    case 'pending_seller':
      return 'user'; // pending sellers have customer-level access
    case 'customer':
    default:
      return 'user';
  }
}
