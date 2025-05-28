/**
 * Type definitions for OpenRouter service
 * Using Zod for schema validation and type generation
 */

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// -------------------- Zod Schemas --------------------

// Message schema
export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

// Response Format schema - using a simplified format that matches OpenRouter's expectations
export const ResponseFormatSchema = z
  .object({
    type: z.string().optional(),
    json_schema: z
      .object({
        name: z.string().optional(),
        strict: z.boolean().optional(),
        schema: z.record(z.unknown()).optional(),
      })
      .optional(),
  })
  .optional();

// Model Parameters schema
export const ModelParamsSchema = z
  .object({
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().positive().optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    response_format: ResponseFormatSchema.optional(),
  })
  .optional();

// OpenRouter Configuration schema
export const OpenRouterConfigSchema = z.object({
  apiKey: z.string(),
  apiEndpoint: z.string().url(),
  defaultModelParams: ModelParamsSchema.optional(),
  defaultModel: z.string().optional(),
  responseFormat: ResponseFormatSchema,
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
  presence_penalty: z.number().optional(),
});

// Response schemas for different types of responses
export const TextResponseSchema = z.object({
  text: z.string().describe("The generated text response"),
  arithmetical_value: z.number().nullish().describe("The arithmetical value of the generated text if any"),
  language_of_response: z.string().describe("The language of the generated text").nullish(),
});

export const TextWithQuestionsResponseSchema = z.object({
  text: z.string().describe("The generated text response"),
  language_code: z.string().describe("The language of the generated text"),
  questions: z.array(
    z.object({
      question: z.string().describe("The question"),
    })
  ),
});

export const AnswerVerificationResponseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
});

// -------------------- Generated TypeScript Types --------------------

export type Message = z.infer<typeof MessageSchema>;
export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;
export type ModelParams = z.infer<typeof ModelParamsSchema>;
export type OpenRouterConfig = z.infer<typeof OpenRouterConfigSchema>;
export type RequestPayload = z.infer<typeof RequestPayloadSchema>;
export type TextResponse = z.infer<typeof TextResponseSchema>;
export type TextWithQuestionsResponse = z.infer<typeof TextWithQuestionsResponseSchema>;
export type AnswerVerificationResponse = z.infer<typeof AnswerVerificationResponseSchema>;

/**
 * Helper function to create a response format from a Zod schema
 * @param schema Zod schema to use for validation
 * @param name Name of the schema
 * @returns ResponseFormat compatible with OpenRouter
 */
export function createZodResponseFormat<T>(schema: z.ZodType<T>, name = "zod_response"): ResponseFormat {
  return zodResponseFormat(schema, name) as ResponseFormat;
}

// Use these functions to get response formats for OpenRouter API
export function getTextResponseFormat() {
  return createZodResponseFormat(TextResponseSchema, "text_response");
}

export function getTextWithQuestionsResponseFormat() {
  return createZodResponseFormat(TextWithQuestionsResponseSchema, "text_with_questions");
}

export function getAnswerVerificationResponseFormat() {
  return createZodResponseFormat(AnswerVerificationResponseSchema, "answer_verification");
}
