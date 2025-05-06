import type { APIRoute } from 'astro';
import { supabase } from '../../../db/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.json();
    const { email, password } = data;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }), 
        { status: 400 }
      );
    }
    
    // Sign in with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 401 }
      );
    }
    
    if (authData.session) {
      // Set auth cookies
      cookies.set('sb-access-token', authData.session.access_token, {
        path: '/',
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        httpOnly: true
      });
      
      cookies.set('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        httpOnly: true
      });
      
      // Return success with user data
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: authData.user 
        }), 
        { status: 200 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }), 
      { status: 401 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}; 