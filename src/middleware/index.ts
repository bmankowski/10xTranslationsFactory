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

	const supabase = getSupabaseServerClient(cookies, request);


	console.log('Supabase', await supabase.auth.getUser());
	// if (requiresAuth) {

	// 	// Check if user is authenticated
	// 	const { data: { session } } = await supabase.auth.getSession();

	// 	if (!session) {
	// 		// Redirect to login page with return URL
	// 		const redirectTo = encodeURIComponent(url.pathname + url.search);
	// 		return redirect(`/auth/login?redirectTo=${redirectTo}`);
	// 	}

	// }

	return next();
}); 