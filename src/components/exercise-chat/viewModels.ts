// src/components/exercise-chat/viewModels.ts

// Base interface for all chat messages
interface BaseMessageVM {
  id: string; // Unique ID for React key, can be question.id, response.id, or generated
  timestamp: string; // ISO string for potential display or sorting
}

// ViewModel for AI-generated questions
export interface AIMessageVM extends BaseMessageVM {
  type: "ai_question";
  sender: "ai"; // For styling chat bubble (e.g., light-blue background)
  text: string; // Question content from QuestionDTO.content
  questionId: string; // Original QuestionDTO.id
}

// ViewModel for user's submitted answers
export interface UserAnswerVM extends BaseMessageVM {
  type: "user_answer";
  sender: "user"; // For styling chat bubble (e.g., light-green background)
  text: string; // User's response_text
  questionId: string; // The QuestionDTO.id this answers
  responseTimeMs?: number; // Optional: if we want to display it
}

// ViewModel for feedback results from the system
export interface FeedbackResultVM extends BaseMessageVM {
  type: "feedback_result";
  sender: "ai"; // System feedback, styled like AI messages
  questionId: string; // The QuestionDTO.id this feedback is for
  originalAnswerText: string; // The user's original answer text
  isCorrect: boolean;
  feedbackText?: string; // Detailed feedback if incorrect, from UserResponseDTO.feedback
  userResponseId: string; // From UserResponseDTO.id
}

// ViewModel for displaying a loading indicator for an AI message
export interface LoadingAIMessageVM extends BaseMessageVM {
  type: "loading_ai";
  sender: "ai";
  // No text content, implies a loading skeleton/animation in the ChatBubble component
}

// Discriminated union type for all possible chat messages
export type ChatMessageVM = AIMessageVM | UserAnswerVM | FeedbackResultVM | LoadingAIMessageVM;
