/// <reference types="astro/client" />

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './db/database.types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: User | null;
      session: {
        userId: string;
        email: string;
        role?: string;
        preferredLanguage?: "English" | "Spanish";
      } | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string; 
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly AUTH_REDIRECT_URI: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
