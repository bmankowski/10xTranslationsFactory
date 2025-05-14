import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../db/supabase';
import type { TextWithQuestionsDTO} from '@/types';

// Schema for validating textId parameter
const textIdSchema = z.string().uuid();

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Validate textId parameter
    const textIdResult = textIdSchema.safeParse(params.textId);
    if (!textIdResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid text ID format',
          details: textIdResult.error.issues 
        }), 
        { status: 400 }
      );
    }

    const textId = textIdResult.data;

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

    // Query the text with related data
    const { data: textData, error: textError } = await supabase
      .from('texts')
      .select(`
        *,
        language:language_id(*),
        proficiency_level:proficiency_level_id(*),
        questions(*)
      `)
      .eq('id', textId)
      .eq('is_deleted', false)
      .single<TextWithQuestionsDTO>();

    if (textError) {
      if (textError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Text not found' }), 
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch text',
          details: textError 
        }), 
        { status: 500 }
      );
    }

    // Check if user has access to the text
    if (textData.visibility === 'private' && textData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to access this text' }), 
        { status: 403 }
      );
    }

    return new Response(JSON.stringify(textData), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/exercises/[textId]:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    // Validate textId parameter
    const textIdResult = textIdSchema.safeParse(params.textId);
    if (!textIdResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid text ID format',
          details: textIdResult.error.issues 
        }), 
        { status: 400 }
      );
    }

    const textId = textIdResult.data;

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

    // Check if the text exists and belongs to the user
    const { data: text, error: textError } = await supabase
      .from('texts')
      .select('user_id')
      .eq('id', textId)
      .single();

    if (textError) {
      if (textError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Text not found' }), 
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch text',
          details: textError 
        }), 
        { status: 500 }
      );
    }

    // Check if user owns the text
    if (text.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to delete this text' }), 
        { status: 403 }
      );
    }

    // Delete associated questions first (to maintain referential integrity)
    const { error: questionsDeleteError } = await supabase
      .from('questions')
      .delete()
      .eq('text_id', textId);

    if (questionsDeleteError) {
      console.error('Error deleting questions:', questionsDeleteError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete associated questions',
          details: questionsDeleteError 
        }), 
        { status: 500 }
      );
    }

    // Delete the text
    const { error: deleteError } = await supabase
      .from('texts')
      .delete()
      .eq('id', textId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete text',
          details: deleteError 
        }), 
        { status: 500 }
      );
    }

    // Return success response
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/exercises/[textId]:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}; 