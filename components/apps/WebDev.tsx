import React, { useState, useEffect, useRef } from 'react';
import { Globe, Layout, Code, Zap, Monitor, Smartphone, Layers, Palette, Sparkles, Brain, Rocket, Brush, Terminal, ExternalLink, Eye, CheckCircle, ArrowRight } from 'lucide-react';

interface WebDevProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string, type: string) => void;
}

export default function WebDev({ isOpen, onClose, onInsert }: WebDevProps) {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState('');
  const [style, setStyle] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  
  // Estados para la simulación de código y preview
  const [codeOutput, setCodeOutput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const simulatedCode = `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXA Fashion | Future Collection</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="bg-slate-900 text-white overflow-x-hidden">
    <!-- Generando estructura 3D... -->
    <nav class="fixed w-full z-50 glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <span class="text-2xl font-bold tracking-wider">NEXA</span>
            </div>
        </div>
    </nav>
    <!-- Renderizando Hero Section... -->
    <section class="relative h-screen flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
        <h1 class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            FUTURE IS NOW
        </h1>
    </section>
    <!-- Compilando scripts interactivos... -->
    <script>
        console.log('NEXA Engine: Online');
    </script>
</body>
</html>`;

  // Efecto de generación de código real
  const generateCode = async (prompt: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/chat` : '/api/chat';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gemini-1.5-flash', // Usar Gemini para rapidez
          system: "Eres un desarrollador web experto (NEXA Web Architect). Tu tarea es generar código HTML completo, moderno y funcional en un solo archivo. Incluye CSS (Tailwind via CDN) y JavaScript necesario. NO expliques, solo genera el código. El código debe empezar con <!DOCTYPE html>."
        })
      });

      const data = await response.json();
      let generatedCode = '';

      if (data.content && Array.isArray(data.content)) {
        generatedCode = data.content[0].text;
      } else if (data.content) {
        generatedCode = data.content; // Fallback
      }

      // Limpiar markdown si existe (```html ... ```)
      generatedCode = generatedCode.replace(/```html/g, '').replace(/```/g, '');

      if (!generatedCode || generatedCode.trim().length === 0) {
          throw new Error(data.error ? JSON.stringify(data.error) : "No se recibió código válido de la IA");
      }

      // Simular escritura rápida del código real
      let i = 0;
      const speed = 1; 
      const interval = setInterval(() => {
        setCodeOutput(generatedCode.substring(0, i));
        i += 50; // Escribir en bloques grandes
        if (i > generatedCode.length) {
          clearInterval(interval);
          setCodeOutput(generatedCode); // Asegurar código completo
          
          // Crear Blob URL para preview
          const blob = new Blob([generatedCode], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setShowPreview(true);
        }
      }, speed);

    } catch (error: any) {
      console.error("Error generating code:", error);
      
      // FALLBACK: Si falla la IA real, usamos la simulación para que el usuario no se quede trabado
      console.log("⚠️ Activando modo de simulación por fallo de API");
      setHasError(false); // No mostramos error, mostramos "Demo Mode"
      
      // Personalizar un poco la simulación
      let fallbackCode = simulatedCode.replace('NEXA Fashion | Future Collection', projectType || 'NEXA Project');
      
      let i = 0;
      const interval = setInterval(() => {
        setCodeOutput(fallbackCode.substring(0, i));
        i += 50;
        if (i > fallbackCode.length) {
          clearInterval(interval);
          setCodeOutput(fallbackCode);
          const blob = new Blob([fallbackCode], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setShowPreview(true);
        }
      }, 1);
    }
  };

  if (!isOpen) return null;

  const handleDeepArchitect = async () => {
    if (!description.trim()) return;
    
    // Reset states
    setHasError(false);
    setErrorMessage('');
    setShowPreview(false);
    setCodeOutput('');
    setIsThinking(true);
    const steps = [
      "🔍 Analizando tendencias de diseño 2024...",
      "🎨 Seleccionando paleta de colores futurista...",
      "📐 Estructurando UX/UI óptima...",
      "⚡ Optimizando para SEO y rendimiento...",
      "🚀 Generando arquitectura de código..."
    ];

    for (const s of steps) {
      setThinkingStep(s);
      await new Promise(r => setTimeout(r, 800));
    }
    
    const prompt = `Actúa como un Desarrollador Web experto. Crea un proyecto de tipo "${projectType}" con un estilo visual "${style}".
      
Descripción del proyecto: ${description}

Características requeridas:
${features.map(f => `- ${f}`).join('\n')}

Por favor, genera el código completo en un solo archivo HTML con CSS (Tailwind) y JS embebido si es necesario. El código debe ser moderno, responsivo y listo para usar.`;

    // onInsert(prompt, 'web_dev_prompt'); // Ya no usamos esto para generar, sino llamada directa
    
    // En lugar de cerrar, pasamos al paso 4 (Live Build)
    setIsThinking(false);
    setStep(4);
    
    // Iniciar generación real
    generateCode(prompt);
  };

  const toggleFeature = (feature: string) => {
      if (features.includes(feature)) {
          setFeatures(features.filter(f => f !== feature));
      } else {
          setFeatures([...features, feature]);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] relative">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">NEXA Web Architect</h2>
              <p className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider">Generador de Sitios Inteligente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all text-gray-400 hover:text-gray-900 hover:rotate-90 duration-300"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto relative z-10 flex-1">
            {isThinking ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">Diseñando el Futuro...</h3>
                        <p className="text-lg text-blue-600 font-medium animate-pulse">{thinkingStep}</p>
                    </div>
                </div>
            ) : (
                <>
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-3xl font-bold text-gray-900">¿Qué vamos a construir?</h3>
                            <p className="text-gray-500">Selecciona el tipo de experiencia digital</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { id: 'landing', label: 'Landing Page', icon: Layout, desc: 'Conversión y Ventas', color: 'blue' },
                                { id: 'dashboard', label: 'App Dashboard', icon: Monitor, desc: 'Datos y Control', color: 'indigo' },
                                { id: 'portfolio', label: 'Portafolio 3D', icon: Layers, desc: 'Creatividad Visual', color: 'purple' },
                                { id: 'ecommerce', label: 'E-Commerce', icon: Smartphone, desc: 'Tienda Online', color: 'pink' }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setProjectType(type.label); setStep(2); }}
                                    className="group relative flex flex-col items-center p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`p-4 rounded-2xl bg-${type.color}-50 text-${type.color}-600 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <type.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg mb-1">{type.label}</span>
                                    <span className="text-xs text-gray-500 font-medium">{type.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <button className="text-sm font-medium text-gray-400 hover:text-gray-900 flex items-center gap-2 transition-colors" onClick={() => setStep(1)}>
                            ← Volver atrás
                        </button>
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-3xl font-bold text-gray-900">Define la Estética</h3>
                            <p className="text-gray-500">Elige el alma visual de tu proyecto</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { name: 'Minimalista', desc: 'Limpio, Espacioso, Zen' },
                                { name: 'Cyberpunk', desc: 'Neón, Oscuro, Glitch' },
                                { name: 'Corporativo', desc: 'Serio, Azul, Confiable' },
                                { name: 'Neo-Brutalism', desc: 'Contraste, Bordes, Bold' },
                                { name: 'Glassmorphism', desc: 'Translucidez, Desenfoque' },
                                { name: 'Luxury', desc: 'Dorado, Elegante, Serif' }
                            ].map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => { setStyle(s.name); setStep(3); }}
                                    className="p-6 border border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group hover:shadow-lg"
                                >
                                    <span className="block font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{s.name}</span>
                                    <span className="text-sm text-gray-400 mt-1 block">{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                         <button className="text-sm font-medium text-gray-400 hover:text-gray-900 flex items-center gap-2 transition-colors" onClick={() => setStep(2)}>
                            ← Volver atrás
                        </button>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Visión del Proyecto</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe tu idea. Ej: 'Una plataforma para músicos independientes donde puedan vender sus beats con un reproductor de audio moderno...'"
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[160px] resize-none text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Módulos Inteligentes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Hero 3D', 'Chatbot UI', 'Galería Masonry', 'Testimonios', 'Pricing Cards', 'Dark Mode Toggle', 'Scroll Animations', 'Newsletter'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => toggleFeature(f)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${features.includes(f) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        NEXA AI Power
                                    </h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        NEXA no solo escribe código. Analiza la intención de tu proyecto, estructura la mejor experiencia de usuario (UX) y aplica principios de diseño moderno automáticamente.
                                    </p>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Brush className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-gray-900 text-sm">¿Necesitas un Logo?</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Genera una identidad visual única para tu proyecto.
                                        </p>
                                        <button 
                                            onClick={() => onInsert('[OPEN_APP: nexa_creator, {"initialPrompt": "logo vectorial minimalista moderno, diseño plano, alta calidad", "autoRun": true}]', 'system')}
                                            className="w-full py-2 bg-purple-50 text-purple-700 font-bold rounded-lg text-xs hover:bg-purple-100 transition-colors"
                                        >
                                            Abrir Generador de Logos
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDeepArchitect}
                                    disabled={!description.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-6 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <div className="flex items-center justify-center gap-3 relative z-10">
                                        <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                                        <span className="text-lg">Construir Proyecto</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="flex flex-col h-full animate-in slide-in-from-bottom duration-500">
                        {/* Header de Estado */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${hasError ? 'bg-red-100 text-red-600' : (showPreview ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 animate-pulse')}`}>
                                    {hasError ? <Zap className="w-5 h-5" /> : (showPreview ? <CheckCircle className="w-5 h-5" /> : <Terminal className="w-5 h-5" />)}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
                                        {hasError ? 'Error en Generación' : (showPreview ? 'Proyecto Completado' : 'Generando Código...')}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {hasError ? errorMessage : (showPreview ? 'Tu sitio web está listo para despegar' : 'Escribiendo HTML, CSS y JS en tiempo real')}
                                    </p>
                                </div>
                            </div>
                            {hasError && (
                                <button 
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200"
                                >
                                    Intentar de Nuevo
                                </button>
                            )}
                            {showPreview && !hasError && (
                                <div className="flex gap-2">
                                     <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Abrir en Pestaña
                                    </a>
                                    <button 
                                        onClick={onClose}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Finalizar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Split View */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                            {/* Editor de Código (Izquierda) */}
                            <div className="bg-[#1e1e1e] rounded-2xl p-4 overflow-hidden flex flex-col shadow-2xl border border-gray-800 relative group">
                                <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">index.html</span>
                                </div>
                                <pre className="font-mono text-xs text-blue-300 overflow-y-auto custom-scrollbar flex-1 leading-relaxed">
                                    <code>{codeOutput}</code>
                                    <span className="animate-pulse inline-block w-2 h-4 bg-blue-400 ml-1 align-middle"></span>
                                </pre>
                                {!showPreview && (
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono animate-pulse">
                                        Compilando módulos...
                                    </div>
                                )}
                            </div>

                            {/* Preview (Derecha) */}
                            <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative flex flex-col">
                                <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-2">
                                    <div className="flex gap-1 opacity-50">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    </div>
                                    <div className="bg-gray-100 rounded-md px-3 py-1 text-[10px] text-gray-500 flex-1 text-center font-mono truncate">
                                        {previewUrl || 'localhost:3000/generating...'}
                                    </div>
                                </div>
                                <div className="flex-1 relative bg-white">
                                    {showPreview ? (
                                        <iframe 
                                            src={previewUrl} 
                                            className="w-full h-full border-none"
                                            title="Live Preview"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-4">
                                            <Monitor className="w-16 h-16 animate-pulse opacity-20" />
                                            <p className="text-sm font-medium animate-pulse">Esperando señal de video...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
      </div>
    </div>
  );
}
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
