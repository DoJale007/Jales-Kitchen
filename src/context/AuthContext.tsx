import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { safeStorage } from '../utils/storage';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword?: boolean;
}

export interface AdminTeamMember {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Store Manager' | 'Kitchen Admin' | 'Staff Admin' | string;
  password: string;
  createdAt: string;
  isPrimary?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCustomPassword: boolean;
  adminTeam: AdminTeamMember[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPass: string, currentPass?: string) => Promise<{ success: boolean; error?: string }>;
  addAdminAccount: (account: { name: string; email: string; role: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  removeAdminAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminTeamMemberPassword: (id: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_STORAGE_KEY = 'jales_kitchen_admin_session';
export const PASS_HASH_KEY = 'jales_kitchen_admin_hash';
export const ADMIN_TEAM_STORAGE_KEY = 'jales_kitchen_admin_team';

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

  const [adminTeam, setAdminTeam] = useState<AdminTeamMember[]>(() => {
    const saved = safeStorage.getItem<AdminTeamMember[]>(ADMIN_TEAM_STORAGE_KEY, []);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'primary-owner',
        email: 'admin@jaleskitchen.com',
        name: 'Primary Administrator',
        role: 'Super Admin',
        password: BOOTSTRAP_PASS,
        createdAt: '2026-01-01T00:00:00.000Z',
        isPrimary: true,
      },
    ];
  });

  useEffect(() => {
    // Check if session exists in storage & sync remote settings
    const checkSession = async () => {
      try {
        // Attempt to sync latest admin password and team from remote site_settings if available
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

          try {
            const { data: teamSetting } = await supabase
              .from('site_settings')
              .select('value')
              .eq('key', 'admin_team')
              .maybeSingle();

            if (Array.isArray(teamSetting?.value) && teamSetting.value.length > 0) {
              setAdminTeam(teamSetting.value);
              safeStorage.setItem(ADMIN_TEAM_STORAGE_KEY, teamSetting.value);
            }
          } catch {
            // Non-blocking
          }

          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || BOOTSTRAP_EMAIL,
              name: data.session.user.user_metadata?.full_name || 'Restaurant Admin',
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
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase configured, attempt Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || 'Restaurant Admin',
            role: 'Super Admin',
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

    // 2. Fetch latest stored password for primary admin
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

    // Check primary administrator credentials
    if (
      (cleanEmail === BOOTSTRAP_EMAIL.toLowerCase() ||
        cleanEmail === 'admin' ||
        cleanEmail === 'dojale007@gmail.com') &&
      pass === currentStoredPass
    ) {
      const adminUser: AdminUser = {
        id: 'primary-owner',
        email: cleanEmail.includes('@') ? cleanEmail : BOOTSTRAP_EMAIL,
        name: cleanEmail.includes('dojale') ? 'D. Jale (Owner)' : 'Primary Administrator',
        role: 'Super Admin',
        mustChangePassword: false,
      };

      setUser(adminUser);
      safeStorage.setItem(AUTH_STORAGE_KEY, adminUser);
      setIsLoading(false);
      return { success: true };
    }

    // 3. Check registered Admin Team Members
    const currentTeam = safeStorage.getItem<AdminTeamMember[]>(ADMIN_TEAM_STORAGE_KEY, adminTeam);
    const matchedMember = currentTeam.find(
      (m) => m.email.toLowerCase() === cleanEmail && m.password === pass
    );

    if (matchedMember) {
      const adminUser: AdminUser = {
        id: matchedMember.id,
        email: matchedMember.email,
        name: matchedMember.name,
        role: matchedMember.role || 'Store Manager',
        mustChangePassword: false,
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

    // Also update primary member password in adminTeam if present
    const updatedTeam = adminTeam.map((m) => {
      if (m.isPrimary || m.id === 'primary-owner') {
        return { ...m, password: newPass };
      }
      return m;
    });
    setAdminTeam(updatedTeam);
    safeStorage.setItem(ADMIN_TEAM_STORAGE_KEY, updatedTeam);

    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      safeStorage.setItem(AUTH_STORAGE_KEY, updatedUser);
    }

    return { success: true };
  };

  const addAdminAccount = async (account: {
    name: string;
    email: string;
    role: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = account.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!account.name.trim()) {
      return { success: false, error: 'Please enter the admin team member name.' };
    }
    if (!account.password || account.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check duplicate email
    const exists = adminTeam.some((m) => m.email.toLowerCase() === cleanEmail);
    if (
      exists ||
      cleanEmail === BOOTSTRAP_EMAIL.toLowerCase() ||
      cleanEmail === 'dojale007@gmail.com'
    ) {
      return { success: false, error: 'An administrator account with this email already exists.' };
    }

    const newMember: AdminTeamMember = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: account.name.trim(),
      email: cleanEmail,
      role: account.role || 'Store Manager',
      password: account.password,
      createdAt: new Date().toISOString(),
      isPrimary: false,
    };

    const updatedTeam = [...adminTeam, newMember];
    setAdminTeam(updatedTeam);
    safeStorage.setItem(ADMIN_TEAM_STORAGE_KEY, updatedTeam);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('site_settings').upsert(
          {
            key: 'admin_team',
            value: updatedTeam,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn('Failed to sync admin_team to Supabase:', err);
      }
    }

    return { success: true };
  };

  const removeAdminAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = adminTeam.find((m) => m.id === id);
    if (!target) {
      return { success: false, error: 'Administrator account not found.' };
    }
    if (target.isPrimary || target.id === 'primary-owner') {
      return { success: false, error: 'Cannot remove the primary administrator account.' };
    }
    if (user && user.email.toLowerCase() === target.email.toLowerCase()) {
      return { success: false, error: 'You cannot remove your own active administrator account.' };
    }

    const updatedTeam = adminTeam.filter((m) => m.id !== id);
    setAdminTeam(updatedTeam);
    safeStorage.setItem(ADMIN_TEAM_STORAGE_KEY, updatedTeam);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('site_settings').upsert(
          {
            key: 'admin_team',
            value: updatedTeam,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn('Failed to sync admin_team deletion to Supabase:', err);
      }
    }

    return { success: true };
  };

  const updateAdminTeamMemberPassword = async (
    id: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const target = adminTeam.find((m) => m.id === id);
    if (!target) {
      return { success: false, error: 'Administrator account not found.' };
    }

    const updatedTeam = adminTeam.map((m) => {
      if (m.id === id) {
        return { ...m, password: newPass };
      }
      return m;
    });

    setAdminTeam(updatedTeam);
    safeStorage.setItem(ADMIN_TEAM_STORAGE_KEY, updatedTeam);

    if (target.isPrimary || target.id === 'primary-owner') {
      safeStorage.setItem(PASS_HASH_KEY, newPass);
      setIsCustomPassword(newPass !== BOOTSTRAP_PASS);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('site_settings').upsert(
          {
            key: 'admin_team',
            value: updatedTeam,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn('Failed to sync updated admin password to Supabase:', err);
      }
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
        adminTeam,
        login,
        logout,
        changePassword,
        addAdminAccount,
        removeAdminAccount,
        updateAdminTeamMemberPassword,
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
