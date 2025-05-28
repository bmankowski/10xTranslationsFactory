// src/db/supabase.ts
import { createBrowserClient, createServerClient } from "@supabase/ssr";

// Create a server-side Supabase client that properly handles cookies using modern approach
export const createServerSupabaseClient = (cookies: {
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  get: (name: string) => { value: string } | undefined;
}) => {
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        // Get all cookies that start with 'sb-' (Supabase cookies)
        const supabaseCookies: { name: string; value: string }[] = [];

        // Try to get the main auth token cookie
        const authTokenCookie = cookies.get(
          `sb-${import.meta.env.PUBLIC_SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`
        );
        if (authTokenCookie) {
          supabaseCookies.push({
            name: `sb-${import.meta.env.PUBLIC_SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`,
            value: authTokenCookie.value,
          });
        }

        return supabaseCookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            path: "/",
            sameSite: "lax",
            secure: import.meta.env.PROD,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            ...options,
          });
        });
      },
    },
  });
};

// Helper function to create a browser client when needed (for client-side components)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};
