import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { safeStorage } from '../utils/storage';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jales_kitchen_admin_session';
const PASS_HASH_KEY = 'jales_kitchen_admin_hash';

// Default bootstrap credential per project requirements
const BOOTSTRAP_EMAIL = 'admin@jaleskitchen.com';
const BOOTSTRAP_PASS = 'Cocane@007';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if session exists in storage
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || 'admin@jaleskitchen.com',
              name: 'Restaurant Admin',
              role: 'admin',
            });
            setIsLoading(false);
            return;
          }
        }

        const localSession = safeStorage.getItem<AdminUser | null>(AUTH_STORAGE_KEY, null);
        if (localSession) {
          setUser(localSession);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // 1. If Supabase configured, attempt Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (!error && data.user) {
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || 'Restaurant Admin',
            role: 'admin',
          };
          setUser(adminUser);
          safeStorage.setItem(AUTH_STORAGE_KEY, adminUser);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth attempt error:', err);
      }
    }

    // 2. Check local bootstrap credentials
    const currentStoredPass = safeStorage.getItem<string>(PASS_HASH_KEY, BOOTSTRAP_PASS);
    const isDefaultPass = currentStoredPass === BOOTSTRAP_PASS;

    if (
      (email.trim().toLowerCase() === BOOTSTRAP_EMAIL.toLowerCase() ||
        email.trim().toLowerCase() === 'admin' ||
        email.trim().toLowerCase() === 'dojale007@gmail.com') &&
      pass === currentStoredPass
    ) {
      const adminUser: AdminUser = {
        id: 'admin-local-1',
        email: email.includes('@') ? email : BOOTSTRAP_EMAIL,
        name: 'Restaurant Admin',
        role: 'admin',
        mustChangePassword: isDefaultPass,
      };

      setUser(adminUser);
      safeStorage.setItem(AUTH_STORAGE_KEY, adminUser);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Please verify your email and password.',
    };
  };

  const changePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (newPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    safeStorage.setItem(PASS_HASH_KEY, newPass);
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      safeStorage.setItem(AUTH_STORAGE_KEY, updatedUser);
    }

    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    safeStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
