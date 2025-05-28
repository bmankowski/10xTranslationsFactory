import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../db/supabase";
import type { ProficiencyLevelDTO } from "../../types";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient(cookies);
    
    // Fetch proficiency levels from Supabase, ordered by display_order
    const { data, error } = await supabase.from("proficiency_levels").select("*").order("display_order");

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch proficiency levels",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the proficiency levels data
    return new Response(JSON.stringify(data as ProficiencyLevelDTO[]), {
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
