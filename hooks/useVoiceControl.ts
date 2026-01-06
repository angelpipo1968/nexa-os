import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '../lib/voice-service';

export function useVoiceControl(language: 'es' | 'en' | 'zh', onInput: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoVoiceMode, setAutoVoiceMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const autoVoiceModeRef = useRef(autoVoiceMode);
  
  useEffect(() => { autoVoiceModeRef.current = autoVoiceMode; }, [autoVoiceMode]);
  useEffect(() => { localStorage.setItem('nexa_settings_voice', JSON.stringify(voiceEnabled)); }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      const langMap: Record<'es' | 'en' | 'zh', string> = { es: 'es-ES', en: 'en-US', zh: 'zh-CN' };
      recognitionRef.current.lang = langMap[language];

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        stopSpeaking();
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onInput(transcript);
        if (autoVoiceModeRef.current && event.results[0].isFinal) {
          setTimeout(() => {
            const sendBtn = document.getElementById('send-button');
            if (sendBtn) sendBtn.click();
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'network') {
            console.warn('Speech recognition network error (offline or blocked).');
            setError('Modo voz requiere internet (API navegador).');
        } else if (event.error === 'not-allowed') {
            console.warn('Speech recognition permission denied.');
            setError('Permiso de micrófono denegado.');
        } else if (event.error !== 'no-speech') {
            console.error('Speech error:', event.error);
            setError(`Error de voz: ${ event.error } `);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language, onInput, stopSpeaking]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) {
        setError('Navegador no compatible con voz.');
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      recognitionRef.current.start();
    }
  }, [isListening, stopSpeaking]);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled) return;
    
    stopSpeaking();
    setIsSpeaking(true);

    const voices = voiceService.getAvailableVoices();
    let selectedVoice = undefined;
    
    // Find voice for current language if not Spanish (VoiceService defaults to Spanish)
    if (language !== 'es') {
        const prefix = { en: 'en', zh: 'zh' }[language];
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }

    const config = voiceService.getNEXAVoiceConfig();
    if (selectedVoice) {
        config.voice = selectedVoice;
    }

    voiceService.speak(text, config)
      .then(() => {
        setIsSpeaking(false);
        if (autoVoiceModeRef.current) setTimeout(() => toggleVoiceRecognition(), 500);
      })
      .catch((err) => {
        console.error("Error speaking:", err);
        setIsSpeaking(false);
      });
      
  }, [voiceEnabled, language, toggleVoiceRecognition, stopSpeaking]);

  return {
    isListening, toggleVoiceRecognition,
    isSpeaking, speakText, stopSpeaking,
    voiceEnabled, setVoiceEnabled,
    autoVoiceMode, setAutoVoiceMode,
    error, setError
  };
}
