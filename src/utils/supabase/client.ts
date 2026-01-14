import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Use ?? "" to provide an empty string instead of crashing during the build process
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
}