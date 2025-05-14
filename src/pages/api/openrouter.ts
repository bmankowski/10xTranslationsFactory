import type { APIRoute } from 'astro';
import defaultOpenRouter, { createOpenRouterService, SYSTEM_PROMPTS } from '../../lib/openrouter';
import type { ModelParams } from '../../lib/services/openRouterTypes';

/**
 * OpenRouter API endpoint
 * 
 * Endpoint handles chat requests by forwarding them to OpenRouter service
 * POST /api/openrouter
 * 
 * Body: { 
 *   message: string, 
 *   additionalParams?: ModelParams,
 *   systemPromptType?: string,
 *   customSystemPrompt?: string
 * }
 * Response: { text: string, language: string }
 * 
 * Requires authenticated user (handled by middleware)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      message, 
      additionalParams, 
      systemPromptType, 
      customSystemPrompt 
    } = body;
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Determine which OpenRouter instance to use based on the prompt type
    let openRouter = defaultOpenRouter;
    
    if (systemPromptType && SYSTEM_PROMPTS[systemPromptType as keyof typeof SYSTEM_PROMPTS]) {
      // Use a predefined system prompt
      openRouter = createOpenRouterService(SYSTEM_PROMPTS[systemPromptType as keyof typeof SYSTEM_PROMPTS]);
    } else if (customSystemPrompt && typeof customSystemPrompt === 'string') {
      // Use a custom system prompt
      openRouter = createOpenRouterService(customSystemPrompt);
    }
    
    // Send message to OpenRouter
    const response = await openRouter.sendMessage(message, additionalParams as ModelParams);
    
    // Parse response
    const parsedResponse = openRouter.parseResponse(response);
    
    // Return the response
    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    // Handle errors
    console.error('OpenRouter API error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: error.message.includes('not properly initialized') ? 503 : 
                error.message.includes('Invalid API key') ? 401 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 