import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../db/supabase';
import type { TextDTO } from '@/types';

// Schema for validating textId parameter
const textIdSchema = z.string().uuid();

export const GET: APIRoute = async ({ params }) => {
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
    const { data: text, error: textError } = await supabase
      .from('texts')
      .select(`
        *,
        language:language_id (
          id,
          code,
          name,
          is_active,
          created_at,
          updated_at
        ),
        proficiency_level:proficiency_level_id (
          id,
          name,
          display_order,
          created_at,
          updated_at
        )
      `)
      .eq('id', textId)
      .eq('is_deleted', false)
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

    // Check if user has access to the text
    if (text.visibility === 'private' && text.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to access this text' }), 
        { status: 403 }
      );
    }

    // Map the response to TextDTO
    const textDTO: TextDTO = {
      id: text.id,
      title: text.title,
      content: text.content,
      language_id: text.language_id,
      language: text.language,
      proficiency_level_id: text.proficiency_level_id,
      proficiency_level: text.proficiency_level,
      topic: text.topic,
      visibility: text.visibility,
      word_count: text.word_count,
      user_id: text.user_id,
      created_at: text.created_at,
      updated_at: text.updated_at
    };

    return new Response(JSON.stringify(textDTO), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}; 