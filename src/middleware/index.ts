import { defineMiddleware } from "astro:middleware";
import { isProtectedRoute } from "../lib/auth";
import { createServerSupabaseClient } from "../db/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Create a server-side Supabase client with simplified cookie handling
  const supabase = createServerSupabaseClient(cookies);

  // Always get session data
  const { data } = await supabase.auth.getSession();

  // Set user in locals for all routes
  if (data.session) {
    context.locals.user = data.session.user;
  }

  // Check if path requires authentication
  const requiresAuth = isProtectedRoute(pathname);

  if (requiresAuth && !data.session) {
    // Redirect to login page with return URL
    const redirectTo = encodeURIComponent(pathname + url.search);
    return redirect(`/auth/login?redirectTo=${redirectTo}`);
  }

  // Continue to the requested page
  return next();
});
