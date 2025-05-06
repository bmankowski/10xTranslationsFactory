import { createClient } from '@supabase/supabase-js';
import { type AstroCookies } from 'astro';

/**
 * Create a Supabase client for server-side operations with authentication from cookies
 */
export function getSupabaseClient(cookies: AstroCookies, request?: Request) {
    const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                flowType: 'pkce',
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    Authorization: request?.headers.get('Authorization') ?? ''
                }
            }
        }
    );

    // Get access token and refresh token from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    if (accessToken && refreshToken) {
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    }

    return supabase;
} 