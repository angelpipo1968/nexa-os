import React, { useState } from 'react';
import { Search, Globe, FileText, Database, ArrowRight, Loader2, BookOpen, Share2, Download, Copy } from 'lucide-react';

interface ResearchProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string, type?: 'text' | 'image' | 'video' | 'code' | 'system') => void;
}

export default function Research({ isOpen, onClose, onInsert }: ResearchProps) {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep' | 'academic'>('deep');
  const [sources, setSources] = useState<'all' | 'academic' | 'news' | 'library' | 'dev'>('all');
  const [engine, setEngine] = useState<'google' | 'bing' | 'ddg' | 'scholar'>('google');
  const [saveToMemory, setSaveToMemory] = useState(true);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!query.trim()) return;

    let prompt = '';
    let sourceText = '';

    switch (sources) {
      case 'academic': sourceText = 'fuentes académicas, papers y revistas científicas'; break;
      case 'news': sourceText = 'noticias recientes, periódicos y medios verificados'; break;
      case 'library': sourceText = 'bibliotecas digitales, libros, archivos históricos y bases de datos de conocimiento universal'; break;
      case 'dev': sourceText = 'documentación técnica, repositorios (GitHub), StackOverflow y foros de desarrollo'; break;
      default: sourceText = 'todo el internet, incluyendo web, noticias, enciclopedias y blogs confiables';
    }

    switch (depth) {
      case 'quick':
        prompt = `Realiza una búsqueda rápida en ${engine} sobre "${query}". Dame una respuesta directa y precisa.`;
        break;
      case 'deep':
        prompt = `Actúa como un motor de búsqueda avanzado conectado a ${sourceText}. Realiza una investigación profunda sobre "${query}".
        
Estructura de respuesta requerida:
1. **Resumen Ejecutivo**: Respuesta directa a la consulta.
2. **Análisis Detallado**: Desglose de la información encontrada.
3. **Fuentes y Enlaces**: Lista de enlaces relevantes simulados o reales. Usa el formato: [LINK: url | Título del recurso].
4. **Acciones Sugeridas**: Qué hacer con esta información.

Asegúrate de que la información sea fácil de copiar y compartir.`;
        break;
      case 'academic':
        prompt = `Realiza una búsqueda académica (tipo Google Scholar) sobre "${query}". Genera un informe con citas, metodología y referencias. Enfócate en ${sourceText}. Incluye enlaces a papers o artículos en formato [LINK: url | Título].`;
        break;
    }

    if (saveToMemory) {
      prompt += `\n\n[MEMORY: Investigando "${query}" en fuentes ${sources}]`;
    }

    onInsert(prompt, 'system');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
          <div className="flex items-center gap-2 text-blue-400">
            <Globe className="w-5 h-5 animate-pulse" />
            <h2 className="font-semibold tracking-wide">NEXA NEURAL SEARCH</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="sr-only">Cerrar</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protocolo de Búsqueda</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ingresa parámetros de búsqueda..."
                className="w-full pl-9 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all shadow-inner text-slate-200 placeholder-slate-600"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="space-y-5">
            {/* Engines */}
            <div className="flex gap-2 p-1 bg-[#111] rounded-lg overflow-x-auto no-scrollbar border border-white/5">
              {[
                { id: 'google', label: 'Google Neural', icon: 'G' },
                { id: 'bing', label: 'Bing Net', icon: 'B' },
                { id: 'ddg', label: 'DuckDuckGo', icon: 'D' },
                { id: 'scholar', label: 'Scholar Base', icon: 'S' }
              ].map(e => (
                <button
                  key={e.id}
                  onClick={() => setEngine(e.id as any)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${engine === e.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profundidad de Análisis</label>
                <div className="space-y-1">
                  {[
                    { id: 'quick', label: '⚡ Rápida' },
                    { id: 'deep', label: '🧠 Profunda' },
                    { id: 'academic', label: '🎓 Académica' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDepth(d.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${depth === d.id ? 'bg-blue-900/10 border-blue-500/30 text-blue-300' : 'border-transparent hover:bg-white/5 text-slate-500'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuente de Datos</label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: '🌐 Global Web' },
                    { id: 'library', label: '📚 Nexus Library' },
                    { id: 'news', label: '📰 Live News' },
                    { id: 'dev', label: '💻 Dev Network' },
                    { id: 'academic', label: '🔬 Research' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSources(s.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${sources === s.id ? 'bg-cyan-900/10 border-cyan-500/30 text-cyan-300' : 'border-transparent hover:bg-white/5 text-slate-500'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
            <Share2 className="w-4 h-4 shrink-0" />
            <p>Activar <strong>Neural Link</strong> permitirá integrar resultados externos en la memoria.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f0f0f] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-medium hover:text-white transition-colors"
          >
            Abortar
          </button>
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Search className="w-4 h-4" />
            Iniciar Búsqueda
          </button>
        </div>
      </div>
    </div>
  );
}
