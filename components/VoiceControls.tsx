import React, { useState, useEffect } from 'react';
import { voiceService } from '../lib/voice-service';

export default function VoiceControls({ textToSpeak }: { textToSpeak: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    // Función para actualizar voces
    const updateVoices = () => {
      const availableVoices = voiceService.getAvailableVoices();
      setVoices(availableVoices);
      
      // Si ya hay una seleccionada y existe, mantenerla. Si no, seleccionar español.
      if (!selectedVoice) {
         const spanishVoice = availableVoices.find(voice => 
            voice.lang.includes('es') || voice.lang.includes('ES')
         );
         if (spanishVoice) {
            setSelectedVoice(spanishVoice.name);
         } else if (availableVoices.length > 0) {
            setSelectedVoice(availableVoices[0].name);
         }
      }
    };

    updateVoices();

    // Suscribirse a cambios en voces (si el navegador carga voces asíncronamente)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null; // Cuidado: esto podría sobrescribir otros listeners si no se usa addEventListener
        }
    };
  }, [selectedVoice]); // Re-run logic if selectedVoice changes (though mainly we want to set it if empty)

  const handleSpeak = async () => {
    if (isPlaying) {
      voiceService.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await voiceService.speak(textToSpeak, {
        voice: voices.find(v => v.name === selectedVoice) || undefined,
        ...voiceService.getNEXAVoiceConfig()
      });
      setIsPlaying(false);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    voiceService.setVoice(voiceName);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      <button
        onClick={handleSpeak}
        className={`p-2 rounded-full transition-colors ${
          isPlaying
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
        title={isPlaying ? 'Detener' : 'Hablar'}
      >
        {isPlaying ? '⏹️' : '🎤'}
      </button>
      
      <select
        value={selectedVoice}
        onChange={(e) => handleVoiceChange(e.target.value)}
        className="text-xs bg-gray-700 text-white rounded px-2 py-1 max-w-[200px] truncate"
      >
        {voices.length === 0 && <option>Cargando voces...</option>}
        {voices.map(voice => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
}
