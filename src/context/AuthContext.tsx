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
  isCustomPassword: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPass: string, currentPass?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_STORAGE_KEY = 'jales_kitchen_admin_session';
export const PASS_HASH_KEY = 'jales_kitchen_admin_hash';

// Default bootstrap credential per project requirements
export const BOOTSTRAP_EMAIL = 'admin@jaleskitchen.com';
export const BOOTSTRAP_PASS = 'Cocane@007';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomPassword, setIsCustomPassword] = useState<boolean>(() => {
    const current = safeStorage.getItem<string>(PASS_HASH_KEY, BOOTSTRAP_PASS);
    return current !== BOOTSTRAP_PASS;
  });

  useEffect(() => {
    // Check if session exists in storage
    const checkSession = async () => {
      try {
        // Attempt to sync latest admin password from remote site_settings if available
        if (isSupabaseConfigured() && supabase) {
          try {
            const { data: authSetting } = await supabase
              .from('site_settings')
              .select('value')
              .eq('key', 'admin_auth')
              .maybeSingle();

            if (authSetting?.value?.password) {
              safeStorage.setItem(PASS_HASH_KEY, authSetting.value.password);
              setIsCustomPassword(authSetting.value.password !== BOOTSTRAP_PASS);
            }
          } catch {
            // Non-blocking
          }

          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || BOOTSTRAP_EMAIL,
              name: 'Restaurant Admin',
              role: 'admin',
              mustChangePassword: false,
            });
            setIsLoading(false);
            return;
          }
        }

        const localSession = safeStorage.getItem<AdminUser | null>(AUTH_STORAGE_KEY, null);
        if (localSession) {
          setUser({ ...localSession, mustChangePassword: false });
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
            mustChangePassword: false,
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

    // 2. Fetch latest stored password (from remote site_settings if accessible, then local storage)
    let currentStoredPass = safeStorage.getItem<string>(PASS_HASH_KEY, BOOTSTRAP_PASS);
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authSetting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'admin_auth')
          .maybeSingle();

        if (authSetting?.value?.password) {
          currentStoredPass = authSetting.value.password;
          safeStorage.setItem(PASS_HASH_KEY, currentStoredPass);
          setIsCustomPassword(currentStoredPass !== BOOTSTRAP_PASS);
        }
      } catch {
        // Fallback to local storage value
      }
    }

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
        mustChangePassword: false, // NEVER force modal on login
      };

      setUser(adminUser);
      safeStorage.setItem(AUTH_STORAGE_KEY, adminUser);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid administrator credentials. Please check your email and password.',
    };
  };

  const changePassword = async (newPass: string, currentPass?: string): Promise<{ success: boolean; error?: string }> => {
    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const currentStoredPass = safeStorage.getItem<string>(PASS_HASH_KEY, BOOTSTRAP_PASS);

    // If current password provided, verify it
    if (currentPass && currentPass !== currentStoredPass) {
      return { success: false, error: 'The current password you entered is incorrect.' };
    }

    // 1. If Supabase has an active user session, update it safely without throwing
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const { error } = await supabase.auth.updateUser({ password: newPass });
          if (error) {
            console.warn('Supabase auth.updateUser note:', error.message);
          }
        }
      } catch (err: any) {
        console.warn('Supabase auth session sync bypassed:', err?.message || err);
      }

      // 2. Persist password in Supabase site_settings so all browsers/devices receive the new password
      try {
        await supabase.from('site_settings').upsert(
          {
            key: 'admin_auth',
            value: { password: newPass, updated_at: new Date().toISOString() },
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn('Failed to persist admin_auth to Supabase site_settings:', err);
      }
    }

    // 3. Always update local storage
    safeStorage.setItem(PASS_HASH_KEY, newPass);
    setIsCustomPassword(newPass !== BOOTSTRAP_PASS);

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
        isCustomPassword,
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
