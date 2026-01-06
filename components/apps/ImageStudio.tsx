import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download, X } from 'lucide-react';

interface ImageStudioProps {
    isOpen?: boolean;
    onClose?: () => void;
    onInsert?: (content: string, imageUrl: string) => void;
    initialPrompt?: string;
    initialFile?: File | null;
}

export default function ImageStudio({ isOpen = true, onClose, onInsert, initialPrompt }: ImageStudioProps) {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert('Generación simulada: Image Studio v1.0');
            if (onInsert) onInsert(`Imagen generada: ${prompt}`, 'https://placehold.co/600x400?text=AI+Generated+Image');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6 text-blue-400">
                    <ImageIcon className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Image Studio</h2>
                </div>

                <div className="space-y-4">
                    <textarea
                        className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-blue-500 outline-none h-32 resize-none"
                        placeholder="Describe la imagen que quieres crear..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? 'Generando...' : <><Wand2 className="w-5 h-5" /> Generar Arte</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
