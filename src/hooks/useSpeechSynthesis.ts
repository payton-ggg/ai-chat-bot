import { useEffect } from 'react';
import { useVoice } from '../contexts/VoiceContext';

export const useSpeechSynthesis = () => {
  const { messages, voiceState, setVoiceState } = useVoice();

  useEffect(() => {
    // Check if this is an assistant message and we're in 'speaking' state
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && voiceState === 'speaking') {
      speakText(lastMessage.content);
    }
  }, [messages, voiceState]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      setVoiceState('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Pitch of voice
    utterance.volume = 1.0; // Volume

    // Try to use a nicer voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google') || 
      voice.name.includes('Female')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setVoiceState('idle');
    };

    utterance.onerror = () => {
      console.error('Speech synthesis error');
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  return { speakText };
};