import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Create server-side Supabase client with simplified cookie handling
  const supabase = createServerSupabaseClient(cookies);

  // Sign out on the server
  await supabase.auth.signOut();

  // Redirect to home page
  return redirect("/", 302);
};

// Also support GET for direct navigation
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Create server-side Supabase client with simplified cookie handling
  const supabase = createServerSupabaseClient(cookies);

  // Sign out on the server
  await supabase.auth.signOut();

  // Redirect to home page
  return redirect("/", 302);
};
