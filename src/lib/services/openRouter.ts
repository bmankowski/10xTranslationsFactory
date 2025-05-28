/**
 * OpenRouter service for the 10xTranslationsFactory
 * This service integrates with OpenRouter API to provide LLM-based chat functionality
 */

import type {
  OpenRouterConfig,
  ModelParams,
  RequestPayload,
  Message,
  ResponseFormat,
  TextResponse,
} from "./openRouterTypes";
import {
  TextWithQuestionsResponseSchema,
  AnswerVerificationResponseSchema,
  TextResponseSchema,
} from "./openRouterTypes";

// Define OpenRouter API response structure
interface OpenRouterApiResponse {
  choices: {
    message: {
      content: string | object;
    };
  }[];
}

/**
 * OpenRouter service implementation
 */
export class OpenRouterService<T = TextResponse> {
  // Private config storage
  private _config: OpenRouterConfig;

  // Private operational fields
  private _retryLimit = 3;
  private _timeoutDuration = 30000; // 30 seconds

  /**
   * Constructor
   * @param config Optional initial configuration
   */
  constructor(config: OpenRouterConfig) {
    // Initialize with default config
    this._config = {
      apiEndpoint: config.apiEndpoint,
      apiKey: config.apiKey,
      defaultModelParams: config?.defaultModelParams || {
        temperature: 0.7,
        max_tokens: 400,
        top_p: 1,
        frequency_penalty: 0,
      },
      defaultModel: config?.defaultModel || "openai/gpt-4o-mini",
    };

    // If config was provided with required fields, initialize automatically
    if (config?.apiKey && config?.apiEndpoint) {
      this.initService(config);
    }
  }

  // Property getters
  public get apiEndpoint(): string {
    return this._config.apiEndpoint;
  }
  public get apiKey(): string {
    return this._config.apiKey;
  }
  public get defaultModelParams(): ModelParams {
    return this._config.defaultModelParams || {};
  }
  public get defaultModel(): string {
    return this._config.defaultModel || "openai/gpt-4o-mini";
  }

  // Response format is not part of config
  public responseFormat: ResponseFormat;

  /**
   * Create a new instance of OpenRouterService with a specific configuration
   * @param config Configuration for the OpenRouter service
   * @returns New OpenRouterService instance
   */
  public static createInstance<R>(config: OpenRouterConfig): OpenRouterService<R> {
    return new OpenRouterService<R>(config);
  }

  /**
   * Initialize the service with configuration
   * @param config Configuration for the OpenRouter service
   */
  public initService(config: OpenRouterConfig): void {
    // Check for required configuration
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    if (!config.apiEndpoint) {
      throw new Error("OpenRouter API endpoint is required");
    }

    // Set the configuration
    this._config = {
      ...this._config,
      ...config,
    };
  }

  /**
   * Send a message to the OpenRouter API
   * @param userMessage User message content
   * @param systemMessage Optional system message
   * @param additionalParams Optional additional model parameters
   * @returns Promise with the API response
   */
  public async sendMessage(userMessage: string, systemMessage: string, additionalParams?: ModelParams): Promise<T> {
    // Validate input
    if (!userMessage || userMessage.trim() === "") {
      throw new Error("User message cannot be empty");
    }

    if (!this.apiKey || !this.apiEndpoint) {
      throw new Error("OpenRouter service not properly initialized. Call initService first.");
    }

    // Build the request payload with the provided system message or default
    const payload = this._buildRequestPayload(userMessage, systemMessage, additionalParams);

    // Perform API call
    const response = await this._performApiCall(payload);

    // Parse the response to the expected type
    return this.parseResponse(response);
  }

  /**
   * Parse and validate API response
   * @param response Raw API response
   * @returns Parsed and validated response
   */
  public parseResponse(response: OpenRouterApiResponse): T {
    // First, check if we have a valid response with choices
    if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
      throw new Error("Invalid response structure from OpenRouter API");
    }

    const choice = response.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new Error("Invalid message content in OpenRouter response");
    }

    const content = choice.message.content;

    try {
      // If content is a string and looks like JSON, try to parse it
      if (typeof content === "string" && (content.trim().startsWith("{") || content.trim().startsWith("["))) {
        try {
          const parsed = JSON.parse(content);

          // Implement dynamic schema selection based on response structure or expected type
          // Default to TextResponseSchema if no specific schema can be determined
          try {
            // If TextWithQuestionsResponse - has text, language and questions array
            if (parsed.text && parsed.language_code && Array.isArray(parsed.questions)) {
              const validated = TextWithQuestionsResponseSchema.parse(parsed);
              return validated as unknown as T;
            }

            // If AnswerVerificationResponse - has correct boolean and feedback
            if (typeof parsed.correct === "boolean" && parsed.feedback) {
              const validated = AnswerVerificationResponseSchema.parse(parsed);
              return validated as unknown as T;
            }

            // Default case - use TextResponseSchema
            const validated = TextResponseSchema.parse(parsed);
            return validated as unknown as T;
          } catch {
            // If validation fails, return the parsed content as is
            return parsed as T;
          }
        } catch {
          // Not valid JSON, will fall back to other handling
        }
      }

      // If content is already an object, return it directly
      if (typeof content === "object" && content !== null) {
        return content as T;
      }

      // For simple TextResponse type, if content is string, convert to expected structure
      if (typeof content === "string") {
        return TextResponseSchema.parse({
          text: content,
          language: "en", // Default to English for plain text responses
        }) as unknown as T;
      }

      throw new Error("Unable to extract expected response format from OpenRouter response");
    } catch (err) {
      throw new Error(`Failed to parse OpenRouter API response to expected format: ${String(err)}`);
    }
  }

  /**
   * Build a request payload
   * @param userMessage User message content
   * @param systemMessage Optional system message
   * @param additionalParams Optional additional model parameters
   * @returns Complete request payload
   */
  private _buildRequestPayload(
    userMessage: string,
    systemMessage: string,
    additionalParams?: ModelParams
  ): RequestPayload {
    // Create messages array with system and user messages
    const messages: Message[] = [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    // Build the payload by combining default params with additional params
    const payload: RequestPayload = {
      messages,
      model: this.defaultModel,
      response_format: this.responseFormat,
      ...this.defaultModelParams,
      ...additionalParams,
    };

    return payload;
  }

  /**
   * Perform the API call with retry logic
   * @param payload Request payload
   * @returns API response
   */
  private async _performApiCall(payload: RequestPayload): Promise<OpenRouterApiResponse> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this._retryLimit) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeoutDuration);

        // Perform the fetch request
        const response = await fetch(this.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        // Clear the timeout
        clearTimeout(timeoutId);

        // Check for successful response
        if (!response.ok) {
          const errorData = await responseData.catch(() => ({
            message: `HTTP error! status: ${response.status}`,
          }));

          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Parse and return the response
        return responseData;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on authentication errors or user errors
        if (lastError.message.includes("401") || lastError.message.includes("400")) {
          break;
        }

        // Increment retry count and wait before retrying
        retryCount++;
        if (retryCount < this._retryLimit) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const backoffTime = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    // If we got here, all retries failed
    throw lastError || new Error("Failed to call OpenRouter API after multiple retries");
  }
}
