/**
 * Type definitions for OpenRouter service
 */

export interface OpenRouterConfig {
  apiKey: string;
  apiEndpoint: string;
  defaultModelParams?: ModelParams;
  systemMessage?: string;
  defaultModel?: string;
}

export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface RequestPayload {
  messages: Message[];
  model: string;
  response_format: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResponseFormat {
  type: string;
  json_schema?: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  };
}

export interface ParsedResponse {
  text: string;
  language: string;
} 