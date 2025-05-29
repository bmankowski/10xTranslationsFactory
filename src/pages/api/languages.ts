import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import type { LanguageDTO } from "../../types";

export const GET: APIRoute = async () => {
  try {
    if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const basicSupabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);

    // Fetch active languages from Supabase
    const { data, error } = await basicSupabase.from("languages").select("*").eq("is_active", true).order("name");
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
