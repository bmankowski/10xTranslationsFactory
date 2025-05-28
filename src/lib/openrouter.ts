import { OpenRouterService } from "./services/openRouter";
import type {
  OpenRouterConfig,
  TextResponse,
  TextWithQuestionsResponse,
  AnswerVerificationResponse,
} from "./services/openRouterTypes";
import {
  getTextResponseFormat,
  getTextWithQuestionsResponseFormat,
  getAnswerVerificationResponseFormat,
} from "./services/openRouterTypes";

/**
 * OpenRouter service factory for the application
 * This factory creates instances of OpenRouter service with different system prompts
 * and response formats for different use cases
 */

// Default configuration for OpenRouter API
const DEFAULT_CONFIG: OpenRouterConfig = {
  apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT,
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini",
};

// Export type-specific instances when needed
export function getAnswerVerificationService(): OpenRouterService<AnswerVerificationResponse> {
  const service = new OpenRouterService<AnswerVerificationResponse>(DEFAULT_CONFIG);
  service.responseFormat = getAnswerVerificationResponseFormat();
  return service;
}

// Create an OpenRouter service for simple text responses
export function createTextOpenRouterService(): OpenRouterService<TextResponse> {
  return new OpenRouterService<TextResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getTextResponseFormat(),
  });
}

// Create an OpenRouter service for text with questions generation
export function createTextWithQuestionsOpenRouterService(): OpenRouterService<TextWithQuestionsResponse> {
  return new OpenRouterService<TextWithQuestionsResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getTextWithQuestionsResponseFormat(),
  });
}

// Create an OpenRouter service for answer verification
export function createAnswerVerificationOpenRouterService(): OpenRouterService<AnswerVerificationResponse> {
  return new OpenRouterService<AnswerVerificationResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getAnswerVerificationResponseFormat(),
  });
}
