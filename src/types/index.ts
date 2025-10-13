export type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
};

export type VoiceState = "idle" | "listening" | "processing" | "error";

export type VoiceContextType = {
    messages: Message[];
    addMessage: (
        role: "user" | "assistant",
        content: string,
        replaceLast?: boolean
    ) => void;
    voiceState: VoiceState;
    setVoiceState: (state: VoiceState) => void;
    clearConversation: () => void;
    startListening: () => void;
    stopListening: () => void;
    isVoiceSupported: boolean;
    transcript: string;
};

declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}
