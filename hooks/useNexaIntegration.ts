import { useState } from 'react';
import { aiService, AIMessage } from '../lib/ai-service';
import { nexaPersonality } from '../lib/personality';

export function useNexaIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateVideoConcept = async (userPrompt: string) => {
    setIsProcessing(true);
    
    try {
      const systemPrompt = `Eres un director creativo experto en video y cine, con la personalidad de NEXA AI (${nexaPersonality.tone}).
      Tu objetivo es expandir ideas simples en conceptos visuales detallados.
      Genera un prompt optimizado para modelos de generación de video (como Stable Video Diffusion o MiniMax).`;

      const aiPrompt = `Mejora y expande esta idea para un video: "${userPrompt}". 
      Formato de respuesta deseado:
      1. Prompt Técnico (Inglés): [Prompt detallado para la IA]
      2. Concepto (Español): [Breve explicación creativa]`;
      
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: aiPrompt }
      ]);

      return response;
    } catch (error) {
      console.error("Error generating video concept:", error);
      return "Lo siento, tuve un problema generando el concepto creativo. Intenta ser más específico.";
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeVideoResults = async (videoUrl: string, originalPrompt: string) => {
    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: 'Analiza críticamente videos generados por IA con ojo de director de cine.' },
        { role: 'user', content: `Analiza este video generado: ${videoUrl}. Prompt original: "${originalPrompt}". Da feedback constructivo sobre composición, iluminación y movimiento.` }
      ]);
      return response;
    } catch (error) {
       console.error("Error analyzing video:", error);
       return "No pude analizar el video en este momento.";
    }
  };

  return {
    generateVideoConcept,
    analyzeVideoResults,
    isProcessing
  };
}
