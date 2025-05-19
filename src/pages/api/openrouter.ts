import type { APIRoute } from 'astro';
import defaultOpenRouter, { createOpenRouterService, SYSTEM_PROMPTS } from '../../lib/openrouter';
import type { ModelParams, ResponseFormat } from '../../lib/services/openRouterTypes';
import { getAnswerVerificationResponseFormat, getTextResponseFormat, getTextWithQuestionsResponseFormat } from '../../lib/services/openRouterTypes';

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
 * Response: { text: string, language_of_response: string }
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
      // Use a predefined system prompt with optional custom response format
      openRouter = createOpenRouterService(
        SYSTEM_PROMPTS[systemPromptType as keyof typeof SYSTEM_PROMPTS],
        { responseFormat: additionalParams.response_format }
      );
    } else if (customSystemPrompt && typeof customSystemPrompt === 'string') {
      // Use a custom system prompt with optional custom response format
      openRouter = createOpenRouterService(
        customSystemPrompt,
        { responseFormat: additionalParams.response_format }
      );
    } else if (additionalParams.response_format) {
      // Just use default prompt with custom response format
      openRouter = createOpenRouterService(
        SYSTEM_PROMPTS.GENERAL,
        { responseFormat: additionalParams.response_format }
      );
    }
    // Default response format if not specified in the request params
    const defaultResponseFormat = getAnswerVerificationResponseFormat();
    

    console.log('Using response format:', JSON.stringify(additionalParams.response_format));
    console.log('Could use this response format:', JSON.stringify(getTextResponseFormat()));
    
    
    
    // Prepare parameters with response format
    const params = {
      ...additionalParams,
      response_format:  defaultResponseFormat
    };
    
    console.log('Using response format:', JSON.stringify(params.response_format || defaultResponseFormat));
    
    // Send message to OpenRouter
    const response = await openRouter.sendMessage(message, params);
    
    // For debugging, log the raw response before parsing
    console.log('Raw OpenRouter response before parsing:', JSON.stringify(response, null, 2));
    
    // Check if the response is already parsed (doesn't have choices array)
    let parsedResponse;
    if (response && typeof response === 'object' && !('choices' in response)) {
      // Response is already parsed (probably by the sendMessage method)
      console.log('Response is already parsed, using as-is');
      parsedResponse = response;
    } else {
      // Use the parseResponse method to process the API response
      parsedResponse = openRouter.parseResponse(response);
    }
    
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