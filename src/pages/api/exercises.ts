import type { APIRoute } from 'astro';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../db/supabase';
import type { TextWithQuestionsDTO } from '@/types';
import { createTextWithQuestionsOpenRouterService } from '../../lib/openrouter';
import { TextWithQuestionsResponseSchema } from '../../lib/services/openRouterTypes';

// Define schema for input validation
const createTextSchema = z.object({
  language_id: z.string().uuid(),
  proficiency_level_id: z.string().uuid(),
  topic: z.string().min(1),
  visibility: z.enum(['public', 'private'])
});

// Pagination defaults and limits
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const languageId = url.searchParams.get('language_id');
    const proficiencyLevelId = url.searchParams.get('proficiency_level_id');
    const visibility = url.searchParams.get('visibility');
    
    // Parse and validate pagination parameters
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT)),
      MAX_LIMIT
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || String(DEFAULT_OFFSET)),
      DEFAULT_OFFSET
    );

    // Build query with nested selects
    let query = supabase
      .from('texts')
      .select(`
        *,
        language:language_id(*),
        proficiency_level:proficiency_level_id(*),
        questions(*)
      `, { count: 'exact' });

    // Apply filters if provided
    if (languageId) {
      query = query.eq('language_id', languageId);
    }
    if (proficiencyLevelId) {
      query = query.eq('proficiency_level_id', proficiencyLevelId);
    }
    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Execute query
    const { data: texts, error, count } = await query;

    if (error) {
      console.error('Error fetching texts:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch texts', 
        details: error 
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      texts,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/exercises:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    console.log('Received request body:', body);
    
    const parsed = createTextSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.issues);
      return new Response(JSON.stringify({ error: 'Invalid request data', details: parsed.error.issues }), { status: 400 });
    }
    
    const { language_id, proficiency_level_id, topic, visibility } = parsed.data;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ 
        error: 'Authentication required', 
        details: authError 
      }), { status: 401 });
    }

    // Get language and proficiency level info for generating appropriate content
    const { data: languageData } = await supabase
      .from('languages')
      .select('name, code')
      .eq('id', language_id)
      .single();


    const { data: levelData } = await supabase
      .from('proficiency_levels')
      .select('name, description')
      .eq('id', proficiency_level_id)
      .single();

    if (!languageData || !levelData) {
      return new Response(JSON.stringify({ 
        error: 'Language or proficiency level not found'
      }), { status: 400 });
    }

    // Create OpenRouter service for generating text with questions
    const openRouter = createTextWithQuestionsOpenRouterService();

    // Generate text and questions using AI
    const prompt = `Generate a language learning text about "${topic}" in ${languageData.name} (${languageData.code}) 
    at ${levelData.name} level (${levelData.description}). 
    The text should be educational, engaging, and appropriate for language learners at this level. 
    Include 4-5 comprehension questions about the text that would be suitable for language practice.`;

    console.log('Sending prompt to OpenRouter:', prompt);

    try {
      const response = await openRouter.sendMessage(prompt);
      console.log('OpenRouter response:', response);
      
      // Validate response structure
      const validatedResponse = TextWithQuestionsResponseSchema.parse(response);
      
      const generatedText = validatedResponse.text;
      const generatedQuestions = validatedResponse.questions.map(q => q.question);
      
      // Calculate word count
      const wordCount = generatedText.split(/\s+/).filter(Boolean).length;

      // Create text record in Supabase
      const textId = uuidv4();
      const textData: Omit<TextWithQuestionsDTO, 'questions' | 'language' | 'proficiency_level'> = {
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
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to create text with data:', textData);

      // Insert the text
      const { error: textError } = await supabase
        .from('texts')
        .insert(textData);

      if (textError) {
        console.error('Error creating text:', textError);
        return new Response(JSON.stringify({ 
          error: 'Failed to create text', 
          details: textError 
        }), { status: 500 });
      }

      // Generate questions from AI response
      const questions = generatedQuestions.map(questionContent => ({
        id: uuidv4(),
        text_id: textId,
        content: questionContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Save questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questions);

      if (questionsError) {
        console.error('Error creating questions:', questionsError);
        // Try to delete the text if questions creation fails
        await supabase
          .from('texts')
          .delete()
          .eq('id', textId);
          
        return new Response(JSON.stringify({ 
          error: 'Failed to create questions', 
          details: questionsError 
        }), { status: 500 });
      }

      // Fetch the complete text with relations for response
      const { data: completeText, error: fetchError } = await supabase
        .from('texts')
        .select(`
          *,
          language:language_id(*),
          proficiency_level:proficiency_level_id(*),
          questions(*)
        `)
        .eq('id', textId)
        .single<TextWithQuestionsDTO>();

      if (fetchError) {
        console.error('Error fetching complete text:', fetchError);
        return new Response(JSON.stringify({ 
          error: 'Text created but failed to fetch complete data', 
          details: fetchError 
        }), { status: 500 });
      }

      // Return successful response
      return new Response(JSON.stringify(completeText), { status: 201 });
      
    } catch (aiError) {
      console.error('Error generating content with AI:', aiError);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate content', 
        details: aiError instanceof Error ? aiError.message : 'AI generation error'
      }), { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/exercises:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}; 