import { type CookieOptionsWithName } from "@supabase/ssr";

/**
 * Cookie options for authentication cookies
 */
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

/**
 * Helper to determine if a route requires authentication
 */
export const isProtectedRoute = (pathname: string) => {
  const protectedRoutes = ["/dashboard", "/profile", "/settings", "/exercises", "/lesson"];

  return protectedRoutes.some((route) => pathname.startsWith(route));
};
