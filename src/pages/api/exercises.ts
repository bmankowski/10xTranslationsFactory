import type { APIRoute } from "astro";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createServerSupabaseClient } from "../../db/supabase";
import type { TextWithQuestionsDTO } from "@/types";
import { createTextWithQuestionsOpenRouterService } from "../../lib/openrouter";
import { TextWithQuestionsResponseSchema } from "../../lib/services/openRouterTypes";
import { PROMPT_TEMPLATES } from "../../lib/utils/templateUtils";

// Define schema for input validation
const createTextSchema = z.object({
  language_id: z.string().uuid(),
  proficiency_level_id: z.string().uuid(),
  topic: z.string().min(1),
  visibility: z.enum(["public", "private"]),
});

// Pagination defaults and limits
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const languageId = url.searchParams.get("language_id");
    const proficiencyLevelId = url.searchParams.get("proficiency_level_id");
    const visibility = url.searchParams.get("visibility");

    // Parse and validate pagination parameters
    const limit = Math.min(parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT)), MAX_LIMIT);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || String(DEFAULT_OFFSET)), DEFAULT_OFFSET);

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient(cookies);

    // Try to get authenticated user (optional for GET)
    let user = null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    } catch {
      // Ignore auth errors for GET - allow unauthenticated access
    }

    // Build query with nested selects
    let query = supabase.from("texts").select(
      `
        *,
        language:language_id(*),
        proficiency_level:proficiency_level_id(*),
        questions(*)
      `,
      { count: "exact" }
    );

    // Apply filters if provided
    if (languageId) {
      query = query.eq("language_id", languageId);
    }
    if (proficiencyLevelId) {
      query = query.eq("proficiency_level_id", proficiencyLevelId);
    }

    // Handle visibility filtering
    if (visibility) {
      if (visibility === "private" && !user) {
        // If requesting private exercises but not authenticated, return empty result
        return new Response(
          JSON.stringify({
            texts: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      query = query.eq("visibility", visibility);
      if (visibility === "private" && user) {
        // Only show user's own private exercises
        query = query.eq("user_id", user.id);
      }
    } else {
      // If no visibility filter specified, show public exercises + user's private exercises
      if (user) {
        query = query.or(`visibility.eq.public,and(visibility.eq.private,user_id.eq.${user.id})`);
      } else {
        query = query.eq("visibility", "public");
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    // Execute query
    const { data: texts, error, count } = await query;

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch texts",
          details: error,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        texts,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: count ? offset + limit < count : false,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();

    const parsed = createTextSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request data", details: parsed.error.issues }), {
        status: 400,
      });
    }

    const { language_id, proficiency_level_id, topic, visibility } = parsed.data;

    // Create server-side Supabase client with cookies
    const serverSupabase = createServerSupabaseClient(cookies);

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          details: authError,
        }),
        { status: 401 }
      );
    }

    // Get language and proficiency level info for generating appropriate content
    const { data: languageData } = await serverSupabase
      .from("languages")
      .select("name, code")
      .eq("id", language_id)
      .single();

    const { data: levelData } = await serverSupabase
      .from("proficiency_levels")
      .select("name, description")
      .eq("id", proficiency_level_id)
      .single();

    if (!languageData || !levelData) {
      return new Response(
        JSON.stringify({
          error: "Language or proficiency level not found",
        }),
        { status: 400 }
      );
    }

    // Create OpenRouter service for generating text with questions
    const openRouter = createTextWithQuestionsOpenRouterService();

    // Generate text and questions using AI
    const prompt = `Generate a language learning text about "${topic}" in ${languageData.name} (${languageData.code}) 
    at ${levelData.name} level (${levelData.description}). 
    The text should be educational, engaging, and appropriate for language learners at this level. 
    Include 4-5 comprehension questions about the text that would be suitable for language practice.`;

    try {
      const response = await openRouter.sendMessage(prompt, PROMPT_TEMPLATES.EXERCISE_GENERATOR);

      // Validate response structure
      const validatedResponse = TextWithQuestionsResponseSchema.parse(response);

      const generatedText = validatedResponse.text;
      const generatedQuestions = validatedResponse.questions.map((q) => q.question);

      // Calculate word count
      const wordCount = generatedText.split(/\s+/).filter(Boolean).length;

      // Create text record in Supabase
      const textId = uuidv4();
      const textData: Omit<TextWithQuestionsDTO, "questions" | "language" | "proficiency_level"> = {
        id: textId,
        title: topic,
        content: generatedText,
        language_id,
        proficiency_level_id,
        topic,
        visibility,
        word_count: wordCount,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert the text
      const { error: textError } = await serverSupabase.from("texts").insert(textData);

      if (textError) {
        return new Response(
          JSON.stringify({
            error: "Failed to create text",
            details: textError,
          }),
          { status: 500 }
        );
      }

      // Generate questions from AI response
      const questions = generatedQuestions.map((questionContent) => ({
        id: uuidv4(),
        text_id: textId,
        content: questionContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Save questions
      const { error: questionsError } = await serverSupabase.from("questions").insert(questions);

      if (questionsError) {
        // Try to delete the text if questions creation fails
        await serverSupabase.from("texts").delete().eq("id", textId);

        return new Response(
          JSON.stringify({
            error: "Failed to create questions",
            details: questionsError,
          }),
          { status: 500 }
        );
      }

      // Fetch the complete text with relations for response
      const { data: completeText, error: fetchError } = await serverSupabase
        .from("texts")
        .select(
          `
          *,
          language:language_id(*),
          proficiency_level:proficiency_level_id(*),
          questions(*)
        `
        )
        .eq("id", textId)
        .single<TextWithQuestionsDTO>();

      if (fetchError) {
        return new Response(
          JSON.stringify({
            error: "Text created but failed to fetch complete data",
            details: fetchError,
          }),
          { status: 500 }
        );
      }

      // Return successful response
      return new Response(JSON.stringify(completeText), { status: 201 });
    } catch (aiError) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate content",
          details: aiError instanceof Error ? aiError.message : "AI generation error",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
