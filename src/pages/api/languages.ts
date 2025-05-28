import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../db/supabase";
import type { LanguageDTO } from "../../types";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient(cookies);
    // Fetch active languages from Supabase
    const { data, error } = await supabase.from("languages").select("*").eq("is_active", true).order("name");

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
