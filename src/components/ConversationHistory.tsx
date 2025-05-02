import React from 'react';
import { Trash2 } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { Message } from '../types';

const ConversationHistory: React.FC = () => {
  const { messages, clearConversation } = useVoice();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-gray-500">
        <p className="text-center text-lg">Your conversation will appear here</p>
        <p className="text-center text-sm mt-2">Start speaking by clicking the microphone button</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-center px-6 py-3 border-b">
        <h2 className="text-lg font-medium text-gray-800">Conversation</h2>
        <button 
          onClick={clearConversation}
          className="text-gray-500 hover:text-red-500 transition-colors p-1"
          aria-label="Clear conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-700 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

export default ConversationHistory;