import { useState, useEffect, useCallback, useRef } from "react";

/**
 * VTutor Architecture Step 2: Speech-to-Text
 * Uses Web Speech API (browser-native) to convert voice input to text
 * This completes the input pipeline: voice → text → LLM
 */

export interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + " ";
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          console.log("[VTutor] Speech-to-Text (final):", finalTranscript);
        }
        if (interimTranscript) {
          console.log("[VTutor] Speech-to-Text (interim):", interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("[VTutor] Speech recognition error:", event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log("[VTutor] Speech recognition ended");
        setIsListening(false);
      };
    } else {
      console.warn("[VTutor] Speech Recognition not supported in this browser");
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }

    try {
      console.log("[VTutor] Starting speech-to-text listening...");
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err: any) {
      console.error("[VTutor] Error starting speech recognition:", err);
      setError(err.message);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log("[VTutor] Stopping speech-to-text listening");
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
