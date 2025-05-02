import React, { useState } from "react";
import { Send } from "lucide-react";
import { useVoice } from "../contexts/VoiceContext";
import { processTranscript } from "../services/ioNet";

const ChatInput: React.FC = () => {
  const { voiceState, setVoiceState, addMessage } = useVoice();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || voiceState === "processing") return;

    const userMessage = message.trim();
    setMessage("");
    addMessage("user", userMessage);
    setVoiceState("processing");

    try {
      const response = await processTranscript(userMessage);
      addMessage("assistant", response);
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage(
        "assistant",
        "Sorry, I encountered an error processing your message. Please try again."
      );
    } finally {
      setVoiceState("idle");
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
      {voiceState === "processing" && (
        <p className="mt-2 text-sm text-gray-500">Processing your message...</p>
      )}
    </div>
  );
};

export default ChatInput;
