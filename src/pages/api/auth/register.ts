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
    
    // Register with Supabase
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400 }
      );
    }
    
    // If email confirmation is required
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email confirmation required' 
        }), 
        { status: 200 }
      );
    }
    
    // If immediate session is created
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
    }
    
    // Return success with user data
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}; 