import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
    }

    // Create server-side Supabase client with simplified cookie handling
    const supabase = createServerSupabaseClient(cookies);

    // Sign in with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }

    if (authData && authData.session) {
      // Return success with user data
      return new Response(
        JSON.stringify({
          success: true,
          user: authData.user,
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Internal server error: " + errorMessage }), { status: 500 });
  }
};
