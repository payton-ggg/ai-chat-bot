// VoiceContext.tsx
import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { Message, VoiceContextType, VoiceState } from "../types";
import { speechRecognitionService } from "../services/speechRecognition";

const VoiceContext = createContext<VoiceContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");

  useEffect(() => {
    speechRecognitionService.setOnTranscriptCallback((text, isFinal) => {
      setTranscript(text);
      if (isFinal) {
        // keep final transcript until stopListening consumes it
      }
    });

    speechRecognitionService.setOnStateChangeCallback((state) => {
      setVoiceState(state);
    });
  }, []);

  const addMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string,
      replaceLast: boolean = false
    ) => {
      setMessages((prev) => {
        if (replaceLast && prev.length > 0) {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === role) {
            updated[updated.length - 1] = {
              ...last,
              content,
              timestamp: new Date(),
            };
            return updated;
          }
        }

        return [
          ...prev,
          {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
          },
        ];
      });
    },
    []
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const startListening = useCallback(() => {
    if (!speechRecognitionService.isSupported()) {
      setVoiceState("error");
      return;
    }

    setTranscript("");
    setVoiceState("listening");
    // set language from browser settings
    const lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";
    speechRecognitionService.setLanguage(lang);
    speechRecognitionService.startListening();
  }, []);

  const stopListening = useCallback(() => {
    speechRecognitionService.stopListening();
    setVoiceState("idle");

    if (transcript.trim()) {
      addMessage("user", transcript.trim());
      setTranscript("");
    }
  }, [transcript, addMessage]);

	const value: VoiceContextType = {
		messages,
		addMessage,
		voiceState,
		setVoiceState,
		clearConversation,
		startListening,
		stopListening,
		isVoiceSupported: speechRecognitionService.isSupported(),
        transcript,
	};

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
};
