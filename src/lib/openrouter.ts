import { OpenRouterService } from './services/openRouter';
import type { 
  OpenRouterConfig, 
  TextResponse, 
  TextWithQuestionsResponse, 
  AnswerVerificationResponse
} from './services/openRouterTypes';
import { getTextResponseFormat, getTextWithQuestionsResponseFormat, getAnswerVerificationResponseFormat } from './services/openRouterTypes';

/**
 * OpenRouter service factory for the application
 * This factory creates instances of OpenRouter service with different system prompts
 * and response formats for different use cases
 */

// Define templates for dynamic system prompts
export const PROMPT_TEMPLATES = {
  GENERAL: 'Jestem przyjaznym asystentem, który pomaga w rozwiązywaniu problemów i odpowiada na pytania.',
  LANGUAGE_TEACHER: 'System: Jestem nauczycielem języka ${language} (${languageCode}). Pomogę w nauce gramatyki, słownictwa, wymowy i poprawię błędy językowe dla poziomu ${proficiencyLevel}.',
  EXERCISE_GENERATOR: 'System: Jestem generatorem ćwiczeń językowych dla języka ${language}. Tworzę różnorodne ćwiczenia dostosowane do poziomu ${proficiencyLevel} ucznia.'
};

// Default configuration for OpenRouter API
const DEFAULT_CONFIG: OpenRouterConfig = {
  apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT ,
  apiKey: import.meta.env.OPENROUTER_API_KEY ,
  defaultModel: 'openai/gpt-4o-mini'
};


// Export type-specific instances when needed
export function getAnswerVerificationService(): OpenRouterService<AnswerVerificationResponse> {
  const service = new OpenRouterService<AnswerVerificationResponse>(DEFAULT_CONFIG);
  service.responseFormat = getAnswerVerificationResponseFormat();
  return service;
}

// Create an OpenRouter service for simple text responses
export function createTextOpenRouterService(
  customConfig: Partial<OpenRouterConfig<TextResponse>> = {}
): OpenRouterService<TextResponse> {
  return new OpenRouterService<TextResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getTextResponseFormat()
  });
}

// Create an OpenRouter service for text with questions generation
export function createTextWithQuestionsOpenRouterService(
  systemPrompt: string = PROMPT_TEMPLATES.EXERCISE_GENERATOR,
): OpenRouterService<TextWithQuestionsResponse> {
  return new OpenRouterService<TextWithQuestionsResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getTextWithQuestionsResponseFormat()
  });
}

// Create an OpenRouter service for answer verification
export function createAnswerVerificationOpenRouterService(
  systemPrompt: string = PROMPT_TEMPLATES.LANGUAGE_TEACHER,
): OpenRouterService<AnswerVerificationResponse> {
  return new OpenRouterService<AnswerVerificationResponse>({
    ...DEFAULT_CONFIG,
    responseFormat: getAnswerVerificationResponseFormat()
  });
} 