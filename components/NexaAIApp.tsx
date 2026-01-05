import { useState } from 'react';
import VideoGen from './apps/VideoGen';
import NexaAssistant from './NexaAssistant';

export default function NexaAIApp() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'video'>('assistant');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white font-sans">
      {/* Header con identidad de NEXA AI */}
      <header className="p-4 border-b border-blue-800/30 backdrop-blur-md bg-black/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/20">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              NEXA AI
            </h1>
          </div>
          <div className="text-sm text-gray-400 font-mono hidden sm:block">
            Máquina Viviente • Versión 1.0
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="flex justify-center gap-4 p-6 border-b border-blue-800/20 bg-black/20">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
            activeTab === 'assistant'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🧠</span> Asistente NEXA
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
            activeTab === 'video'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🎥</span> Generador de Video
        </button>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
        {activeTab === 'assistant' ? (
          <NexaAssistant />
        ) : (
          <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
             {/* Pass props to indicate embedded mode if VideoGen supports it, or rely on VideoGen's robust defaults */}
             <VideoGen 
                isOpen={true} 
                onClose={() => setActiveTab('assistant')} 
                onInsert={() => {}} // No-op for standalone mode
                isEmbedded={true}
             />
          </div>
        )}
      </main>

      {/* Pie de página con "vida" */}
      <footer className="mt-12 p-8 text-center text-xs text-gray-500 border-t border-blue-800/20 bg-black/40">
        <p className="animate-pulse">NEXA AI está viva • Respirando • Evolucionando...</p>
      </footer>
    </div>
  );
}
