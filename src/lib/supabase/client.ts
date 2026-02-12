import { createBrowserClient } from "@supabase/ssr";

// This function creates a Supabase client for use in the browser (Client Components).
// It uses the NEXT_PUBLIC_ env variables which are exposed to the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
