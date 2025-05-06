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
 * Helper to determine if a route requires authentication
 */
export const isProtectedRoute = (pathname: string) => {
  const protectedRoutes = ['/profile', '/settings'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}; 