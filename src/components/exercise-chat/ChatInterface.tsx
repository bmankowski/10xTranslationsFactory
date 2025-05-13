import React from 'react';
import type { ChatMessageVM } from './viewModels';
import type { QuestionDTO } from '../../types'; // Assuming QuestionDTO is in global types
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';
import NextButton from './NextButton';

export interface ChatInterfaceProps {
  messages: ChatMessageVM[];
  currentQuestion: QuestionDTO | null;
  onAnswerSubmit: (answerText: string, questionId: string) => void;
  onNextQuestion: () => void;
  isLoadingSubmission: boolean;
  isNextButtonDisabled: boolean;
  isLastQuestion: boolean; // True if the current question is the last one
  // This prop indicates if the *current* question is the last AND it has been answered and feedback shown.
  // It determines the NextButton's text ("Finish Exercise" vs "Next Question").
  isLastQuestionAnsweredAndFeedbackShown: boolean; 
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentQuestion,
  onAnswerSubmit,
  onNextQuestion,
  isLoadingSubmission,
  isNextButtonDisabled,
  isLastQuestion,
  isLastQuestionAnsweredAndFeedbackShown
}) => {
  // This state is internal to ChatInterface to manage when the NextButton becomes active.
  // It becomes true when feedback for the current question is displayed.
  // The parent (ExerciseChatIsland) will control `isNextButtonDisabled` more broadly.
  const [showNextButton, setShowNextButton] = React.useState(false);

  React.useEffect(() => {
    // Show the NextButton if the last message is a feedback result
    // or if all questions are done (completion message shown)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'feedback_result') {
        setShowNextButton(true);
      } else if (lastMessage.type === 'ai_question' && lastMessage.questionId === 'completion') {
        // This is the completion message from the hook
        setShowNextButton(false); // No "Next" after completion message
      } else if (lastMessage.type !== 'user_answer' && lastMessage.type !== 'loading_ai') {
         // If a new question is shown, hide next button initially
        setShowNextButton(false);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg overflow-hidden">
      <ChatMessageList messages={messages} />
      
      {/* Show NextButton only if a question has been answered or it's not the very end */} 
      {showNextButton && 
        currentQuestion && // Ensure there was a question to answer before showing next button
        messages.some(msg => msg.type === 'feedback_result' && msg.questionId === currentQuestion.id) &&
        !(isLastQuestionAnsweredAndFeedbackShown && messages[messages.length-1]?.questionId === 'completion') && (
        <NextButton 
          onClick={onNextQuestion}
          isDisabled={isNextButtonDisabled} 
          isLastQuestionAnswered={isLastQuestionAnsweredAndFeedbackShown}
        />
      )}

      {/* Show input unless it's the very end (completion message shown) */} 
      {!(messages.length > 0 && messages[messages.length-1].type === 'ai_question' && messages[messages.length-1].questionId === 'completion') && (
        <ChatInputArea 
          onSubmit={(answerText) => {
            if (currentQuestion) {
              onAnswerSubmit(answerText, currentQuestion.id);
            }
          }}
          isLoading={isLoadingSubmission}
          currentQuestion={currentQuestion}
        />
      )}
    </div>
  );
};

export default ChatInterface; 