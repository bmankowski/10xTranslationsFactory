import { OpenRouterService } from './openRouter';
import { getTextResponseFormat } from './openRouterTypes';
import type { TextResponse } from './openRouterTypes';
import 'dotenv/config';

async function testOpenRouter() {
  // Get API key and endpoint from environment variables
  const apiKey = process.env.OPENROUTER_API_KEY;
  const apiEndpoint = process.env.OPENROUTER_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions';
  
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  console.log('Initializing OpenRouter service...');
  
  // Create the service
  const openRouter = new OpenRouterService({
    apiKey,
    apiEndpoint,
    defaultModel: 'openai/gpt-4o', // Use a specific model for testing
    systemMessage: 'You are a helpful translation assistant.'
  });
  
  try {
    console.log('Sending test message to OpenRouter...');
    
    // Use helper function for response format
    const additionalParams = {
      response_format: getTextResponseFormat()
    };
    
    const response = await openRouter.sendMessage(
      'Translate this to English: "Cześć, jak się masz?"', 
      additionalParams
    ) as TextResponse;
    
    console.log('Raw response:', JSON.stringify(response, null, 2));
    
    // Handle response according to TextResponse structure
    if (response && response.text) {
      console.log('Translation result:', response.text);
      console.log('\nTest completed successfully!');
    } else {
      console.error('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

// Run the test
testOpenRouter().catch(console.error); 