// src/hooks/useExerciseChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TextDTO, QuestionDTO, SubmitResponseCommand, UserResponseDTO, TextWithQuestionsDTO } from '../types';
import type { ChatMessageVM, AIMessageVM, UserAnswerVM, FeedbackResultVM } from '../components/exercise-chat/viewModels';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for chat messages

export function useExerciseChat(textId: string) {
  const [textData, setTextData] = useState<TextDTO | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [chatMessages, setChatMessages] = useState<ChatMessageVM[]>([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Use a ref for startTimeCurrentQuestion to ensure the latest value is available in callbacks
  // without causing re-definitions of those callbacks due to startTimeCurrentQuestion changing.
  const startTimeCurrentQuestionRef = useRef<number | null>(null);
  const [isExerciseComplete, setIsExerciseComplete] = useState<boolean>(false);

  // Derived state
  const currentQuestion: QuestionDTO | null = questions[currentQuestionIndex] || null;
  const isLastQuestion: boolean = currentQuestionIndex >= 0 && currentQuestionIndex === questions.length - 1;

  // Function to proceed to the next question or complete the exercise
  const proceedToNextStep = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      startTimeCurrentQuestionRef.current = Date.now();
      setError(null);
      const nextQuestionMessage: AIMessageVM = {
        id: questions[nextIndex].id, type: 'ai_question', sender: 'ai',
        text: questions[nextIndex].content, questionId: questions[nextIndex].id, timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, nextQuestionMessage]);
    } else {
      console.log("All questions answered!");
      const completionMessage: ChatMessageVM = {
        id: uuidv4(), type: 'ai_question', sender: 'ai',
        text: "Congratulations! You have completed all questions for this exercise.",
        questionId: 'completion', timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, completionMessage]);
      setIsExerciseComplete(true);
    }
  }, [currentQuestionIndex, questions]);

  // Fetch initial exercise data (text and questions)
  useEffect(() => {
    if (!textId) {
      setError('Text ID is missing.');
      setIsLoadingInitialData(false);
      return;
    }
    setIsLoadingInitialData(true);
    setError(null);
    setIsExerciseComplete(false);

    const fetchExerciseData = async () => {
      try {
        // Fetch real data from the API
        const response = await fetch(`/api/exercises/${textId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Exercise not found");
          } else if (response.status === 401) {
            throw new Error("You need to be logged in to access this exercise");
          } else if (response.status === 403) {
            throw new Error("You do not have permission to access this exercise");
          } else {
            throw new Error(`Failed to fetch exercise data: ${response.statusText}`);
          }
        }
        
        const data: TextWithQuestionsDTO = await response.json();

        if (!data || !data.questions || data.questions.length === 0) {
          throw new Error('The exercise has no questions.');
        }

        setTextData(data);
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        startTimeCurrentQuestionRef.current = Date.now(); // Set ref value
        
        // Add first question to chat messages
        const firstQuestionMessage: AIMessageVM = {
          id: data.questions[0].id,
          type: 'ai_question',
          sender: 'ai',
          text: data.questions[0].content,
          questionId: data.questions[0].id,
          timestamp: new Date().toISOString(),
        };
        setChatMessages([firstQuestionMessage]);

      } catch (err) {
        console.error("Error fetching exercise data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchExerciseData();
  }, [textId]);

  // Handle answer submission - simplified signature
  const handleAnswerSubmit = useCallback(async (answerText: string, questionId: string) => {
    if (!startTimeCurrentQuestionRef.current) {
      console.error("Cannot submit answer: start time for current question is not set.");
      setError("An internal error occurred (timing issue).");
      return;
    }
    const responseTimeMs = Date.now() - startTimeCurrentQuestionRef.current;
    startTimeCurrentQuestionRef.current = null; // Reset for the current question attempt cycle

    setIsLoadingSubmission(true);
    setError(null);

    const userAnswerMessage: UserAnswerVM = {
      id: uuidv4(), type: 'user_answer', sender: 'user', text: answerText, questionId: questionId,
      responseTimeMs: responseTimeMs, timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userAnswerMessage]);

    try {
      const command: SubmitResponseCommand = { response_text: answerText, response_time: responseTimeMs };
      // --- API Call Placeholder ---
      // const response = await fetch(`/api/questions/${questionId}/responses`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(command),
      // });
      // if (!response.ok) {
      //   // Handle API errors (400, 401, 403, 404, 500) as per plan
      //   throw new Error(`Failed to submit answer: ${response.statusText}`);
      // }
      // const result: UserResponseDTO = await response.json();

      // --- Simulated API Response ---
      console.log(`Submitting answer for questionId: ${questionId}... (Simulating API call)`, command);
      await new Promise(resolve => setTimeout(resolve, 800));
      const result: UserResponseDTO = {
        id: uuidv4(),
        user_id: 'user-placeholder-id',
        question_id: questionId,
        response_text: answerText,
        is_correct: Math.random() > 0.3, // Simulate correctness
        feedback: Math.random() > 0.3 ? 'That is a good attempt! Consider this aspect... xyz.' : 'You are on the right track!',
        response_time: responseTimeMs,
        created_at: new Date().toISOString(),
      };
      // --- End of Simulated API Response ---

      const feedbackMessage: FeedbackResultVM = {
        id: result.id,
        type: 'feedback_result',
        sender: 'ai',
        questionId: result.question_id,
        originalAnswerText: result.response_text,
        isCorrect: result.is_correct,
        feedbackText: result.feedback,
        userResponseId: result.id,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, feedbackMessage]);
      
      // Automatically proceed to the next step after short delay to allow user to read feedback
      setTimeout(() => {
        proceedToNextStep();
      }, 1500); // 1.5 second delay, adjust as needed

    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while submitting answer.');
      // Optionally, add an error message to chatMessages or allow retry for the specific message
    } finally {
      setIsLoadingSubmission(false);
    }
  }, [proceedToNextStep]); // Dependency on proceedToNextStep

  return {
    textData,
    questions,
    currentQuestionIndex,
    currentQuestion,
    chatMessages,
    isLoadingInitialData,
    isLoadingSubmission,
    error,
    isLastQuestion,
    handleAnswerSubmit,
    setChatMessages, // Exposing for potential direct manipulation if needed (e.g. error messages in chat)
    setError, // Exposing for more complex error handling in component
    isExerciseComplete,
  };
} 