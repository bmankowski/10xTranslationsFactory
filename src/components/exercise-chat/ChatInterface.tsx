import React from 'react';
import type { ChatMessageVM, AIMessageVM } from './viewModels';
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
  // Check if we're at completion (last message is the completion message)
  const isCompleted = messages.length > 0 && 
    (() => {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.type === 'ai_question' && 
        (lastMessage as AIMessageVM).questionId === 'completion';
    })();

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg overflow-hidden flex-grow">
      <ChatMessageList messages={messages} />
      
      {/* Show input unless it's the very end (completion message shown) */} 
      {!isCompleted && (
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