export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type VoiceState = 'idle' | 'processing';

export interface VoiceContextType {
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  clearConversation: () => void;
}