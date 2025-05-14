import { OpenRouterService } from './services/openRouter';
import type { OpenRouterConfig } from './services/openRouterTypes';

/**
 * OpenRouter service factory for the application
 * This factory creates instances of OpenRouter service with different system prompts
 */

// Default configuration for OpenRouter API
const DEFAULT_CONFIG: Partial<OpenRouterConfig> = {
  apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: import.meta.env.OPENROUTER_API_KEY || '',
  defaultModel: 'o3-mini'
};

// Available system prompts for different use cases
export const SYSTEM_PROMPTS = {
  GENERAL: 'System: Wsparcie czatu za pomocą OpenRouter',
  TRANSLATION_ASSISTANT: 'System: Jestem asystentem tłumaczeniowym. Pomogę w tłumaczeniu tekstów, wyjaśnianiu kontekstu kulturowego i znajdowaniu odpowiednich określeń w języku docelowym.',
  LANGUAGE_TEACHER: 'System: Jestem nauczycielem języka. Pomogę w nauce gramatyki, słownictwa, wymowy i poprawię błędy językowe.',
  EXERCISE_GENERATOR: 'System: Jestem generatorem ćwiczeń językowych. Tworzę różnorodne ćwiczenia dostosowane do poziomu zaawansowania ucznia.'
};

/**
 * Creates an OpenRouter service instance with a specific system prompt
 * @param systemPrompt System prompt to use
 * @param customConfig Optional custom configuration
 * @returns OpenRouter service instance
 */
export function createOpenRouterService(
  systemPrompt: string = SYSTEM_PROMPTS.GENERAL,
  customConfig: Partial<OpenRouterConfig> = {}
): OpenRouterService {
  // Combine default config with custom config and system prompt
  const config: OpenRouterConfig = {
    apiEndpoint: customConfig.apiEndpoint || DEFAULT_CONFIG.apiEndpoint || '',
    apiKey: customConfig.apiKey || DEFAULT_CONFIG.apiKey || '',
    defaultModel: customConfig.defaultModel || DEFAULT_CONFIG.defaultModel || 'o3-mini',
    defaultModelParams: customConfig.defaultModelParams || DEFAULT_CONFIG.defaultModelParams,
    systemMessage: systemPrompt
  };
  
  // Validate required configuration
  if (!config.apiKey) {
    console.warn('OpenRouter API key is not set. Service will not function properly.');
  }
  
  // Create and return a new instance
  return new OpenRouterService(config);
}

// For backward compatibility and simple use cases, export a default instance
export default createOpenRouterService(SYSTEM_PROMPTS.GENERAL); 