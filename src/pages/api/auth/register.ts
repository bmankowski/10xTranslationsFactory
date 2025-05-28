import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient(cookies);

    // Register with Supabase
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // If email confirmation is required
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email confirmation required",
        }),
        { status: 200 }
      );
    }

    // If immediate session is created, cookies are automatically handled by the server client
    // Return success with user data
    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: `Internal server error: ${String(err)}` }), { status: 500 });
  }
};
