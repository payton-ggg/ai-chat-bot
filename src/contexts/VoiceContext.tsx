// VoiceContext.tsx
import React, { createContext, useState, useCallback, useContext } from "react";
import SpeechRecognition, {
	useSpeechRecognition,
} from "react-speech-recognition";
import { Message, VoiceContextType, VoiceState } from "../types";

const VoiceContext = createContext<VoiceContextType | null>(null);

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

	const {
		transcript,
		resetTranscript,
		browserSupportsSpeechRecognition,
		listening,
	} = useSpeechRecognition();

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
		if (!browserSupportsSpeechRecognition) {
			setVoiceState("error");
			return;
		}

		setVoiceState("listening");
		resetTranscript();

		SpeechRecognition.startListening({
			continuous: true,
			language: "en-US",
		});
	}, [browserSupportsSpeechRecognition, resetTranscript]);

	const stopListening = useCallback(() => {
		SpeechRecognition.stopListening();
		setVoiceState("idle");

		if (transcript.trim()) {
			addMessage("user", transcript.trim());
			resetTranscript();
		}
	}, [transcript, addMessage, resetTranscript]);

	const value: VoiceContextType = {
		messages,
		addMessage,
		voiceState: listening ? "listening" : voiceState,
		setVoiceState,
		clearConversation,
		startListening,
		stopListening,
		isVoiceSupported: browserSupportsSpeechRecognition,
	};

	return (
		<VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
	);
};
