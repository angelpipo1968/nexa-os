export interface VoiceConfig {
  voice: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

export class VoiceService {
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeVoices();
    }
  }

  private initializeVoices() {
    if ('speechSynthesis' in window) {
      // Esperar a que las voces estén cargadas
      const loadVoices = () => {
        this.voices = speechSynthesis.getVoices();
        if (this.voices.length > 0) {
          this.isInitialized = true;
          // Seleccionar voz en español preferida
          this.selectSpanishVoice();
        } else {
          setTimeout(loadVoices, 100);
        }
      };

      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }

  private selectSpanishVoice(): void {
    // Priorizar voces en español
    const spanishVoices = this.voices.filter(voice =>
      voice.lang.includes('es') || voice.lang.includes('ES')
    );

    if (spanishVoices.length > 0) {
      // Preferir Microsoft Helena (Windows) o Google Español
      this.currentVoice = spanishVoices.find(voice =>
        voice.name.includes('Helena') || voice.name.includes('Google')
      ) || spanishVoices[0];
    } else if (this.voices.length > 0) {
      // Fallback a primera voz disponible
      this.currentVoice = this.voices[0];
    }
  }

  speak(text: string, config?: Partial<VoiceConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.currentVoice) {
        // Intentar inicializar de nuevo si no está listo (por si las voces cargaron tarde)
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.voices.length === 0) {
             this.voices = speechSynthesis.getVoices();
             this.selectSpanishVoice();
             if (this.voices.length > 0) this.isInitialized = true;
        }
        
        if (!this.currentVoice) {
            console.warn('Speech synthesis not ready or no voice selected');
            resolve();
            return;
        }
      }

      // Cancelar cualquier habla anterior
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuración de voz
      utterance.voice = config?.voice || this.currentVoice;
      utterance.rate = config?.rate || 0.9; // Velocidad ligeramente más lenta
      utterance.pitch = config?.pitch || 1.1; // Tono ligeramente más alto (más femenino)
      utterance.volume = config?.volume || 0.8;

      // Eventos
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        resolve(); // Resolvemos igual para no bloquear la app
      };

      speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  setVoice(voiceName: string): boolean {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.currentVoice = voice;
      return true;
    }
    return false;
  }

  // Configuración específica para NEXA AI
  getNEXAVoiceConfig(): Partial<VoiceConfig> {
    return {
      rate: 0.85, // Más lento para sonar más natural
      pitch: 1.2, // Tono más alto
      volume: 0.9,
    };
  }
}

export const voiceService = new VoiceService();
