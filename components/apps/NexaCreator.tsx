import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, X, Download, CheckCircle2, Plus, Zap, Loader2, Sliders, Wand2, Monitor, Smartphone, Maximize, Crop, AlertCircle, Settings, Share2, Sparkles, Layers } from 'lucide-react';

interface NexaCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string, imageSrc: string) => void;
  initialFile?: File | null;
  initialPrompt?: string;
  autoRun?: boolean;
  apiKey?: string;
  onSwitchApp?: (appId: string, params: any) => void;
}

export default function NexaCreator({ isOpen, onClose, onInsert, initialFile, initialPrompt, autoRun, apiKey, onSwitchApp }: NexaCreatorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('cinematic');
  const [enhancePrompt, setEnhancePrompt] = useState(true);

  const hasAutoRun = useRef(false);

  useEffect(() => {
    if (autoRun && initialPrompt && !hasAutoRun.current) {
      hasAutoRun.current = true;
      handleGenerate();
    }
  }, [autoRun, initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 1. Mejora de Prompt (Simulada o Real si tuviéramos acceso a LLM aquí, por ahora usamos directivas de estilo)
      let finalPrompt = prompt;
      if (enhancePrompt) {
         const styleKeywords: Record<string, string> = {
            'cinematic': 'cinematic lighting, 8k, highly detailed, photorealistic, movie scene, depth of field',
            'anime': 'anime style, studio ghibli, vibrant colors, detailed lineart, 4k',
            'cyberpunk': 'cyberpunk city, neon lights, futuristic, high tech, dark atmosphere, ray tracing',
            'painting': 'oil painting, digital art, concept art, matte painting, masterpiece',
            'minimalist': 'minimalist, clean lines, simple shapes, pastel colors, vector art',
            '3d': '3d render, blender, unreal engine 5, octane render, isometric'
         };
         finalPrompt = `${prompt}, ${styleKeywords[style] || ''}, best quality`;
      }

      // 2. Construir URL de Pollinations.ai
      // Formato: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&seed={seed}&nologo=true
      const width = aspectRatio === '16:9' ? 1280 : aspectRatio === '9:16' ? 720 : 1024;
      const height = aspectRatio === '16:9' ? 720 : aspectRatio === '9:16' ? 1280 : 1024;
      const randomSeed = Math.floor(Math.random() * 10000000);
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&model=flux`;

      // 3. Precargar la imagen para asegurar que está lista
      const img = new Image();
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Error al generar la imagen. El servidor puede estar ocupado."));
      });

      setGeneratedImage(imageUrl);
      setSeed(randomSeed);

    } catch (err: any) {
      console.error("Error generation:", err);
      setError("No se pudo generar la imagen. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexa-creation-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed", e);
      window.open(generatedImage, '_blank');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'animate-in fade-in zoom-in-95 duration-200' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar de Controles */}
        <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">NEXA Creator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Prompt Creativo</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe tu imaginación..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Estilo</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cinematic', 'Anime', 'Cyberpunk', 'Painting', 'Minimalist', '3D'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s.toLowerCase())}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${style === s.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Formato</label>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                {['1:1', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${aspectRatio === ratio ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">Mejora Mágica</span>
              <button
                onClick={() => setEnhancePrompt(!enhancePrompt)}
                className={`w-10 h-5 rounded-full relative transition-colors ${enhancePrompt ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enhancePrompt ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-auto"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGenerating ? 'Creando...' : 'Generar Arte'}
            </button>
          </div>
        </div>

        {/* Área de Visualización */}
        <div className="flex-1 bg-black/50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Grid de fondo */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            {generatedImage ? (
                <div className="relative group max-w-full max-h-full">
                    <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full max-h-[70vh] rounded-xl shadow-2xl border border-white/10"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleDownload} className="p-2 bg-black/60 backdrop-blur-md text-white rounded-lg hover:bg-black/80 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                        <button onClick={() => onInsert(`![${prompt}](${generatedImage})`, generatedImage)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4 opacity-50">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <ImageIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-lg font-light">Tu lienzo digital está vacío</p>
                    <p className="text-slate-600 text-sm">Escribe un prompt y deja que la IA haga su magia</p>
                </div>
            )}

            {error && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
        >
            <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
