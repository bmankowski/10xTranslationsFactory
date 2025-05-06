import type { APIRoute } from 'astro';
import { getSupabaseClient } from '../../../lib/supabase-client';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = getSupabaseClient(cookies, request);
  
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Clear auth cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  cookies.delete('supabase-auth-token', { path: '/' });
  
  // Redirect to home page
  return redirect('/', 302);
}; 