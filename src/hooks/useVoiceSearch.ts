/**
 * Voice Search Hook
 * Provides speech-to-text functionality for search input
 * Uses Web Speech API with fallback and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  finalTranscript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export interface VoiceSearchControls {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  toggleListening: () => void;
}

export interface UseVoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  grammars?: SpeechGrammarList;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface UseVoiceSearchReturn extends VoiceSearchState, VoiceSearchControls {}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}): UseVoiceSearchReturn {
  const {
    language = 'en-US',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    grammars,
    onResult,
    onError,
    onStart,
    onEnd
  } = options;

  const [state, setState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    finalTranscript: '',
    interimTranscript: '',
    error: null,
    confidence: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;
    
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure recognition settings
      recognition.language = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      if (grammars) {
        recognition.grammars = grammars;
      }

      // Handle recognition start
      recognition.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isListening: true, 
          error: null,
          transcript: '',
          finalTranscript: '',
          interimTranscript: ''
        }));
        onStart?.();
      };

      // Handle recognition results
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0;

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          confidence = Math.max(confidence, result[0].confidence || 0);

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;

        setState(prev => ({
          ...prev,
          transcript: fullTranscript,
          finalTranscript,
          interimTranscript,
          confidence,
          error: null
        }));

        // Call result callback
        if (onResult) {
          if (finalTranscript) {
            onResult(finalTranscript, true);
          } else if (interimTranscript) {
            onResult(interimTranscript, false);
          }
        }

        // Auto-stop after getting final result (if not continuous)
        if (!continuous && finalTranscript) {
          recognition.stop();
        }
      };

      // Handle recognition errors
      recognition.onerror = (event) => {
        let errorMessage = 'Voice recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'bad-grammar':
            errorMessage = 'Grammar error in speech recognition.';
            break;
          case 'language-not-supported':
            errorMessage = `Language '${language}' is not supported.`;
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage
        }));

        onError?.(errorMessage);
      };

      // Handle recognition end
      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        
        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        onEnd?.();
      };

      // Handle no match (optional)
      recognition.onnomatch = () => {
        setState(prev => ({
          ...prev,
          error: 'No speech match found. Please try again.'
        }));
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, onError, onStart, onEnd]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      const errorMessage = 'Speech recognition is not supported in this browser.';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      return;
    }

    if (!recognitionRef.current || state.isListening) {
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      recognitionRef.current.start();
      
      // Set a timeout to auto-stop listening after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && state.isListening) {
          recognitionRef.current.stop();
        }
      }, 30000);
    } catch (error) {
      const errorMessage = 'Failed to start voice recognition.';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [state.isSupported, state.isListening, onError]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors during stop
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.isListening]);

  // Reset transcript function
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      finalTranscript: '',
      interimTranscript: '',
      error: null,
      confidence: 0
    }));
  }, []);

  // Toggle listening function
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    toggleListening
  };
}

// Utility function to check speech recognition support
export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Utility function to get supported languages (if available)
export async function getSupportedLanguages(): Promise<string[]> {
  // This is a basic list - actual supported languages depend on the browser and speech service
  return [
    'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
    'es-ES', 'es-MX', 'es-AR',
    'fr-FR', 'fr-CA',
    'de-DE',
    'it-IT',
    'pt-BR', 'pt-PT',
    'ru-RU',
    'ja-JP',
    'ko-KR',
    'zh-CN', 'zh-TW',
    'ar-SA',
    'hi-IN',
    'nl-NL',
    'sv-SE',
    'no-NO',
    'da-DK',
    'fi-FI',
    'pl-PL',
    'tr-TR'
  ];
}

// Type declarations for browsers that don't have SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}