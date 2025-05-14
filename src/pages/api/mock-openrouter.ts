import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Extract request information
    const { messages, model, response_format } = body;
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    console.log('Mock OpenRouter received request with format:', JSON.stringify(response_format));
    
    // Create mock response based on response_format
    let mockContent;
    
    if (response_format.type === 'json_object') {
      if (userMessage.includes('Translate')) {
        mockContent = {
          text: "Hello, how are you?",
          language: "en"
        };
      } else if (userMessage.includes('Generate a short text')) {
        mockContent = {
          text: "Climate change is one of the most pressing issues of our time. Rising global temperatures have led to more extreme weather events, melting ice caps, and rising sea levels. Scientists warn that urgent action is needed to reduce greenhouse gas emissions and limit the long-term impacts on our planet.",
          language: "en",
          questions: [
            {
              question: "What is causing climate change according to the text?",
              options: ["Deforestation", "Rising global temperatures", "Ocean pollution"],
              answer: "Rising global temperatures"
            },
            {
              question: "What are some effects of climate change mentioned?",
              answer: "Extreme weather events, melting ice caps, and rising sea levels"
            },
            {
              question: "What do scientists recommend?",
              answer: "Urgent action to reduce greenhouse gas emissions"
            },
            {
              question: "Why is climate change described as an important issue?",
              answer: "It's one of the most pressing issues of our time"
            }
          ]
        };
      } else if (userMessage.includes('correct?')) {
        const isCorrect = userMessage.toLowerCase().includes('correct answer') && 
                          userMessage.toLowerCase().includes('user\'s answer') && 
                          Math.random() > 0.5;
        
        mockContent = {
          correct: isCorrect,
          feedback: isCorrect 
            ? "Your answer is correct! Well done." 
            : "Your answer is incorrect. Consider reviewing the material again."
        };
      } else {
        mockContent = {
          text: "This is a generic response to your query: " + userMessage,
          language: "en"
        };
      }
    } else {
      // Plain text response
      mockContent = "This is a plain text response to: " + userMessage;
    }
    
    // Return OpenRouter style response
    return new Response(JSON.stringify({
      id: "mockresponse-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model || "mock-model",
      choices: [
        {
          message: {
            role: "assistant",
            content: typeof mockContent === 'object' 
              ? JSON.stringify(mockContent) 
              : mockContent
          },
          index: 0,
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Mock OpenRouter error:', error);
    
    return new Response(JSON.stringify({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'mock_error',
        param: null,
        code: 'internal_error'
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 