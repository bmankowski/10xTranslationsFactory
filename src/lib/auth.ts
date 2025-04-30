import type { AstroCookies } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { Database } from '../db/database.types';

/**
 * Cookie options for authentication cookies
 */
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
};

/**
 * Helper function to parse the cookie header into an array of cookies
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

/**
 * Creates a Supabase server client instance
 * 
 * Note: This is a placeholder that will be fully implemented later.
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') || '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return supabase;
};

/**
 * Creates a Supabase client for browser/client-side use
 * 
 * Note: This is a placeholder that will be fully implemented later.
 */
export const createSupabaseClient = () => {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

// Note: The following functions are placeholders that will be implemented later

/**
 * Server-side function to check if the current request has a valid session
 */
export const getSessionFromRequest = async (request: Request) => {
  // Implementation will be added later
  return null;
};

/**
 * Helper to determine if a route requires authentication
 */
export const isProtectedRoute = (pathname: string) => {
  // Implementation will be added later
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}; 