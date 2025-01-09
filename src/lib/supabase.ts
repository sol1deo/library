import { createClient } from '@supabase/supabase-js';

// Provide fallback values during development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Please click the "Connect to Supabase" button to set up your Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);