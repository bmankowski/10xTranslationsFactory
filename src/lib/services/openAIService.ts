import { OpenRouterService } from './openRouter';
import type { AnswerVerificationResponse } from './openRouterTypes';
import { getAnswerVerificationResponseFormat } from './openRouterTypes';

interface FeedbackParams {
  questionContent: string;
  textContent: string;
  userAnswer: string;
  language: string;
  languageCode: string;
  proficiencyLevel: string;
}

/**
 * Generates AI feedback for a user's answer to a question
 * @param params Parameters containing question, text, user answer, and language info
 * @returns Object with correctness assessment and feedback
 */
export async function generateAIFeedback(params: FeedbackParams): Promise<{ isCorrect: boolean, feedback: string } | null> {
  try {
    // Get API key from environment variable
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set in .env file');
      return null;
    }
    
    console.log(`Initializing OpenRouter with key length: ${apiKey.length} characters`);
    
    try {
      // Initialize OpenRouter service with answer verification format
      const openRouter = new OpenRouterService<AnswerVerificationResponse>();
      
      // Explicitly initialize the service with configuration
      openRouter.initService({
        apiKey,
        apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'openai/gpt-4o-mini', // Use less expensive model for answer evaluation
        defaultModelParams: {
          temperature: 0.2, // Lower temperature for more consistent evaluation
          max_tokens: 250 // Enough tokens for evaluation feedback
        },
        systemMessage: `You are an expert language learning assistant specializing in ${params.language} (${params.languageCode}). 
        You evaluate student answers based on their accuracy and provide helpful, encouraging feedback.
        For ${params.proficiencyLevel} level learners, focus on meaning over perfect grammar.`
      });
      
      // Set response format separately
      openRouter.responseFormat = getAnswerVerificationResponseFormat();
      
      console.log('OpenRouter service initialized successfully');

      // Create prompt for AI
      const prompt = `
I need to evaluate a student's answer to a language exercise question.

Text passage: "${params.textContent.substring(0, 500)}${params.textContent.length > 500 ? '...' : ''}"

Question: "${params.questionContent}"

Student's answer: "${params.userAnswer}"

Evaluate if the student's answer is correct in terms of content and meaning, even if there are minor grammatical errors.
Respond with JSON containing:
1. "correct": boolean indicating if the answer is generally correct (true) or incorrect (false)
2. "feedback": constructive feedback in ${params.language} explaining what was good and what could be improved

For ${params.proficiencyLevel} level, focus on whether the student understood the text and answered the question correctly.
`;

      console.log('Sending prompt to OpenRouter service');
      // Send to OpenRouter API
      const result = await openRouter.sendMessage(prompt);
      
      console.log('OpenRouter response received:', result);
      
      // Return formatted result
      return {
        isCorrect: result.correct,
        feedback: result.feedback
      };
    } catch (serviceError) {
      console.error('OpenRouter service error:', serviceError);
      throw serviceError; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return null; // Return null to trigger fallback evaluation
  }
} 