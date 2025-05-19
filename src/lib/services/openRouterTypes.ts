/**
 * Type definitions for OpenRouter service
 * Using Zod for schema validation and type generation
 */

import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// -------------------- Zod Schemas --------------------

// Message schema
export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

// Response Format schema - using a simplified format that matches OpenRouter's expectations
export const ResponseFormatSchema = z.object({
  type: z.string().optional(),
  json_schema: z.object({
    name: z.string().optional(),
    strict: z.boolean().optional(),
    schema: z.record(z.any()).optional()
  }).optional()
}).optional();

// Model Parameters schema
export const ModelParamsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
  response_format: ResponseFormatSchema.optional()
}).optional();

// OpenRouter Configuration schema
export const OpenRouterConfigSchema = z.object({
  apiKey: z.string(),
  apiEndpoint: z.string().url(),
  defaultModelParams: ModelParamsSchema.optional(),
  systemMessage: z.string().optional(),
  defaultModel: z.string().optional(),
  responseFormat: ResponseFormatSchema.optional()
});

// Request Payload schema
export const RequestPayloadSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string(),
  response_format: ResponseFormatSchema.optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional()
});

// Response schemas for different types of responses
export const TextResponseSchema = z.object({
  text: z.string(),
  language_code: z.string().optional().default('en')
});

export const TextWithQuestionsResponseSchema = z.object({
  text: z.string(),
  language_code: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string().optional()
  }))
});

export const AnswerVerificationResponseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string()
});

// -------------------- Generated TypeScript Types --------------------

export type Message = z.infer<typeof MessageSchema>;
export type ResponseFormat<T = any> = z.infer<typeof ResponseFormatSchema>;
export type ModelParams = z.infer<typeof ModelParamsSchema>;
export type OpenRouterConfig<T = any> = z.infer<typeof OpenRouterConfigSchema>;
export type RequestPayload<T = any> = z.infer<typeof RequestPayloadSchema>;
export type TextResponse = z.infer<typeof TextResponseSchema>;
export type TextWithQuestionsResponse = z.infer<typeof TextWithQuestionsResponseSchema>;
export type AnswerVerificationResponse = z.infer<typeof AnswerVerificationResponseSchema>;

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