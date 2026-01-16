import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // If keys are missing, return a dummy client so the build doesn't crash
  if (!supabaseUrl || !supabaseAnonKey) {
    return {} as any; 
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}