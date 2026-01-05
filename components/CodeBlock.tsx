import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Check, Copy, Maximize, Monitor, Smartphone, Globe, X, Code, Download, GripVertical, Split } from 'lucide-react';

export const CodeBlock = ({ language, code }: { language: string, code: string }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

    // Split View State
    const [splitRatio, setSplitRatio] = useState(50); // Percentage for code width
    const splitRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Download Handler
    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexa-code-${Date.now()}.${language || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Determine if code is previewable (HTML, SVG, XML)
    const isPreviewable = ['html', 'svg', 'xml'].includes(language.toLowerCase()) ||
        (language === '' && code.trim().startsWith('<'));

    // Split view dragging logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const width = window.innerWidth;
            const newRatio = (e.clientX / width) * 100;
            if (newRatio > 20 && newRatio < 80) setSplitRatio(newRatio);
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    return (
        <>
            <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md group/block">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">{language || 'code'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPreviewable && (
                            <>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-all ${showPreview
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-blue-600 hover:bg-white'
                                        }`}
                                >
                                    {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">{showPreview ? 'Ocultar' : 'Vista Previa'}</span>
                                </button>
                                {showPreview && (
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500 hover:text-purple-600 hover:bg-white rounded-md transition-all"
                                        title="Pantalla Dividida / Completa"
                                    >
                                        <Split className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                            title="Descargar archivo"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500 hover:text-green-600 hover:bg-white rounded-md transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Inline Preview Mode */}
                {showPreview && !isFullscreen ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 h-[400px] divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="relative group overflow-hidden">
                            <pre className="p-4 h-full overflow-auto text-sm font-mono text-gray-800 bg-gray-50 whitespace-pre scrollbar-thin scrollbar-thumb-gray-300">
                                {code}
                            </pre>
                        </div>
                        <iframe
                            srcDoc={code}
                            className="w-full h-full border-0 bg-white"
                            sandbox="allow-scripts"
                            title="Preview"
                        />
                    </div>
                ) : (
                    <div className="relative max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
                        <pre className="p-4 text-sm font-mono text-gray-800 bg-gray-50 whitespace-pre">
                            {code}
                        </pre>
                    </div>
                )}
            </div>

            {/* FULLSCREEN SPLIT VIEW MODE */}
            {isFullscreen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col animate-in fade-in duration-200 font-sans">

                    {/* Header Fullscreen */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Split className="w-5 h-5 text-purple-600" />
                                Editor Avanzado
                            </h3>
                            <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setDeviceMode('desktop')}
                                    className={`p-1.5 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Vista PC"
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeviceMode('mobile')}
                                    className={`p-1.5 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Vista Móvil"
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Descargar</span>
                            </button>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors"
                                title="Cerrar Editor"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Split Content */}
                    <div className="flex-1 flex overflow-hidden relative" ref={splitRef}>

                        {/* Left Panel: Code */}
                        <div className="bg-[#1e1e1e] text-blue-100 overflow-auto scrollbar-thin scrollbar-thumb-gray-600" style={{ width: `${splitRatio}%` }}>
                            <div className="sticky top-0 bg-[#2d2d2d] text-gray-400 text-xs px-4 py-2 border-b border-gray-700 flex justify-between">
                                <span>EDITOR ({language})</span>
                                <span>Lectura</span>
                            </div>
                            <pre className="p-4 font-mono text-sm leading-relaxed whitespace-pre font-medium text-[#d4d4d4]">
                                {code}
                            </pre>
                        </div>

                        {/* Dragger */}
                        <div
                            className="w-4 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center transition-colors shadow-inner z-10"
                            onMouseDown={() => setIsDragging(true)}
                        >
                            <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Right Panel: Preview */}
                        <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col" style={{ width: `${100 - splitRatio}%` }}>
                            <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex justify-between">
                                <span>VISTA PREVIA EN VIVO</span>
                                <span>{deviceMode}</span>
                            </div>
                            <div className={`flex-1 overflow-auto flex justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 p-4 transition-all duration-300`}>
                                <div className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-in-out border border-gray-200 relative ${deviceMode === 'mobile'
                                    ? 'w-[375px] h-[667px] rounded-[3rem] border-[12px] border-gray-800 shadow-xl ring-2 ring-gray-900/10'
                                    : 'w-full h-full rounded-none shadow-none border-0'
                                    }`}>
                                    <iframe
                                        srcDoc={code}
                                        className="w-full h-full bg-white"
                                        sandbox="allow-scripts"
                                        title="Full Preview"
                                    />
                                    {deviceMode === 'mobile' && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10 pointer-events-none"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-white border-t border-gray-200 px-4 py-1 text-[10px] text-gray-400 flex justify-between">
                        <span>NEXA BUILDER v5.0</span>
                        <span>Arrastra la barra gris central para redimensionar</span>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
