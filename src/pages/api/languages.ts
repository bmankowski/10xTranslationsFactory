import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../db/supabase";
import { createClient } from "@supabase/supabase-js";
import type { LanguageDTO } from "../../types";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    console.log("Languages API called");
    console.log("Supabase URL:", process.env.PUBLIC_SUPABASE_URL ? "Set" : "Missing");
    console.log("Supabase Key:", process.env.PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing");

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient(cookies);
    console.log("Supabase client created");

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("Auth check - user:", user?.id, "error:", authError);

    // Try basic client as fallback
    if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const basicSupabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);
    console.log("Basic Supabase client created");

    // Fetch active languages from Supabase
    const { data, error } = await basicSupabase.from("languages").select("*").eq("is_active", true).order("name");
    console.log("Query result - data:", data, "error:", error);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch languages",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the languages data
    return new Response(JSON.stringify(data as LanguageDTO[]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
