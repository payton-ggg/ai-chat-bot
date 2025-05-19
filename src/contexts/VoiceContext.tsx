import React, {
	createContext,
	useState,
	useCallback,
	useContext,
	useEffect,
} from "react";
import { Message, VoiceContextType, VoiceState } from "../types";
import { speechRecognitionService } from "../services/assemblyAI";

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
	const [isSupported] = useState(() => speechRecognitionService.isSupported());

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

	useEffect(() => {
		speechRecognitionService.setOnStateChangeCallback(setVoiceState);
		speechRecognitionService.setOnTranscriptCallback((transcript, isFinal) => {
			if (isFinal) {
				addMessage("user", transcript);
			}
		});
	}, [addMessage]);

	const startListening = useCallback(() => {
		if (!isSupported) {
			setVoiceState("error");
			return;
		}
		speechRecognitionService.startListening();
	}, [isSupported]);

	const stopListening = useCallback(() => {
		speechRecognitionService.stopListening();
	}, []);

	const value: VoiceContextType = {
		messages,
		addMessage,
		voiceState,
		setVoiceState,
		clearConversation,
		startListening,
		stopListening,
		isVoiceSupported: isSupported,
	};

	return (
		<VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
	);
};
