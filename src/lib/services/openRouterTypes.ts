/**
 * Type definitions for OpenRouter service
 */

import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export interface OpenRouterConfig<T = any> {
  apiKey: string;
  apiEndpoint: string;
  defaultModelParams?: ModelParams;
  systemMessage?: string;
  defaultModel?: string;
  responseFormat?: ResponseFormat<T>;
}

export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: ResponseFormat<any>;
}

export interface RequestPayload<T = any> {
  messages: Message[];
  model: string;
  response_format?: ResponseFormat<T>;
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

export interface ResponseFormat<T = any> {
  // type: "json_schema";
  // json_schema: {
  //   name: string;
  //   strict: boolean;
  //   schema: {
  //     type: string;
  //     properties: Record<string, any>;
  //     required?: string[];
  //     additionalProperties?: boolean;
  //   } | Record<string, unknown>;
  // };
}

// Simple text response
export interface TextResponse {
  text: string;
}

// Response for text with generated questions
export interface TextWithQuestionsResponse {
  text: string;
  language: string;
  questions: Array<{
    question: string;
    options?: string[];
    answer?: string;
  }>;
}

// Response for answer verification
export interface AnswerVerificationResponse {
  correct: boolean;
  feedback: string;
}

/**
 * Helper function to create a response format from a Zod schema
 * @param schema Zod schema to use for validation
 * @param name Name of the schema
 * @returns ResponseFormat compatible with OpenRouter
 */
export function createZodResponseFormat<T>(schema: z.ZodType<T>, name: string = 'zod_response'): ResponseFormat<T> {
  return zodResponseFormat(schema, name) as ResponseFormat<T>;
}

// Predefined response formats
export const ResponseFormats = {
  // Simple text response format
  TEXT: {
    type: "json_schema",
    json_schema: {
      name: "text_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"],
        additionalProperties: false
      }
    }
  } as ResponseFormat<TextResponse>,

  // Text with questions format
  TEXT_WITH_QUESTIONS: {
    type: "json_schema",
    json_schema: {
      name: "text_with_questions",
      strict: true,
      schema: {
        type: "object",
        properties: {
          text: { type: "string" },
          language: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { 
                  type: "array",
                  items: { type: "string" } 
                },
                answer: { type: "string" }
              },
              required: ["question"]
            }
          }
        },
        required: ["text", "language", "questions"],
        additionalProperties: false
      }
    }
  } as ResponseFormat<TextWithQuestionsResponse>,

  // Answer verification format
  ANSWER_VERIFICATION: {
    type: "json_schema",
    json_schema: {
      name: "answer_verification",
      strict: true,
      schema: {
        type: "object",
        properties: {
          correct: { type: "boolean" },
          feedback: { type: "string" }
        },
        required: ["correct", "feedback"],
        additionalProperties: false
      }
    }
  } as ResponseFormat<AnswerVerificationResponse>
}; 