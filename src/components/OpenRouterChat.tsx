import { useState } from 'react';
import { SYSTEM_PROMPTS } from '../lib/openrouter';
import type { ModelParams } from '../lib/services/openRouterTypes';

interface ChatResponse {
  text: string;
  language: string;
}

export default function OpenRouterChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptType, setPromptType] = useState<string>('GENERAL');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request body
      const requestBody: {
        message: string;
        additionalParams?: ModelParams;
        systemPromptType?: string;
        customSystemPrompt?: string;
      } = { message };
      
      // Add system prompt information
      if (useCustomPrompt && customPrompt) {
        requestBody.customSystemPrompt = customPrompt;
      } else {
        requestBody.systemPromptType = promptType;
      }
      
      // Call the API
      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">OpenRouter Chat</h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="useCustomPrompt"
            checked={useCustomPrompt}
            onChange={(e) => setUseCustomPrompt(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="useCustomPrompt">Use custom system prompt</label>
        </div>
        
        {useCustomPrompt ? (
          <div className="mb-4">
            <label htmlFor="customPrompt" className="block mb-1 font-medium">
              Custom System Prompt
            </label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Enter custom system prompt..."
            />
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="promptType" className="block mb-1 font-medium">
              System Prompt Type
            </label>
            <select
              id="promptType"
              value={promptType}
              onChange={(e) => setPromptType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {Object.keys(SYSTEM_PROMPTS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
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
          {loading ? 'Sending...' : 'Send Message'}
        </button>
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
            <p>{response.text}</p>
            <p className="mt-2 text-sm text-gray-600">
              Language: {response.language}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 