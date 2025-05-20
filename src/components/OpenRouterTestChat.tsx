import { useState } from 'react';
import { SYSTEM_PROMPTS } from '../lib/openrouter';
import { AnswerVerificationResponseSchema, TextResponseSchema } from '../lib/services/openRouterTypes';
import type { TextResponse } from '../lib/services/openRouterTypes';
import { getAnswerVerificationResponseFormat, getTextResponseFormat } from '../lib/services/openRouterTypes';

// Use TextResponse type directly from openRouterTypes.ts

// Component to display simple text response
function ResponseDisplay({ responseData }: { responseData: TextResponse | null }) {
  console.log('ResponseDisplay received:', responseData);
  
  if (!responseData) {
    return null;
  }

  try {
    // Check for various possible response formats
    if (responseData.text) {
      return (
        <div>
          <p>{responseData.text}</p>
          <p className="mt-2 text-sm text-gray-600">
            Language: {responseData.language_of_response || 'Not specified'}
          </p>
          {responseData.arithmetical_value !== undefined && responseData.arithmetical_value !== null && (
            <p className="mt-2 text-sm text-gray-600">
              Value: {responseData.arithmetical_value}
            </p>
          )}
        </div>
      );
    }
    
    // If we got here, the response doesn't match the expected structure
    return (
      <div>
        <p className="text-amber-600 mb-2">Response structure doesn't match expected format:</p>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(responseData, null, 2)}
        </pre>
      </div>
    );
  } catch (err) {
    console.error('Error rendering response:', err);
    return (
      <div className="text-red-600">
        Error rendering response: {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    );
  }
}

export default function OpenRouterTestChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<TextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending request:', {
        message: message
      });
      
      // Create zod response format
      const responseFormat = getTextResponseFormat();
      // Using real OpenRouter endpoint
      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          additionalParams: {
            temperature: 0.7,
            max_tokens: 500,
            response_format: responseFormat
          },
          systemPromptType: 'GENERAL',
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Received data:', data);
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(data, null, 2));
      
      // Validate the response against our schema
      const validatedResponse = TextResponseSchema.parse(data);
      
      // The real endpoint returns the data directly
      console.log('Setting response:', validatedResponse);
      setResponse(validatedResponse);
    } catch (err) {
      console.error('Caught error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">OpenRouter Chat</h2>
      
      <form onSubmit={sendMessage}>
        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 font-medium">
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Type your message here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Show debug info</span>
          </label>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h3 className="font-bold">Response:</h3>
          <div className="mt-2 p-3 bg-gray-100 rounded">
            <ResponseDisplay responseData={response} />
          </div>
        </div>
      )}
      
      {showDebug && rawResponse && (
        <div className="mt-4">
          <h3 className="font-bold">Raw API Response (Debug):</h3>
          <pre className="mt-2 p-3 bg-gray-800 text-white rounded text-xs overflow-auto">
            {rawResponse}
          </pre>
        </div>
      )}
    </div>
  );
} 