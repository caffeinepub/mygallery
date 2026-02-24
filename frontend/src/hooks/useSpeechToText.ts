import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface UseSpeechToTextOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscript, onError, lang } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastProcessedIndexRef = useRef<number>(0);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Only set language if explicitly provided, otherwise use browser/OS default
      if (lang) {
        recognition.lang = lang;
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Process only new results from resultIndex onwards
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            // Only emit final results that we haven't processed yet
            if (i >= lastProcessedIndexRef.current) {
              if (transcript.trim() && onTranscript) {
                onTranscript(transcript.trim(), true);
              }
              lastProcessedIndexRef.current = i + 1;
            }
          } else {
            // Emit interim results for real-time feedback
            if (transcript.trim() && onTranscript) {
              onTranscript(transcript.trim(), false);
            }
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            // User stopped, not an error
            return;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        if (onError) {
          onError(errorMessage);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Reset processed index when recognition ends
        lastProcessedIndexRef.current = 0;
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [lang, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (onError) {
        onError('Speech recognition is not supported in this browser');
      }
      return;
    }

    try {
      // Reset processed index when starting fresh
      lastProcessedIndexRef.current = 0;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) {
        onError('Failed to start speech recognition');
      }
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
