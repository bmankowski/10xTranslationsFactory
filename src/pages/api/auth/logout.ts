import type { APIRoute } from 'astro';
import { supabase } from '../../../db/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Clear auth cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  
  // Return success response
  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Also support GET for direct navigation
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Clear auth cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  
  // Redirect to home page
  return redirect('/', 302);
}; 