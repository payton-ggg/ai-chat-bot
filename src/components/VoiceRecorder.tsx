import React, { useState } from "react";
import { Send } from "lucide-react";
import { useVoice } from "../contexts/VoiceContext";
import { processTranscript } from "../services/ioNet";
import { useChatId, useModelStore } from "../services/store";

const ChatInput: React.FC = () => {
  const { voiceState, setVoiceState, addMessage } = useVoice();
  const { id } = useChatId();
  const { model } = useModelStore();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || voiceState === "processing") return;

    const userMessage = message.trim();
    setMessage("");
    addMessage("user", userMessage);
    setVoiceState("processing");
    setIsTyping(true);

    let streamedMessage = "";
    addMessage("assistant", "");

    try {
      await processTranscript(userMessage, model, id, (chunk: string) => {
        streamedMessage += chunk;
        addMessage("assistant", streamedMessage, true); // replaceLast = true
      });
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage("assistant", "⚠️ Error occurred while processing your message.", true);
    } finally {
      setVoiceState("idle");
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={voiceState === "processing"}
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!message.trim() || voiceState === "processing"}
            className="absolute right-2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      {(voiceState === "processing" || isTyping) && (
        <p className="mt-2 text-sm text-gray-500">AI is typing...</p>
      )}
    </div>
  );
};

export default ChatInput;
