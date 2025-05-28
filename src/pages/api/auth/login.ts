import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
    }

    // Sign in with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }

    if (authData && authData.session) {
      // Set auth cookies - make sure to use the exact cookie names expected by Supabase
      cookies.set("sb-access-token", authData.session.access_token, {
        path: "/",
        sameSite: "lax",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: authData.session.expires_in, // Set cookie to expire when the session does
      });

      cookies.set("sb-refresh-token", authData.session.refresh_token, {
        path: "/",
        sameSite: "lax",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
      });

      // Set user identity for client (non-sensitive data)
      cookies.set("sb-user-id", authData.user.id, {
        path: "/",
        sameSite: "lax",
        secure: import.meta.env.PROD,
        httpOnly: false, // Allows JavaScript to read this
        maxAge: authData.session.expires_in,
      });

      // Log for debugging

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
