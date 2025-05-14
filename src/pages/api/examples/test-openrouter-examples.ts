import type { APIRoute } from 'astro';
import { 
  createTextOpenRouterService, 
  createTextWithQuestionsOpenRouterService,
  createAnswerVerificationOpenRouterService,
  SYSTEM_PROMPTS
} from '../../../lib/openrouter';
import type {
  TextResponse,
  TextWithQuestionsResponse,
  AnswerVerificationResponse
} from '../../../lib/services/openRouterTypes';

// Override the OpenRouter API endpoint to use our mock
const MOCK_CONFIG = {
  apiEndpoint: 'http://localhost:3000/api/mock-openrouter',
  apiKey: 'mock-key'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, message, additionalParams } = body;

    // Create appropriate service based on request type with mock config
    switch (type) {
      case 'simple-text': {
        // For simple text responses (e.g., translations)
        const service = createTextOpenRouterService(
          SYSTEM_PROMPTS.TRANSLATION_ASSISTANT,
          MOCK_CONFIG
        );
        
        const response: TextResponse = await service.sendMessage(message, additionalParams);
        
        return new Response(JSON.stringify({
          success: true,
          data: response
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      case 'text-with-questions': {
        // For generating text with related questions
        const service = createTextWithQuestionsOpenRouterService(
          SYSTEM_PROMPTS.EXERCISE_GENERATOR,
          MOCK_CONFIG
        );
        
        const promptWithContext = `Generate a short text (100-150 words) about "${message}" 
        in English and create 4 related questions about the content.`;
        
        const response: TextWithQuestionsResponse = await service.sendMessage(promptWithContext, additionalParams);
        
        return new Response(JSON.stringify({
          success: true,
          data: response
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      case 'answer-verification': {
        // For verifying answers to questions
        const service = createAnswerVerificationOpenRouterService(
          SYSTEM_PROMPTS.LANGUAGE_TEACHER,
          MOCK_CONFIG
        );
        
        const { question, userAnswer, correctAnswer } = JSON.parse(message);
        
        const promptWithContext = `Question: ${question}
        User's answer: ${userAnswer}
        Correct answer: ${correctAnswer}
        
        Is the user's answer correct? Respond with true or false and provide brief feedback.`;
        
        const response: AnswerVerificationResponse = await service.sendMessage(promptWithContext, additionalParams);
        
        return new Response(JSON.stringify({
          success: true,
          data: response
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid request type'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    console.error('Test OpenRouter example error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 