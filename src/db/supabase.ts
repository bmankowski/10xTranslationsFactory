// src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { type AstroCookies } from 'astro';

// Create a Supabase client for browser usage
export const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
        auth: {
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Create a Supabase admin client for privileged operations (if needed)
export const supabaseAdmin = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
    : null;

// Server-side Supabase client with authentication from cookies
export function getSupabaseServerClient(
    cookies: AstroCookies,
    request?: Request
) {
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
        // Set session if we have both tokens
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    }

    return supabase;
}



