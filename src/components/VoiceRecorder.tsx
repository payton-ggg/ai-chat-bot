import React, { useEffect, useState } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { useVoice } from "../contexts/VoiceContext";
import { processTranscript } from "../services/ioNet";
import { useModelStore, useChatId } from "../services/store";

const ChatInput: React.FC = () => {
  const {
    voiceState,
    setVoiceState,
    addMessage,
    startListening,
    stopListening,
  } = useVoice();
  const { id } = useChatId();
  const { model } = useModelStore();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    return () => {
      if (voiceState === "listening") {
        stopListening();
      }
    };
  }, [voiceState, stopListening]);

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
        addMessage("assistant", streamedMessage, true);
      });
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage(
        "assistant",
        "⚠️ Error occurred while processing your message.",
        true
      );
    } finally {
      setVoiceState("idle");
      setIsTyping(false);
    }
  };

  const handleVoiceButton = async () => {
    try {
      if (voiceState === "listening") {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.error("Voice recognition error:", error);
      setVoiceState("error");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleVoiceButton}
            className={`absolute left-2 p-2 ${
              voiceState === "listening"
                ? "text-red-600 hover:text-red-700"
                : "text-blue-600 hover:text-blue-700"
            } disabled:text-gray-400 disabled:cursor-not-allowed`}
            disabled={voiceState === "processing"}
            aria-label={
              voiceState === "listening" ? "Stop recording" : "Start recording"
            }
          >
            {voiceState === "listening" ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              voiceState === "listening"
                ? "Listening..."
                : "Type your message..."
            }
            disabled={voiceState === "processing"}
            className="w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
      {voiceState === "error" && (
        <p className="mt-2 text-sm text-red-500">
          Error with voice recognition. Please try again.
        </p>
      )}
    </div>
  );
};

export default ChatInput;
