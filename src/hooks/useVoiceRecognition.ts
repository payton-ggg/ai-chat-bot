import { useState, useEffect, useRef } from 'react';
import { useVoice } from '../contexts/VoiceContext';
import { processTranscript } from '../services/ioNet';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 10000; // 10 seconds

export const useVoiceRecognition = () => {
  const { addMessage, isRecording, setVoiceState } = useVoice();
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<number>();
  const currentRetryDelayRef = useRef(INITIAL_RETRY_DELAY);

  const checkNetworkStatus = () => {
    return navigator.onLine;
  };

  const resetRetryState = () => {
    retryCountRef.current = 0;
    currentRetryDelayRef.current = INITIAL_RETRY_DELAY;
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
  };

  const initializeRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        resetRetryState();
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        
        setTranscript(transcriptText);
        
        if (result.isFinal) {
          handleFinalTranscript(transcriptText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'network') {
          handleNetworkError();
        } else {
          setVoiceState('idle');
          addMessage('system', 'Speech recognition error occurred. Please try again.');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (isRecording && !retryTimeoutRef.current) {
          if (checkNetworkStatus()) {
            recognition.start();
          } else {
            handleNetworkError();
          }
        }
      };
    } else {
      console.error('Speech recognition not supported in this browser');
      addMessage('system', 'Speech recognition is not supported in your browser. Please try using a modern browser like Chrome.');
    }
  };

  const handleNetworkError = () => {
    if (!checkNetworkStatus()) {
      setVoiceState('idle');
      addMessage('system', 'You appear to be offline. Please check your internet connection.');
      resetRetryState();
      return;
    }

    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1;
      addMessage('system', `Network error occurred. Attempting to reconnect... (Attempt ${retryCountRef.current}/${MAX_RETRIES})`);
      
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }

      const delay = Math.min(currentRetryDelayRef.current * 2, MAX_RETRY_DELAY);
      currentRetryDelayRef.current = delay;

      retryTimeoutRef.current = window.setTimeout(() => {
        if (isRecording && recognitionRef.current && checkNetworkStatus()) {
          console.log(`Retrying speech recognition (Attempt ${retryCountRef.current}, Delay: ${delay}ms)`);
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error during retry:', error);
          }
        }
        retryTimeoutRef.current = undefined;
      }, delay);
    } else {
      setVoiceState('idle');
      addMessage('system', 'Maximum retry attempts reached. Please try again later.');
      resetRetryState();
    }
  };

  useEffect(() => {
    initializeRecognition();

    const handleOnline = () => {
      addMessage('system', 'Network connection restored. Voice recognition will resume.');
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    const handleOffline = () => {
      addMessage('system', 'Network connection lost. Voice recognition paused.');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      if (checkNetworkStatus()) {
        try {
          recognition.start();
        } catch (error) {
          if ((error as Error).message !== 'Failed to execute \'start\' on \'SpeechRecognition\': recognition has already started.') {
            console.error('Error starting recognition:', error);
          }
        }
      } else {
        addMessage('system', 'Cannot start voice recognition while offline. Please check your internet connection.');
        setVoiceState('idle');
      }
    } else {
      recognition.stop();
      if (transcript) {
        handleFinalTranscript(transcript);
      }
      resetRetryState();
    }
  }, [isRecording]);

  const handleFinalTranscript = async (finalTranscript: string) => {
    if (!finalTranscript.trim()) return;

    setVoiceState('processing');
    addMessage('user', finalTranscript);

    try {
      const response = await processTranscript(finalTranscript);
      setVoiceState('idle');
      addMessage('assistant', response);
    } catch (error) {
      console.error('Error processing transcript:', error);
      setVoiceState('idle');
    }
  };

  return { transcript };
};

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}