import React from 'react';
import type { ChatMessageVM, AIMessageVM, UserAnswerVM, FeedbackResultVM, LoadingAIMessageVM } from './viewModels';
import { Bot, User, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'; // Using lucide-react for icons

export interface ChatBubbleProps {
  message: ChatMessageVM;
}

const ChatBubbleContent: React.FC<{ message: ChatMessageVM }> = ({ message }) => {
  switch (message.type) {
    case 'ai_question':
      return <p>{(message as AIMessageVM).text}</p>;
    case 'user_answer':
      return <p>{(message as UserAnswerVM).text}</p>;
    case 'feedback_result':
      const feedbackMsg = message as FeedbackResultVM;
      return (
        <div className="space-y-1">
          <p className="font-medium">
            {feedbackMsg.isCorrect ? (
              <span className="flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1.5" /> Correct</span>
            ) : (
              <span className="flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1.5" /> Incorrect</span>
            )}
          </p>
          {feedbackMsg.feedbackText && <p className="text-sm">{feedbackMsg.feedbackText}</p>}
        </div>
      );
    case 'loading_ai':
      return (
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      );
    default:
      return <p className="text-red-500 italic">Unknown message type</p>;
  }
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAI = message.sender === 'ai';
  const bubbleClasses = isAI
    ? 'bg-sky-100 text-sky-800 self-start rounded-tr-lg rounded-bl-lg rounded-br-lg' // Light-blue for AI (View Description)
    : 'bg-green-100 text-green-800 self-end rounded-tl-lg rounded-bl-lg rounded-br-lg'; // Light-green for User (View Description)
  
  const Icon = isAI ? (
    <Bot className="w-6 h-6 text-sky-600 flex-shrink-0" />
  ) : (
    <User className="w-6 h-6 text-green-600 flex-shrink-0" />
  );

  // Special handling for loading message - less prominent icon or different layout
  if (message.type === 'loading_ai') {
    return (
      <div className={`flex items-start max-w-[80%] p-3 rounded-lg space-x-2.5 ${bubbleClasses}`}>
        <ChatBubbleContent message={message} />
      </div>
    );
  }

  return (
    <div className={`flex items-start max-w-[80%] ${isAI ? 'mr-auto' : 'ml-auto'}`}>
      {isAI && <div className="mr-2.5 mt-1">{Icon}</div>}
      <div className={`p-3 md:p-4 rounded-lg shadow-sm ${bubbleClasses} w-full`}>
        <ChatBubbleContent message={message} />
        <p className="text-xs mt-1.5 text-right opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {!isAI && <div className="ml-2.5 mt-1">{Icon}</div>}
    </div>
  );
};

export default ChatBubble; 