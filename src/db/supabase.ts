// src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

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





