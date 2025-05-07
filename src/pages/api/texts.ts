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
    // Parse and validate request body
    const body = await request.json();
    
    console.log('Received request body:', body);
    
    const parsed = createTextSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.issues);
      return new Response(JSON.stringify({ error: 'Invalid request data', details: parsed.error.issues }), { status: 400 });
    }
    
    const { language_id, proficiency_level_id, topic, visibility } = parsed.data;

    // Sample content for development purposes
    const sampleContent = `This is a sample text about ${topic}. It contains some words and sentences that can be used for language learning exercises. The content is generated automatically for testing purposes.`;
    
    // Calculate word count
    const wordCount = sampleContent.split(/\s+/).filter(Boolean).length;

    const { data: user } = await supabase.auth.getUser();
    const user_id = user.user?.id;
    // Create text record in Supabase
    const textId = uuidv4();
    const textData = {
      id: textId,
      title: topic,
      content: sampleContent,
      language_id,
      proficiency_level_id,
      topic,
      visibility,
      word_count: wordCount,
      user_id: user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to create text with data:', textData);

    // Using the supabaseAdmin client to bypass RLS policies
    let textResponse = await supabase
      .from('texts')
      .insert(textData)
      .select()
      .single();

    if (textResponse.error) {
      console.error('Error creating text:', {
        message: textResponse.error.message,
        details: textResponse.error.details,
        hint: textResponse.error.hint,
        code: textResponse.error.code
      });
      
      // If it's a foreign key error with user_id, it means the test user doesn't exist
      if (textResponse.error.code === '23503' && textResponse.error.message.includes('user_id')) {
        // Create a test text with an SQL function that bypasses foreign key check (admin use only!)
        try {
          console.log('Attempting to create text with raw SQL to bypass foreign key check');
          const { data: textSQL, error: textSQLError } = await supabase.rpc('create_text_without_user_check', { 
            text_id: textId,
            text_title: topic,
            text_content: sampleContent,
            text_lang_id: language_id,
            text_prof_id: proficiency_level_id,
            text_topic: topic,
            text_visibility: visibility,
            text_word_count: wordCount
          });
          
          if (textSQLError) {
            console.error('SQL function failed:', textSQLError);
            return new Response(JSON.stringify({ 
              error: 'Failed to create text with SQL function', 
              details: textSQLError
            }), { status: 500 });
          }
          
          // Set text to the result from the SQL function
          const text = textSQL;
          
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
          
          // Save questions to Supabase using admin client 
          const { error: questionsError } = await supabase
            .from('questions')
            .insert(questions);
          
          if (questionsError) {
            console.error('Error creating questions:', questionsError);
            return new Response(JSON.stringify({ 
              error: 'Failed to create questions', 
              details: questionsError
            }), { status: 500 });
          }
          
          // Return successful response
          return new Response(JSON.stringify({ text, questions }), { status: 201 });
        } catch (sqlError) {
          console.error('Error in SQL approach:', sqlError);
          return new Response(JSON.stringify({ 
            error: 'Failed with SQL approach', 
            details: sqlError instanceof Error ? sqlError.message : 'Unknown error'
          }), { status: 500 });
        }
      }
      
      // Return detailed error for debugging
      return new Response(JSON.stringify({ 
        error: 'Failed to create text', 
        details: {
          message: textResponse.error.message,
          details: textResponse.error.details,
          hint: textResponse.error.hint,
          code: textResponse.error.code
        }
      }), { status: 500 });
    }

    const text = textResponse.data;

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

    // Save questions to Supabase using admin client to bypass RLS
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
      const { error: deleteError } = await supabase
        .from('texts')
        .delete()
        .eq('id', textId);
        
      if (deleteError) {
        console.error('Error cleaning up text after question creation failure:', deleteError);
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to create questions', 
        details: {
          message: questionsError.message,
          details: questionsError.details,
          hint: questionsError.hint,
          code: questionsError.code
        }
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