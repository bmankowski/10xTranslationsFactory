// src/hooks/useExerciseChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type { TextDTO, QuestionDTO, SubmitResponseCommand, UserResponseDTO, TextWithQuestionsDTO } from "../types";
import type {
  ChatMessageVM,
  AIMessageVM,
  UserAnswerVM,
  FeedbackResultVM,
} from "../components/exercise-chat/viewModels";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs for chat messages

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

  // Function to ask the current question again
  const repeatCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;

    // Reset timing for the question
    startTimeCurrentQuestionRef.current = Date.now();
    setError(null);

    // Add the question message to the chat again
    const repeatQuestionMessage: AIMessageVM = {
      id: uuidv4(),
      type: "ai_question",
      sender: "ai",
      text: `${currentQuestion.content}`,
      questionId: currentQuestion.id,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, repeatQuestionMessage]);
  }, [currentQuestion]);

  // Fetch initial exercise data (text and questions)
  useEffect(() => {
    if (!textId) {
      setError("Text ID is missing.");
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
          throw new Error("The exercise has no questions.");
        }

        setTextData(data);
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        startTimeCurrentQuestionRef.current = Date.now(); // Set ref value

        // Add first question to chat messages
        const firstQuestionMessage: AIMessageVM = {
          id: data.questions[0].id,
          type: "ai_question",
          sender: "ai",
          text: data.questions[0].content,
          questionId: data.questions[0].id,
          timestamp: new Date().toISOString(),
        };
        setChatMessages([firstQuestionMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchExerciseData();
  }, [textId]);

  // Handle answer submission - simplified signature
  const handleAnswerSubmit = useCallback(
    async (answerText: string, questionId: string) => {
      if (!startTimeCurrentQuestionRef.current) {
        setError("An internal error occurred (timing issue).");
        return;
      }
      const responseTimeMs = Date.now() - startTimeCurrentQuestionRef.current;
      startTimeCurrentQuestionRef.current = null; // Reset for the current question attempt cycle

      setIsLoadingSubmission(true);
      setError(null);

      const userAnswerMessage: UserAnswerVM = {
        id: uuidv4(),
        type: "user_answer",
        sender: "user",
        text: answerText,
        questionId: questionId,
        responseTimeMs: responseTimeMs,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userAnswerMessage]);

      try {
        const command: SubmitResponseCommand = { response_text: answerText, response_time: responseTimeMs };

        // Send the answer to the API for evaluation
        const response = await fetch(`/api/questions/${questionId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          // Handle different error cases
          if (response.status === 401) {
            throw new Error("You need to be logged in to submit answers");
          } else if (response.status === 403) {
            throw new Error("You do not have permission to answer this question");
          } else if (response.status === 404) {
            throw new Error("Question not found");
          } else {
            throw new Error(`Failed to submit answer: ${response.statusText}`);
          }
        }

        const result: UserResponseDTO = await response.json();

        // Create feedback message
        const feedbackMessage: FeedbackResultVM = {
          id: result.id,
          type: "feedback_result",
          sender: "ai",
          questionId: result.question_id,
          originalAnswerText: result.response_text,
          isCorrect: result.is_correct,
          feedbackText: result.feedback || "Thank you for your answer.",
          userResponseId: result.id,
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, feedbackMessage]);

        // If the answer is correct, proceed to the next question after a delay
        if (result.is_correct) {
          // Instead of setting state and checking it later, directly call the function after delay
          setTimeout(() => {
            // Skip the canProceedToNext check and directly proceed
            if (currentQuestionIndex < questions.length - 1) {
              const nextIndex = currentQuestionIndex + 1;
              setCurrentQuestionIndex(nextIndex);
              startTimeCurrentQuestionRef.current = Date.now();
              setError(null);
              const nextQuestionMessage: AIMessageVM = {
                id: questions[nextIndex].id,
                type: "ai_question",
                sender: "ai",
                text: questions[nextIndex].content,
                questionId: questions[nextIndex].id,
                timestamp: new Date().toISOString(),
              };
              setChatMessages((prev) => [...prev, nextQuestionMessage]);
            } else {
              const completionMessage: ChatMessageVM = {
                id: uuidv4(),
                type: "ai_question",
                sender: "ai",
                text: "Congratulations! You have completed all questions for this exercise.",
                questionId: "completion",
                timestamp: new Date().toISOString(),
              };
              setChatMessages((prev) => [...prev, completionMessage]);
              setIsExerciseComplete(true);
            }
          }, 2000); // Delay to allow reading the feedback before proceeding
        } else {
          // If the answer is incorrect, ask the question again after a delay
          setTimeout(() => {
            repeatCurrentQuestion();
          }, 2000); // Give time to read the feedback before repeating
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while submitting answer.");
        // Optionally, add an error message to chatMessages or allow retry for the specific message
      } finally {
        setIsLoadingSubmission(false);
      }
    },
    [currentQuestionIndex, questions, repeatCurrentQuestion]
  ); // Updated dependencies

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
