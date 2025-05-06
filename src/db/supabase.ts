// src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { type AstroCookies } from 'astro';

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
                    // Forward the Authorization header if it exists
                    Authorization: request?.headers.get('Authorization') ?? ''
                }
            }
        }
    );

    // Get access token and refresh token from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    // Check for alternative cookie format (Supabase may use this format)
    const supabaseAuthCookie = cookies.get('supabase-auth-token');
    
    if (accessToken && refreshToken) {
        // Set session if we have both tokens
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } else if (supabaseAuthCookie?.value) {
        // Try to parse the auth cookie directly if it exists
        try {
            const [accessToken, refreshToken] = JSON.parse(supabaseAuthCookie.value);
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } catch (e) {
            console.error('Failed to parse supabase auth cookie', e);
        }
    }

    return supabase;
}

/**
 * Singleton Supabase client instance for server-side usage.
 * This ensures we only create one instance of the Supabase client.
 */
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

/**
 * Creates or returns a singleton Supabase client instance for server-side usage.
 * This function ensures we only create one instance of the Supabase client.
 * 
 * @param cookies - Astro cookies object
 * @param request - Optional request object
 * @returns A Supabase client instance
 */
export function getSupabaseServerSingleton(
    cookies: AstroCookies,
    request?: Request
) {
    if (!supabaseServerInstance) {
        supabaseServerInstance = getSupabaseServerClient(cookies, request);
    } else {
        // Update the session information from cookies
        const accessToken = cookies.get('sb-access-token')?.value;
        const refreshToken = cookies.get('sb-refresh-token')?.value;
        
        // Check for alternative cookie format
        const supabaseAuthCookie = cookies.get('supabase-auth-token');
        
        if (accessToken && refreshToken) {
            // Set session if we have both tokens
            supabaseServerInstance.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } else if (supabaseAuthCookie?.value) {
            try {
                const [accessToken, refreshToken] = JSON.parse(supabaseAuthCookie.value);
                supabaseServerInstance.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
            } catch (e) {
                console.error('Failed to parse supabase auth cookie', e);
            }
        }
    }
    
    return supabaseServerInstance;
}

/**
 * Creates a Supabase client instance for client-side usage.
 * This function should be used in browser environments.
 * 
 * @returns A Supabase client instance
 */
export function createSupabaseClient() {
    const supabase = createClient(
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
    
    return supabase;
}


