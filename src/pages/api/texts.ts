import type { APIRoute } from 'astro';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../db/supabase';

// Define schema for input validation
const createTextSchema = z.object({
  language_id: z.string().uuid(),
  proficiency_level_id: z.string().uuid(),
  topic: z.string().min(1),
  visibility: z.enum(['public', 'private'])
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get the authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        details: 'You must be logged in to create texts' 
      }), { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = createTextSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request data', details: parsed.error.issues }), { status: 400 });
    }
    const { language_id, proficiency_level_id, topic, visibility } = parsed.data;

    // Create text record in Supabase
    const textId = uuidv4();
    const textData = {
      id: textId,
      title: topic,
      content: "",
      language_id,
      proficiency_level_id,
      topic,
      visibility,
      word_count: 0,
      user_id: session.user.id,  // Use the authenticated user's ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to create text with data:', textData);

    const { data: text, error: textError } = await supabase
      .from('texts')
      .insert(textData)
      .select()
      .single();

    if (textError) {
      console.error('Error creating text:', {
        message: textError.message,
        details: textError.details,
        hint: textError.hint,
        code: textError.code
      });
      return new Response(JSON.stringify({ 
        error: 'Failed to create text', 
        details: textError 
      }), { status: 500 });
    }

    // Generate questions
    const questions = [
      {
        id: uuidv4(),
        text_id: textId,
        content: 'What is the main point of the text?',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        text_id: textId,
        content: 'List one detail mentioned in the text.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        text_id: textId,
        content: 'How is the argument structured in the text?',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        text_id: textId,
        content: 'What is the tone used in the text?',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('Attempting to create questions:', questions);

    // Save questions to Supabase
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questions);

    if (questionsError) {
      console.error('Error creating questions:', {
        message: questionsError.message,
        details: questionsError.details,
        hint: questionsError.hint,
        code: questionsError.code
      });
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

    // Return a successful response with the created text and generated questions
    return new Response(JSON.stringify({ text, questions }), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/texts:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}; 