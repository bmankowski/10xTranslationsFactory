import { OpenRouterService } from './services/openRouter';
import type { 
  OpenRouterConfig, 
  TextResponse, 
  TextWithQuestionsResponse, 
  AnswerVerificationResponse,
  ResponseFormat
} from './services/openRouterTypes';
import { ResponseFormats } from './services/openRouterTypes';

/**
 * OpenRouter service factory for the application
 * This factory creates instances of OpenRouter service with different system prompts
 * and response formats for different use cases
 */

// Default configuration for OpenRouter API
const DEFAULT_CONFIG: Partial<OpenRouterConfig> = {
  apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: import.meta.env.OPENROUTER_API_KEY || '',
  defaultModel: 'openai/gpt-4o-mini'
};

// Available system prompts for different use cases
export const SYSTEM_PROMPTS = {
  GENERAL: 'Jestem przyjaznym asystentem, który pomaga w rozwiązywaniu problemów i odpowiada na pytania.',
  LANGUAGE_TEACHER: 'System: Jestem nauczycielem języka. Pomogę w nauce gramatyki, słownictwa, wymowy i poprawię błędy językowe.',
  EXERCISE_GENERATOR: 'System: Jestem generatorem ćwiczeń językowych. Tworzę różnorodne ćwiczenia dostosowane do poziomu zaawansowania ucznia.'
};

/**
 * Creates an OpenRouter service instance with a specific system prompt and response format
 * @param systemPrompt System prompt to use
 * @param customConfig Optional custom configuration
 * @returns OpenRouter service instance
 */
export function createOpenRouterService<T = TextResponse>(
  systemPrompt: string = SYSTEM_PROMPTS.GENERAL,
  customConfig: Partial<OpenRouterConfig<T>> = {}
): OpenRouterService<T> {
  // Combine default config with custom config and system prompt
  const config: OpenRouterConfig<T> = {
    apiEndpoint: customConfig.apiEndpoint || DEFAULT_CONFIG.apiEndpoint || '',
    apiKey: customConfig.apiKey || DEFAULT_CONFIG.apiKey || '',
    defaultModel: customConfig.defaultModel || DEFAULT_CONFIG.defaultModel || 'openai/gpt-4o-mini',
    defaultModelParams: customConfig.defaultModelParams || DEFAULT_CONFIG.defaultModelParams,
    systemMessage: systemPrompt,
    responseFormat: customConfig.responseFormat
  };
  
  // Validate required configuration
  if (!config.apiKey) {
    console.warn('OpenRouter API key is not set. Service will not function properly.');
  }
  
  // Create and return a new instance
  return new OpenRouterService<T>(config);
}

/**
 * Convenience factories for specific use cases with appropriate response formats
 */

// Create an OpenRouter service for simple text responses
export function createTextOpenRouterService(
  systemPrompt: string = SYSTEM_PROMPTS.GENERAL,
  customConfig: Partial<OpenRouterConfig<TextResponse>> = {}
): OpenRouterService<TextResponse> {
  return createOpenRouterService<TextResponse>(
    systemPrompt,
    { 
      ...customConfig,
      responseFormat: ResponseFormats.TEXT 
    }
  );
}

// Create an OpenRouter service for text with questions generation
export function createTextWithQuestionsOpenRouterService(
  systemPrompt: string = SYSTEM_PROMPTS.EXERCISE_GENERATOR,
  customConfig: Partial<OpenRouterConfig<TextWithQuestionsResponse>> = {}
): OpenRouterService<TextWithQuestionsResponse> {
  return createOpenRouterService<TextWithQuestionsResponse>(
    systemPrompt,
    { 
      ...customConfig,
      responseFormat: ResponseFormats.TEXT_WITH_QUESTIONS 
    }
  );
}

// Create an OpenRouter service for answer verification
export function createAnswerVerificationOpenRouterService(
  systemPrompt: string = SYSTEM_PROMPTS.LANGUAGE_TEACHER,
  customConfig: Partial<OpenRouterConfig<AnswerVerificationResponse>> = {}
): OpenRouterService<AnswerVerificationResponse> {
  return createOpenRouterService<AnswerVerificationResponse>(
    systemPrompt,
    { 
      ...customConfig,
      responseFormat: ResponseFormats.ANSWER_VERIFICATION 
    }
  );
}

// For backward compatibility and simple use cases, export a default instance
export default createTextOpenRouterService(SYSTEM_PROMPTS.GENERAL); 