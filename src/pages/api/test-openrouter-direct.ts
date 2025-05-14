import type { APIRoute } from 'astro';

/**
 * Direct test endpoint for OpenRouter API
 * This is a debugging endpoint that directly calls the OpenRouter API with minimal processing
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message = "Hello world", systemPrompt = "You are a helpful assistant" } = body;
    
    console.log('Direct OpenRouter test with message:', message);
    
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    const apiEndpoint = import.meta.env.OPENROUTER_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }
    
    console.log('Using API endpoint:', apiEndpoint);
    
    // Simple payload with JSON response format
    const payload = {
      messages: [
        {
          role: 'system',
          content: systemPrompt + ' Please provide your response in JSON format.'
        },
        {
          role: 'user',
          content: message + ' (respond in json)'
        }
      ],
      model: 'openai/gpt-4o-mini', // Using a basic model for testing
      response_format: {
        type: "json_object",
        schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            language: { type: "string" }
          },
          required: ["text", "language"]
        }
      },
      temperature: 0.7,
      max_tokens: 200
    };
    
    console.log('Sending payload:', JSON.stringify(payload));
    
    // Make direct API call
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://10xtranslationsfactory.com',
        'X-Title': '10x Translations Factory - Test'
      },
      body: JSON.stringify(payload)
    });
    
    // Log response status
    console.log('Response status:', response.status);
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error response:', errorText);
      return new Response(JSON.stringify({ error: `API error: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse and return the full response
    const responseData = await response.json();
    console.log('OpenRouter raw response:', JSON.stringify(responseData));
    
    return new Response(JSON.stringify({
      success: true,
      rawResponse: responseData,
      // Extract the content for convenience
      content: responseData.choices?.[0]?.message?.content || 'No content found'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 