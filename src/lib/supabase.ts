import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Clean and sanitize the URL (strips any trailing /rest/v1 or slashes)
const sanitizeUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
};

const defaultProjectUrl = 'https://ytaqjjaubwlbhtuqcmpk.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YXFqamF1YndsYmh0dXFjbXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1OTcwOTgsImV4cCI6MjEwODE3MzA5OH0.koNLHRt4Psvui1IegapaXbOYY5jtj3RzyY9LwRm_8HI';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || defaultProjectUrl;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

const supabaseUrl = sanitizeUrl(rawUrl);
const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
