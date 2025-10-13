export class SpeechRecognitionService {
	private recognition: any | null = null;
	private onTranscriptCallback:
		| ((transcript: string, isFinal: boolean) => void)
		| null = null;
	private onStateChangeCallback:
		| ((state: "idle" | "listening" | "error") => void)
		| null = null;

	constructor() {
		if (typeof window !== "undefined") {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				this.recognition = new SpeechRecognition();
				this.setupRecognition();
			}
		}
	}

	private setupRecognition() {
		if (!this.recognition) return;

		this.recognition.continuous = true;
		this.recognition.interimResults = true;
		// default language from browser
		try {
			(this.recognition as any).lang =
				typeof navigator !== "undefined" && navigator.language
					? navigator.language
					: "en-US";
		} catch {}

		this.recognition.onstart = () => {
			this.onStateChangeCallback?.("listening");
		};

		this.recognition.onend = () => {
			this.onStateChangeCallback?.("idle");
		};

		this.recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			this.onStateChangeCallback?.("error");
		};

		this.recognition.onresult = (event) => {
			const transcript = Array.from(event.results)
				.map((result) => result[0].transcript)
				.join("");

			const isFinal = event.results[event.results.length - 1].isFinal;
			this.onTranscriptCallback?.(transcript, isFinal);
		};
	}

	public setOnTranscriptCallback(
		callback: (transcript: string, isFinal: boolean) => void
	) {
		this.onTranscriptCallback = callback;
	}

	public setOnStateChangeCallback(
		callback: (state: "idle" | "listening" | "error") => void
	) {
		this.onStateChangeCallback = callback;
	}

	public setLanguage(lang: string) {
		if (this.recognition) {
			try {
				(this.recognition as any).lang = lang;
			} catch (error) {
				console.error("Error setting language:", error);
			}
		}
	}

	public startListening() {
		if (!this.recognition) {
			console.error("Speech recognition is not supported in this browser");
			this.onStateChangeCallback?.("error");
			return;
		}

		try {
			this.recognition.start();
		} catch (error) {
			console.error("Error starting speech recognition:", error);
			this.onStateChangeCallback?.("error");
		}
	}

	public stopListening() {
		if (this.recognition) {
			try {
				this.recognition.stop();
			} catch (error) {
				console.error("Error stopping speech recognition:", error);
			}
		}
	}

	public isSupported(): boolean {
		return !!this.recognition;
	}
}

export const speechRecognitionService = new SpeechRecognitionService();
