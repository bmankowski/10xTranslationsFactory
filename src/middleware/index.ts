import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance, isProtectedRoute } from '../lib/auth';

// This is a placeholder middleware that will be fully implemented later
export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip auth check for public routes or auth routes
  if (
    pathname.startsWith('/auth/') ||
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/kitchen-sink') ||
    pathname.startsWith('/_image')
  ) {
    return next();
  }
  
  // Check if path requires authentication
  const requiresAuth = isProtectedRoute(pathname);
  
  if (requiresAuth) {
    // Create Supabase client to access session info
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Redirect to login page with return URL
      const redirectTo = encodeURIComponent(url.pathname + url.search);
      return redirect(`/auth/login?redirectTo=${redirectTo}`);
    }
    
    // Add session to locals for use in routes
    context.locals.session = session;
  }
  
  return next();
}); 