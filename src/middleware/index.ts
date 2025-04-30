import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance, isProtectedRoute } from '../lib/auth';

// This is a placeholder middleware that will be fully implemented later
export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // Skip auth check for public paths
    const PUBLIC_PATHS = [
      // Auth pages
      "/auth/login",
      "/auth/register",
      "/auth/reset-password",
      "/auth/new-password",
      "/auth/verify-email",
      "/auth/success",
      // Auth API endpoints (will be implemented later)
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/logout",
      "/api/auth/reset-password",
      "/api/auth/callback",
    ];

    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Create Supabase instance for this request
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Add supabase client to locals for use in API routes and server components
    locals.supabase = supabase;

    // IMPORTANT: Always get user session first before any other operations
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Add user to locals for use in Astro components
    locals.user = user;

    // If user is authenticated, add session info to locals
    if (user) {
      locals.session = {
        userId: user.id,
        email: user.email as string,
        // Add other session properties as needed
      };
    } else if (isProtectedRoute(url.pathname)) {
      // Redirect to login page for protected routes if user is not authenticated
      return redirect(`/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
    }

    return next();
  },
); 