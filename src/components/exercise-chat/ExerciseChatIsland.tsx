import React from 'react';
import { useExerciseChat } from '../../hooks/useExerciseChat';
import type { QuestionDTO } from '../../types'; // Ensure QuestionDTO is imported if not already global

import ExerciseTextView from './ExerciseTextView';
import ChatInterface from './ChatInterface';
import { Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    // isLastQuestion, // No longer directly needed here for a button
    handleAnswerSubmit,
    // handleNextQuestion, // No longer passed to ChatInterface
    // setChatMessages, // Not used directly here
    // setError, // Can be used for more granular error display if needed
    isExerciseComplete,
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

  const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
  // Logic for isLastQuestionAnsweredAndFeedbackShown and isNextButtonActuallyDisabled removed as button is gone.
  const submissionError = error && (isLoadingSubmission || (lastMessage?.type === 'user_answer' && !chatMessages.some(m => m.type === 'feedback_result' && m.questionId === lastMessage.questionId))) ? error : null;

  const handleReturnToExercises = () => {
    window.location.href = '/exercises'; // Navigate to exercises list
  };

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
        currentQuestion={currentQuestion as QuestionDTO | null}
        onAnswerSubmit={handleAnswerSubmit}
        isLoadingSubmission={isLoadingSubmission}
        // Removed props related to NextButton
      />

      {isExerciseComplete && (
        <div className="mt-8 p-4 text-center">
          <Button onClick={handleReturnToExercises} size="lg" variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Return to Exercises List
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseChatIsland; 