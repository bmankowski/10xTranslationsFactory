import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../../db/supabase';
import type { UserResponseDTO } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateFeedback } from '@/lib/services/feedbackService';

// Schema for validating questionId parameter
const questionIdSchema = z.string().uuid();

// Schema for validating the request body
const submitResponseSchema = z.object({
  response_text: z.string().min(1, "Response text is required"),
  response_time: z.number().int().positive("Response time must be a positive integer")
});

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Validate questionId parameter
    const questionIdResult = questionIdSchema.safeParse(params.questionId);
    if (!questionIdResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid question ID format',
          details: questionIdResult.error.issues 
        }), 
        { status: 400 }
      );
    }

    const questionId = questionIdResult.data;

    // Parse request body
    const body = await request.json();
    const commandResult = submitResponseSchema.safeParse(body);
    
    if (!commandResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data', 
          details: commandResult.error.issues 
        }), 
        { status: 400 }
      );
    }

    const { response_text, response_time } = commandResult.data;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          details: authError 
        }), 
        { status: 401 }
      );
    }

    // Check if question exists
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*, text:text_id(visibility, user_id)')
      .eq('id', questionId)
      .single();

    if (questionError) {
      if (questionError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Question not found' }), 
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch question data',
          details: questionError 
        }), 
        { status: 500 }
      );
    }

    // Check if user has access to the question (via text visibility)
    if (questionData.text.visibility === 'private' && questionData.text.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to answer this question' }), 
        { status: 403 }
      );
    }

    // Evaluate the response and generate feedback
    const { isCorrect, feedback } = await generateFeedback(questionId, response_text);

    // Create response record
    const responseId = uuidv4();
    const responseData: Omit<UserResponseDTO, 'created_at'> = {
      id: responseId,
      user_id: user.id,
      question_id: questionId,
      response_text: response_text,
      is_correct: isCorrect,
      feedback: feedback,
      response_time: response_time,
    };

    const { error: insertError } = await supabase
      .from('user_responses')
      .insert({
        ...responseData,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save response', 
          details: insertError 
        }), 
        { status: 500 }
      );
    }

    // Return the created response data
    return new Response(
      JSON.stringify({
        ...responseData,
        created_at: new Date().toISOString()
      }), 
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in POST /api/questions/[questionId]/responses:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}; 