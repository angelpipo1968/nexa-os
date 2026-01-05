import React, { useState, useEffect } from 'react';
import { Video, X, Play, Download, CheckCircle2, Plus, Zap, Loader2, Clock, Sparkles, Film, Wand2 } from 'lucide-react';

interface VideoGenProps {
    isOpen?: boolean;
    onClose?: () => void;
    onInsert?: (content: string, videoSrc: string) => void;
    initialFile?: File | null;
    initialPrompt?: string;
    isEmbedded?: boolean;
}

export default function VideoGen({ isOpen = true, onClose, onInsert, initialFile, initialPrompt, isEmbedded = false }: VideoGenProps) {
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [videoGenFile, setVideoGenFile] = useState<File | null>(initialFile || null);
    const [videoPrompt, setVideoPrompt] = useState(initialPrompt || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('');

    const MINIMAX_FALLBACK_KEY = 'sk-api-nIAxAwhsdtpWDEDyLCQmsO0E0HhdncgvjGie0TOZSOT9427oLlS2CH3wHyA90C62cXU7ZkHHWyF4DCBOqJqZS6Yq-R10L_khQ1AV7IpfNd2bw86eGkzAzg0';
    const [minimaxKey, setMinimaxKey] = useState('');
    const [useMiniMax, setUseMiniMax] = useState(true);

    useEffect(() => {
        const storedKey = localStorage.getItem('nexa_minimax_key');
        if (storedKey) {
            setMinimaxKey(storedKey);
        } else {
            setMinimaxKey(MINIMAX_FALLBACK_KEY);
        }
    }, []);

    useEffect(() => {
        if (initialFile) {
            setVideoGenFile(initialFile);
            setMode('image');
        } else if (initialPrompt) {
            setVideoPrompt(initialPrompt);
            setMode('text');
        }
    }, [initialFile, initialPrompt]);

    useEffect(() => {
        if (mode === 'image' && videoGenFile) {
            const url = URL.createObjectURL(videoGenFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (mode === 'image' && !generatedVideo) {
            setPreviewUrl(null);
        }
    }, [videoGenFile, mode, generatedVideo]);

    const saveMinimaxKey = (key: string) => {
        setMinimaxKey(key);
        localStorage.setItem('nexa_minimax_key', key);
    };

    const handleClose = () => {
        if (onClose) onClose();
        setGeneratedVideo(false);
        setVideoPrompt('');
        setVideoGenFile(null);
    };

    const handleInsert = () => {
        if (previewUrl && onInsert) {
             const text = mode === 'text' ? `Video generado: "${videoPrompt}"` : "Video generado desde imagen";
             onInsert(text, previewUrl);
             alert('Video insertado en tu proyecto NEXA');
        }
    };

    // Helper para SVD (Cliente)
    const generateVideoFromImage = async (imageBlob: Blob, hfToken: string): Promise<Blob> => {
        setStatusMessage("Animando mundo (Dreaming in motion)...");
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64data = reader.result;
                try {
                    const response = await fetch(
                        "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt",
                        {
                            headers: {
                                Authorization: hfToken ? `Bearer ${hfToken}` : '',
                                "Content-Type": "application/json"
                            },
                            method: "POST",
                            body: JSON.stringify({
                                inputs: base64data,
                                parameters: {
                                    seed: Math.floor(Math.random() * 100000),
                                    decoding_t: 14,
                                    motion_bucket_id: 127
                                }
                            }),
                        }
                    );
                    if (!response.ok) {
                        if (response.status === 503) throw new Error("Modelo sobrecargado (Cold Boot). Reintenta en 10s.");
                        throw new Error(`Error SVD: ${response.statusText}`);
                    }
                    resolve(await response.blob());
                } catch (e) { reject(e); }
            };
            reader.readAsDataURL(imageBlob);
        });
    };

    // ✅ Función handleGenerate Principal
    const handleGenerate = async () => {
        if ((mode === 'text' && !videoPrompt) || (mode === 'image' && !videoGenFile)) return;

        setIsGenerating(true);
        setStatusMessage('Conectando con NEXA Cloud Engine...');

        try {
            if (mode === 'text') {
                // Caso 1: Texto (MiniMax Backend)
                const formData = new FormData();
                formData.append('prompt', videoPrompt);
                formData.append('model', useMiniMax ? 'hailuo-2.3' : 'svd');
                if (useMiniMax && minimaxKey) {
                    formData.append('apiKey', minimaxKey);
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/generate-video` : '/api/generate-video';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                     const errData = await response.json().catch(() => ({}));
                     throw new Error(errData.error || 'Error en la generación');
                }

                const data = await response.json();
                setPreviewUrl(data.videoUrl);
            } else {
                // Caso 2: Imagen (SVD Cliente - Fallback por ahora)
                // Usamos lógica local porque el backend aún no procesa imágenes pesadas
                const hfToken = localStorage.getItem('nexa_hf_token') || '';
                const videoBlob = await generateVideoFromImage(videoGenFile!, hfToken);
                setPreviewUrl(URL.createObjectURL(videoBlob));
            }

            setGeneratedVideo(true);
            setStatusMessage('¡Video generado por NEXA AI!');
        } catch (error: any) {
            console.error(error);
            setStatusMessage('Error: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    // ✅ Return limpio dentro del componente
    return (
        <div className={`${isEmbedded ? 'w-full h-full' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300'}`}>
            <div className={`${isEmbedded ? 'w-full h-full bg-transparent' : 'bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200'}`}>
                
                {/* Header (Solo si no está embebido) */}
                {!isEmbedded && (
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#151515]">
                        <h3 className="font-bold text-slate-100 flex items-center gap-2">
                            <Film className="w-5 h-5 text-blue-500" />
                            NEXA Motion <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Cloud</span>
                        </h3>
                        <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                )}

                {/* Tabs de Modo */}
                <div className="p-4 flex items-center justify-center gap-4 bg-black/20 border-b border-white/5">
                     <button
                         onClick={() => { setMode('text'); setGeneratedVideo(false); }}
                         className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${mode === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                     >
                         <Sparkles className="w-4 h-4" /> Texto a Video
                     </button>
                     <button
                         onClick={() => { setMode('image'); setGeneratedVideo(false); }}
                         className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${mode === 'image' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                     >
                         <Video className="w-4 h-4" /> Imagen a Video
                     </button>
                </div>

                {/* Contenido Principal */}
                <div className={`p-6 overflow-y-auto flex-1 space-y-6 ${isEmbedded ? 'bg-transparent' : 'bg-[#0C0C0C]'}`}>
                    
                    {/* Mensaje de Estado / Loading */}
                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full"></div>
                            </div>
                            <p className="text-blue-300 font-medium animate-pulse">{statusMessage}</p>
                        </div>
                    )}

                    {/* Vista de Video Generado */}
                    {!isGenerating && generatedVideo ? (
                        <div className="flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-full bg-black/50 rounded-xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
                                <video src={previewUrl || ''} autoPlay loop muted controls className="w-full h-auto max-h-[60vh] object-contain" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">¡Video Listo!</h3>
                                <p className="text-slate-400 text-sm">Tu imaginación ahora está en movimiento.</p>
                            </div>
                            <div className="flex gap-3 w-full max-w-md">
                                <button onClick={() => setGeneratedVideo(false)} className="flex-1 py-3 text-slate-300 font-medium hover:bg-white/5 rounded-xl border border-white/10 transition-colors">
                                    Nuevo
                                </button>
                                <button onClick={handleInsert} className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">
                                    Insertar
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Vista de Formulario (si no está generando ni mostrando resultado) */
                        !isGenerating && (
                            <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                                {mode === 'text' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                                            <span>Modelo: <span className="text-blue-400 font-bold">{useMiniMax ? 'MiniMax Hailuo-2.3' : 'SVD (Legacy)'}</span></span>
                                            <div className="flex items-center gap-2">
                                                <span className={useMiniMax ? 'text-green-400' : 'text-slate-500'}>HD</span>
                                                <button onClick={() => setUseMiniMax(!useMiniMax)} className="hover:text-white underline">Cambiar</button>
                                            </div>
                                        </div>
                                        
                                        {useMiniMax && !minimaxKey && (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-200">
                                                <p className="flex items-center gap-2 font-bold mb-2"><Zap className="w-4 h-4" /> API Key Requerida</p>
                                                <input 
                                                    type="password" 
                                                    placeholder="Pega tu MiniMax API Key..." 
                                                    className="w-full bg-black/30 border border-amber-500/30 rounded p-2 text-white focus:border-amber-500 outline-none"
                                                    onChange={(e) => saveMinimaxKey(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <textarea
                                            value={videoPrompt}
                                            onChange={(e) => setVideoPrompt(e.target.value)}
                                            placeholder="Describe tu escena soñada con detalles cinematográficos..."
                                            className="w-full p-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none h-32 text-base transition-all"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Imagen de referencia</label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-48 ${videoGenFile ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'}`}
                                            onClick={() => document.getElementById('video-upload')?.click()}
                                        >
                                            {videoGenFile ? (
                                                <div className="text-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={previewUrl || ''} alt="Preview" className="h-24 rounded-lg shadow-sm mb-2 object-contain mx-auto" />
                                                    <p className="text-sm font-medium text-slate-200">{videoGenFile.name}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-400">
                                                        <Plus className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-medium">Click para subir imagen</p>
                                                </div>
                                            )}
                                            <input type="file" id="video-upload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setVideoGenFile(e.target.files[0])} />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || (mode === 'text' && !videoPrompt) || (mode === 'image' && !videoGenFile)}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                                        isGenerating || (mode === 'text' && !videoPrompt) || (mode === 'image' && !videoGenFile)
                                        ? 'bg-white/5 cursor-not-allowed text-slate-500'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] shadow-blue-900/20'
                                    }`}
                                >
                                    <Wand2 className="w-5 h-5" />
                                    {isGenerating ? 'Generando...' : 'Generar Video'}
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}