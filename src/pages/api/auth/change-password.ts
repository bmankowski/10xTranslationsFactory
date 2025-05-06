import type { APIRoute } from 'astro';
import { supabase } from '../../../db/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.json();
    const { currentPassword, newPassword } = data;
    
    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Current password and new password are required' }), 
        { status: 400 }
      );
    }
    
    // Get current user session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401 }
      );
    }
    
    // First verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: sessionData.session.user.email!,
      password: currentPassword
    });
    
    if (signInError) {
      return new Response(
        JSON.stringify({ error: 'Current password is incorrect' }), 
        { status: 401 }
      );
    }
    
    // Change the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password changed successfully' 
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Password change error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}; 