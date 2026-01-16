import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build, these might be missing. We return a proxy to prevent crashes.
  if (!url || !key) {
    return {} as any;
  }

  return createBrowserClient(url, key);
}