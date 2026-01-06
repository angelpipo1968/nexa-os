import React, { useState, useRef, useEffect } from 'react';
import { Zap, Download, Share2, Wand2, Image as ImageIcon, X } from 'lucide-react';

interface LogoForgeProps {
    isOpen?: boolean;
    onClose?: () => void;
    onInsert?: (content: string, imageUrl: string) => void;
    initialPrompt?: string;
    isEmbedded?: boolean;
}

const STYLES = {
    'Cyberpunk': { bg: '#0f172a', text: '#22d3ee', accent: '#d946ef', font: 'Courier New, monospace' },
    'Minimalist': { bg: '#ffffff', text: '#18181b', accent: '#000000', font: 'Inter, sans-serif' },
    'Abstract': { bg: '#18181b', text: '#f472b6', accent: '#8b5cf6', font: 'Arial, sans-serif' },
    '3D': { bg: '#1e293b', text: '#cbd5e1', accent: '#64748b', font: 'Impact, sans-serif' },
    'Organic': { bg: '#14532d', text: '#dcfce7', accent: '#22c55e', font: 'Georgia, serif' }
};

export default function LogoForge({ isOpen = true, onClose, onInsert, initialPrompt, isEmbedded = false }: LogoForgeProps) {
    const [logoText, setLogoText] = useState('NEXA');
    const [logoStyle, setLogoStyle] = useState<keyof typeof STYLES>('Cyberpunk');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setGeneratedLogo(null);

        // Simulate processing time + Canvas Drawing
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const style = STYLES[logoStyle];

            // Clear
            ctx.fillStyle = style.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Background Accent (Abstract Shape)
            ctx.fillStyle = style.accent;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Draw Icon/Shape placeholder based on style
            ctx.strokeStyle = style.text;
            ctx.lineWidth = 8;
            ctx.beginPath();
            if (logoStyle === 'Cyberpunk') {
                ctx.moveTo(150, 200); ctx.lineTo(170, 100); ctx.lineTo(250, 100); ctx.lineTo(230, 200); ctx.closePath();
                ctx.stroke();
            } else if (logoStyle === 'Minimalist') {
                ctx.strokeRect(150, 150, 100, 100);
            } else if (logoStyle === 'Organic') {
                ctx.beginPath();
                ctx.arc(200, 200, 60, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Generic Polygon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    ctx.lineTo(200 + 70 * Math.cos(i * 2 * Math.PI / 6), 200 + 70 * Math.sin(i * 2 * Math.PI / 6));
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Draw Text
            ctx.fillStyle = style.text;
            ctx.font = `bold 48px ${style.font.split(',')[0]}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = style.accent;
            if (logoStyle === 'Cyberpunk') ctx.shadowBlur = 20;
            else ctx.shadowBlur = 0;

            ctx.fillText(logoText, canvas.width / 2, 350);
            ctx.shadowBlur = 0; // Reset

            // Export
            const url = canvas.toDataURL('image/png');
            setGeneratedLogo(url);
            setIsGenerating(false);

            if (onInsert) {
                onInsert(`Logo generado (${logoText} - ${logoStyle})`, url);
            }

        }, 1500);
    };

    const handleDownload = () => {
        if (!generatedLogo) return;
        const a = document.createElement('a');
        a.href = generatedLogo;
        a.download = `nexa-logo-${logoText}-${Date.now()}.png`;
        a.click();
    };

    if (!isOpen) return null;

    return (
        <div className={`${isEmbedded ? 'w-full h-full' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'}`}>
            <div className={`bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col ${isEmbedded ? 'h-full border-0' : 'h-[85vh]'}`}>

                {/* Header (User's Design) */}
                <div className="text-center py-8 relative border-b border-white/5 bg-[#0f172a]/50">
                    {!isEmbedded && onClose && (
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                        <Wand2 className="w-8 h-8 text-pink-500" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                            Generador de Logos IA
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg">Crea identidades visuales únicas potenciadas por redes neuronales</p>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-8">

                    {/* Controls Panel */}
                    <div className="w-full md:w-1/3 bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6 h-fit">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Nombre de la Marca</label>
                            <input
                                type="text"
                                value={logoText}
                                onChange={(e) => setLogoText(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                placeholder="Ej. NEXA Corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Estilo Visual</label>
                            <select
                                value={logoStyle}
                                onChange={(e) => setLogoStyle(e.target.value as any)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer focus:border-purple-500 outline-none appearance-none"
                            >
                                {Object.keys(STYLES).map(s => (
                                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <span className="animate-pulse">Generando...</span>
                            ) : (
                                <><Zap className="w-5 h-5 fill-current" /> Generar Identidad</>
                            )}
                        </button>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {generatedLogo ? (
                            <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
                                <img src={generatedLogo} alt="Generated Logo" className="w-[300px] h-[300px] object-contain drop-shadow-2xl rounded-lg" />
                                <div className="flex items-center gap-3">
                                    <button onClick={handleDownload} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110" title="Descargar">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110" title="Compartir">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-50 space-y-4">
                                {isGenerating ? (
                                    <div className="animate-pulse text-purple-400 font-medium">Procesando vectores...</div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="w-10 h-10 text-white" />
                                        </div>
                                        <p className="text-slate-400">La vista previa aparecerá aquí</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Hidden Canvas for Rendering */}
                        <canvas ref={canvasRef} width={400} height={400} className="hidden" />
                    </div>

                </div>
            </div>
        </div>
    );
}
