import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    apiKey: import.meta.env.OPENROUTER_API_KEY ? 'Set (hidden for security)' : 'Not set',
    apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT || 'Using default',
    nodeEnv: process.env.NODE_ENV || 'Not set'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}; 