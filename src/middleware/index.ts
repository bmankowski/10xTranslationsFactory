import { defineMiddleware } from 'astro:middleware';
import { isProtectedRoute } from '../lib/auth';
import { getSupabaseServerClient } from '../db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
	const { request, cookies, redirect } = context;
	const url = new URL(request.url);
	const pathname = url.pathname;

	console.log('Testing middleware');

	// Check if path requires authentication
	const requiresAuth = isProtectedRoute(pathname);

	if (requiresAuth) {
		// Get server-side Supabase client with cookies
		const supabase = getSupabaseServerClient(cookies, request);
		
		// Check if user is authenticated using getSession (not getUser)
		const { data } = await supabase.auth.getSession();
		
		// If no session, redirect to login
		if (!data.session) {
			// Redirect to login page with return URL
			const redirectTo = encodeURIComponent(pathname + url.search);
			return redirect(`/auth/login?redirectTo=${redirectTo}`);
		}
	}

	// Continue to the requested page
	return next();
}); 