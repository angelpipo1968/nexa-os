import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceControl(language = 'es', onInput) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onInput) onInput(transcript);
        setError(null);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        // Translate common errors to user-friendly messages
        let message = 'Error de voz';
        if (event.error === 'network') message = 'Sin conexión';
        if (event.error === 'not-allowed') message = 'Permiso denegado';
        if (event.error === 'no-speech') message = 'No se escuchó nada';
        
        console.warn('Speech recognition status:', event.error); // Warn instead of error
        setError(message);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    } else {
      setError('No compatible');
    }
  }, [language, onInput]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) {
        setError('No soportado');
        return;
    }
    
    try {
        if (isListening) {
          recognitionRef.current.stop();
        } else {
          setError(null);
          recognitionRef.current.start();
        }
    } catch (e) {
        console.warn("Voice toggle error:", e);
        // Reset if stuck
        setIsListening(false);
    }
  }, [isListening]);

  return { isListening, toggleVoiceRecognition, error };
}