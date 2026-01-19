import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration for debugging
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env.local file');
  throw new Error('Missing required Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  } else {
    console.log('✅ Supabase connected successfully');
    if (data.session) {
      console.log('📧 Active session for:', data.session.user.email);
    }
  }
});

/**
 * Database Schema - Execute these SQL statements in Supabase SQL Editor
 * 
 * 1. Create users_profile table to store extended user information:
 * 
 * CREATE TABLE IF NOT EXISTS public.users_profile (
 *   id UUID REFERENCES auth.users(id) PRIMARY KEY,
 *   email TEXT NOT NULL,
 *   company_name TEXT,
 *   contact_name TEXT,
 *   phone TEXT,
 *   subscription_plan TEXT DEFAULT 'free',
 *   free_contracts_limit INTEGER DEFAULT 3,
 *   free_contracts_used INTEGER DEFAULT 0,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policy: Users can only read their own profile
 * CREATE POLICY "Users can view own profile" ON public.users_profile
 *   FOR SELECT USING (auth.uid() = id);
 * 
 * -- Create policy: Users can update their own profile
 * CREATE POLICY "Users can update own profile" ON public.users_profile
 *   FOR UPDATE USING (auth.uid() = id);
 * 
 * -- Create policy: Users can insert their own profile
 * CREATE POLICY "Users can insert own profile" ON public.users_profile
 *   FOR INSERT WITH CHECK (auth.uid() = id);
 * 
 * 
 * 2. Create contracts table to store contract records:
 * 
 * CREATE TABLE IF NOT EXISTS public.contracts (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   contract_name TEXT NOT NULL,
 *   file_url TEXT,
 *   review_result JSONB,
 *   status TEXT DEFAULT 'pending',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policy: Users can only read their own contracts
 * CREATE POLICY "Users can view own contracts" ON public.contracts
 *   FOR SELECT USING (auth.uid() = user_id);
 * 
 * -- Create policy: Users can insert their own contracts
 * CREATE POLICY "Users can insert own contracts" ON public.contracts
 *   FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * -- Create policy: Users can update their own contracts
 * CREATE POLICY "Users can update own contracts" ON public.contracts
 *   FOR UPDATE USING (auth.uid() = user_id);
 * 
 * -- Create policy: Users can delete their own contracts
 * CREATE POLICY "Users can delete own contracts" ON public.contracts
 *   FOR DELETE USING (auth.uid() = user_id);
 * 
 * 
 * 3. Create function to automatically create user profile on signup:
 * 
 * CREATE OR REPLACE FUNCTION public.handle_new_user()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   INSERT INTO public.users_profile (id, email)
 *   VALUES (NEW.id, NEW.email);
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * -- Create trigger
 * CREATE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
 */

export type UserProfile = {
  id: string;
  email: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  subscription_plan: 'free' | 'professional' | 'enterprise';
  free_contracts_limit: number;
  free_contracts_used: number;
  created_at: string;
  updated_at: string;
};

export type Contract = {
  id: string;
  user_id: string;
  contract_name: string;
  file_url?: string;
  review_result?: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};