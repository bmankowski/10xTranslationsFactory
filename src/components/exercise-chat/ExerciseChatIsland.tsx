import React from 'react';
import { useExerciseChat } from '../../hooks/useExerciseChat';
import type { QuestionDTO } from '../../types'; // Ensure QuestionDTO is imported if not already global

import ExerciseTextView from './ExerciseTextView';
import ChatInterface from './ChatInterface';
import { Loader2 } from 'lucide-react';

// Placeholder for ViewModel types - will be defined in a later step
// import type { ChatMessageVM } from './viewModels';

// Placeholder for sub-components - will be implemented in later steps
// import ExerciseTextView from './ExerciseTextView';
// import ChatInterface from './ChatInterface';

export interface ExerciseChatIslandProps {
  textId: string;
}

const ExerciseChatIsland: React.FC<ExerciseChatIslandProps> = ({ textId }) => {
  const {
    textData,
    // questions, // questions array itself is not directly used here, currentQuestion is used
    // currentQuestionIndex, // Not directly used here
    currentQuestion,
    chatMessages,
    isLoadingInitialData,
    isLoadingSubmission,
    error,
    isLastQuestion,
    handleAnswerSubmit, // Signature is now (answerText: string, questionId: string)
    handleNextQuestion,
    // setChatMessages, // Not used directly here
    // setError, // Can be used for more granular error display if needed
  } = useExerciseChat(textId);

  if (isLoadingInitialData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-sky-600 mb-4" />
        <p className="text-lg text-gray-600">Loading exercise...</p>
      </div>
    );
  }

  if (error && !textData) { // Show critical error if initial data load failed
    return (
      <div className="p-8 my-4 border rounded-md bg-red-50 text-red-700 text-center">
        <h3 className="font-semibold text-lg mb-2">Error Loading Exercise</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please try refreshing the page or select another exercise.</p>
      </div>
    );
  }

  if (!textData) { // Should be covered by isLoading or error, but as a fallback
    return <div className="text-center p-8">Exercise data is not available.</div>;
  }

  // Determine if the last question has been answered and feedback is shown
  // This is for the NextButton's text ("Finish Exercise")
  const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
  const isLastQuestionAnsweredAndFeedbackShown = 
    isLastQuestion && 
    lastMessage?.type === 'feedback_result' && 
    lastMessage.questionId === currentQuestion?.id;

  // The NextButton should be disabled if submission is in progress OR if it is the last question and it has been fully processed (completion message is next).
  const isNextButtonActuallyDisabled = isLoadingSubmission || 
    (lastMessage?.type === 'ai_question' && lastMessage?.questionId === 'completion');

  // Show an inline error from submission if any
  const submissionError = error && (isLoadingSubmission || (lastMessage?.type === 'user_answer' && !chatMessages.some(m => m.type === 'feedback_result' && m.questionId === lastMessage.questionId))) ? error : null;

  return (
    <div className="exercise-chat-island flex flex-col max-w-4xl mx-auto bg-slate-50 p-2 sm:p-6 rounded-xl shadow-xl min-h-[80vh]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center text-slate-800">Language Exercise</h1>
      </header>

      <ExerciseTextView text={textData} />

      {submissionError && (
        <div className="p-3 my-3 border rounded-md bg-red-50 text-red-600 text-sm">
          <p><span className="font-semibold">Submission Error:</span> {submissionError}</p>
        </div>
      )}

      <ChatInterface
        messages={chatMessages}
        currentQuestion={currentQuestion as QuestionDTO | null} // Cast needed if currentQuestion from hook can be undefined differently
        onAnswerSubmit={handleAnswerSubmit} // Directly pass the hook's handler
        onNextQuestion={handleNextQuestion}
        isLoadingSubmission={isLoadingSubmission}
        isNextButtonDisabled={isNextButtonActuallyDisabled}
        isLastQuestion={isLastQuestion}
        isLastQuestionAnsweredAndFeedbackShown={isLastQuestionAnsweredAndFeedbackShown || false}
      />
    </div>
  );
};

export default ExerciseChatIsland; 