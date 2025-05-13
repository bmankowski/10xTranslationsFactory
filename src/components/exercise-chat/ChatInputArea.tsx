import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming Shadcn UI button path
import { Input } from '@/components/ui/input';   // Assuming Shadcn UI input path
import { SendHorizonal, Loader2 } from 'lucide-react';
import type { QuestionDTO } from '../../types'; // Import QuestionDTO

export interface ChatInputAreaProps {
  onSubmit: (answerText: string) => void;
  isLoading: boolean;
  currentQuestion: QuestionDTO | null;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSubmit, isLoading, currentQuestion }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && currentQuestion) {
      onSubmit(inputText.trim());
      setInputText(''); // Clear input after submission
    }
  };

  const isDisabled = isLoading || !currentQuestion;

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white sticky bottom-0">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder={currentQuestion ? "Type your answer..." : "Waiting for question..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isDisabled}
          className="flex-grow"
          aria-label="Answer input"
        />
        <Button type="submit" disabled={isDisabled || !inputText.trim()}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> 
          ) : (
            <SendHorizonal className="w-4 h-4 mr-1.5" />
          )}
          Send
        </Button>
      </div>
      {isDisabled && !isLoading && !currentQuestion && (
        <p className="text-xs text-gray-500 mt-1">Please wait for the next question to answer.</p>
      )}
    </form>
  );
};

export default ChatInputArea; 