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
    TextResponse
} from './openRouterTypes';
import { 
    TextWithQuestionsResponseSchema,
    AnswerVerificationResponseSchema,
    TextResponseSchema 
} from './openRouterTypes';


/**
 * OpenRouter service implementation
 */
export class OpenRouterService<T = TextResponse> {
    // Private config storage
    private _config: OpenRouterConfig<T>;

    // Private operational fields
    private _retryLimit: number = 3;
    private _timeoutDuration: number = 30000; // 30 seconds

    /**
     * Constructor
     * @param config Optional initial configuration
     */
    constructor(config?: Partial<OpenRouterConfig<T>>) {
        // Initialize with default config
        this._config = {
            apiEndpoint: config?.apiEndpoint || 'https://openrouter.ai/api/v1/chat/completions',
            apiKey: config?.apiKey || '',
            defaultModelParams: config?.defaultModelParams || {
                temperature: 0.7,
                max_tokens: 400,
                top_p: 1,
                frequency_penalty: 0
            },
            systemMessage: config?.systemMessage || 'System: Wsparcie czatu za pomocą OpenRouter',
            defaultModel: config?.defaultModel || 'openai/gpt-4o-mini'
        };

        // Initialize default response format if not provided in config
        this.responseFormat = config?.responseFormat || {
            type: "json_schema",
            json_schema: {
                name: "text_response",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        text: { type: "string" },
                        language: { type: "string" }
                    },
                    required: ["text", "language"],
                    additionalProperties: false
                }
            }
        } as ResponseFormat<T>;

        // If config was provided with required fields, initialize automatically
        if (config?.apiKey && config?.apiEndpoint) {
            this.initService(config as OpenRouterConfig<T>);
        }
    }

    // Property getters
    public get apiEndpoint(): string { return this._config.apiEndpoint; }
    public get apiKey(): string { return this._config.apiKey; }
    public get defaultModelParams(): ModelParams { return this._config.defaultModelParams || {}; }
    public get systemMessage(): string { return this._config.systemMessage || ''; }
    public get defaultModel(): string { return this._config.defaultModel || 'openai/gpt-4o-mini'; }

    // Response format is not part of config
    public responseFormat: ResponseFormat<T>;

    /**
     * Create a new instance of OpenRouterService with a specific configuration
     * @param config Configuration for the OpenRouter service
     * @returns New OpenRouterService instance
     */
    public static createInstance<R>(config: OpenRouterConfig<R>): OpenRouterService<R> {
        return new OpenRouterService<R>(config);
    }

    /**
     * Initialize the service with configuration
     * @param config Configuration for the OpenRouter service
     */
    public initService(config: OpenRouterConfig<T>): void {
        // Check for required configuration
        if (!config.apiKey) {
            throw new Error('OpenRouter API key is required');
        }

        if (!config.apiEndpoint) {
            throw new Error('OpenRouter API endpoint is required');
        }

        // Set the configuration
        this._config = {
            ...this._config,
            ...config
        };

        // Log service initialization (but don't expose the API key)
        console.info('OpenRouter service initialized with endpoint:', this.apiEndpoint);
    }

    /**
     * Send a message to the OpenRouter API
     * @param userMessage User message content
     * @param additionalParams Optional additional model parameters
     * @returns Promise with the API response
     */
    public async sendMessage(userMessage: string, additionalParams?: ModelParams): Promise<T> {
        // Validate input
        if (!userMessage || userMessage.trim() === '') {
            throw new Error('User message cannot be empty');
        }

        if (!this.apiKey || !this.apiEndpoint) {
            throw new Error('OpenRouter service not properly initialized. Call initService first.');
        }

        try {
            // Build the request payload
            const payload = this._buildRequestPayload(userMessage, additionalParams);

            // Perform API call
            const response = await this._performApiCall(payload);

            // Parse the response to the expected type
            return this.parseResponse(response);
        } catch (error) {
            // Handle errors
            this.handleError(error);
            throw error; // Re-throw to allow calling code to handle it as well
        }
    }

    /**
     * Parse and validate API response
     * @param response Raw API response
     * @returns Parsed and validated response
     */
    public parseResponse(response: any): T {
        console.log('OpenRouter.parseResponse received:', JSON.stringify(response));

        // First, check if we have a valid response with choices
        if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
            console.error('Invalid response structure:', response);
            throw new Error('Invalid response structure from OpenRouter API');
        }

        const choice = response.choices[0];
        if (!choice.message || !choice.message.content) {
            console.error('Invalid message content in choice:', choice);
            throw new Error('Invalid message content in OpenRouter response');
        }

        const content = choice.message.content;
        console.log('Content to parse:', typeof content, content?.substring?.(0, 100));

        try {
            // If content is a string and looks like JSON, try to parse it
            if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
                try {
                    const parsed = JSON.parse(content);
                    console.log('Successfully parsed JSON content:', parsed);
                    
                    // Implement dynamic schema selection based on response structure or expected type
                    // Default to TextResponseSchema if no specific schema can be determined
                    try {
                        // If TextWithQuestionsResponse - has text, language and questions array
                        if (parsed.text && parsed.language_code && Array.isArray(parsed.questions)) {
                            console.log('Detected TextWithQuestionsResponse structure');
                            const validated = TextWithQuestionsResponseSchema.parse(parsed);
                            return validated as unknown as T;
                        }
                        
                        // If AnswerVerificationResponse - has correct boolean and feedback
                        if (typeof parsed.correct === 'boolean' && parsed.feedback) {
                            console.log('Detected AnswerVerificationResponse structure');
                            const validated = AnswerVerificationResponseSchema.parse(parsed);
                            return validated as unknown as T;
                        }
                        
                        // Default case - use TextResponseSchema
                        console.log('Using default TextResponseSchema');
                        const validated = TextResponseSchema.parse(parsed);
                        return validated as unknown as T;
                    } catch (zodError) {
                        console.warn('Zod validation failed, returning parsed content:', zodError);
                        // If validation fails, return the parsed content as is
                        return parsed as T;
                    }
                } catch (parseError) {
                    // Not valid JSON, will fall back to other handling
                    console.warn('Failed to parse response as JSON:', parseError);
                }
            }

            // If content is already an object, return it directly
            if (typeof content === 'object' && content !== null) {
                console.log('Content is already an object, returning directly');
                return content as T;
            }

            // For simple TextResponse type, if content is string, convert to expected structure
            if (typeof content === 'string') {
                console.log('Converting string content to TextResponse');
                return TextResponseSchema.parse({
                    text: content,
                    language: 'en' // Default to English for plain text responses
                }) as unknown as T;
            }

            console.error('Unable to extract expected format:', content);
            throw new Error('Unable to extract expected response format from OpenRouter response');
        } catch (error) {
            this.handleError(error);
            throw new Error('Failed to parse OpenRouter API response to expected format');
        }
    }

    /**
     * Handle errors centrally
     * @param error Error to handle
     */
    public handleError(error: any): void {
        // Log the error
        console.error('OpenRouter API error:', error);

        // Categorize the error
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else if (error.message.includes('NetworkError')) {
            console.error('Network error occurred');
        } else if (error.message.includes('401')) {
            console.error('Authentication error: Invalid API key');
        } else {
            console.error('Unexpected error:', error.message);
        }
    }

    /**
     * Build a request payload
     * @param userMessage User message content
     * @param additionalParams Optional additional model parameters
     * @returns Complete request payload
     */
    private _buildRequestPayload(userMessage: string, additionalParams?: ModelParams): RequestPayload<T> {
        // Create messages array with system and user messages
        const messages: Message[] = [
            {
                role: 'system',
                content: this.systemMessage
            },
            {
                role: 'user',
                content: userMessage
            }
        ];

        // Build the payload by combining default params with additional params
        const payload: RequestPayload<T> = {
            messages,
            model: this.defaultModel,
            response_format: this.responseFormat,
            ...this.defaultModelParams,
            ...additionalParams
        };

        console.log('Built payload with response_format:', JSON.stringify(payload.response_format));

        return payload;
    }

    /**
     * Perform the API call with retry logic
     * @param payload Request payload
     * @returns API response
     */
    private async _performApiCall(payload: RequestPayload<T>): Promise<any> {
        let retryCount = 0;
        let lastError: Error | null = null;

        while (retryCount < this._retryLimit) {
            try {
                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this._timeoutDuration);

                // Perform the fetch request
                const response = await fetch(this.apiEndpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                  },
                  body: JSON.stringify(payload),
                });

                const responseData = await response.json();


                // Clear the timeout
                clearTimeout(timeoutId);

                // Check for successful response
                if (!response.ok) {
                    const errorData = await responseData.catch(() => ({
                        message: `HTTP error! status: ${response.status}`
                    }));

                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Parse and return the response
                return responseData;
            } catch (error: any) {
                lastError = error;

                // Don't retry on authentication errors or user errors
                if (error.message.includes('401') || error.message.includes('400')) {
                    break;
                }

                // Increment retry count and wait before retrying
                retryCount++;
                if (retryCount < this._retryLimit) {
                    // Exponential backoff: 1s, 2s, 4s, etc.
                    const backoffTime = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
        }

        // If we got here, all retries failed
        throw lastError || new Error('Failed to call OpenRouter API after multiple retries');
    }
} 