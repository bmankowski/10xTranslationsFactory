import React from "react";
import type { ChatMessageVM } from "./viewModels";
import ChatBubble from "./ChatBubble";

export interface ChatMessageListProps {
  messages: ChatMessageVM[];
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-grow p-4 text-center text-gray-500">
        No messages yet. The first question will appear here.
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50 rounded-md min-h-[300px]">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatMessageList;
