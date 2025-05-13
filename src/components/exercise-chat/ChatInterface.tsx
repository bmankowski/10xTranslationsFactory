import React from 'react';
import type { ChatMessageVM } from './viewModels';
import type { QuestionDTO } from '../../types'; // Assuming QuestionDTO is in global types
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';

export interface ChatInterfaceProps {
  messages: ChatMessageVM[];
  currentQuestion: QuestionDTO | null;
  onAnswerSubmit: (answerText: string, questionId: string) => void;
  isLoadingSubmission: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentQuestion,
  onAnswerSubmit,
  isLoadingSubmission,
}) => {
  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg overflow-hidden flex-grow">
      <ChatMessageList messages={messages} />
      
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