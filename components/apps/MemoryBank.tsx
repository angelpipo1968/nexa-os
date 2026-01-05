import React, { useState, useEffect } from 'react';
import { Shield, X, Trash2, Plus, Save, Brain, Zap, Search as SearchIcon, BookOpen, User, Cpu } from 'lucide-react';
import { MemorySystem, MemoryItem } from '@/lib/memory';

interface MemoryBankProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (content: string, mediaSrc?: string) => void;
  initialFile?: File | null;
}

export default function MemoryBank({ isOpen, onClose, onInsert, initialFile }: MemoryBankProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [activeTab, setActiveTab] = useState<'facts' | 'preferences' | 'research'>('facts');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMemories(MemorySystem.getMemories());
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!newMemory.trim()) return;
    const type = activeTab === 'preferences' ? 'preference' : 'fact';
    MemorySystem.addMemory(newMemory, type);
    setMemories(MemorySystem.getMemories());
    setNewMemory('');
  };

  const handleDelete = (id: string) => {
    MemorySystem.removeMemory(id);
    setMemories(MemorySystem.getMemories());
  };

  const getFilteredMemories = () => {
    return memories.filter(m => {
      // Filter by Search
      if (searchTerm && !m.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by Tab
      if (activeTab === 'research') {
        // Auto-detect research items based on content
        return m.content.toLowerCase().includes('investigando') || 
               m.content.toLowerCase().includes('research') ||
               m.content.includes('[MEMORY: El usuario está investigando');
      } else if (activeTab === 'preferences') {
        return m.type === 'preference';
      } else {
        // Facts (default) - exclude research items to avoid duplication if possible, 
        // or just show everything else here
        const isResearch = m.content.toLowerCase().includes('investigando') || 
                          m.content.toLowerCase().includes('research');
        return m.type === 'fact' && !isResearch;
      }
    });
  };

  const filteredMemories = getFilteredMemories();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300" style={{ backdropFilter: 'none' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Memoria Neuronal
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-indigo-400" />
                </button>
            </div>

            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
                <p className="text-xs text-indigo-600 mb-3">
                    Aquí se almacena lo que NEXA ha aprendido sobre ti. Estos datos se usan para personalizar cada interacción.
                </p>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar en la memoria..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/80"
                    />
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('facts')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'facts' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
                    >
                        <User className="w-3 h-3" />
                        Datos
                    </button>
                    <button 
                        onClick={() => setActiveTab('preferences')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
                    >
                        <Zap className="w-3 h-3" />
                        Gustos
                    </button>
                    <button 
                        onClick={() => setActiveTab('research')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'research' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
                    >
                        <BookOpen className="w-3 h-3" />
                        Investigación
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {filteredMemories.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Brain className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">
                            {searchTerm ? 'No se encontraron memorias.' : 'No hay memorias en esta categoría.'}
                        </p>
                    </div>
                ) : (
                    filteredMemories.map(memory => (
                        <div key={memory.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-3">
                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    memory.type === 'preference' ? 'bg-amber-100 text-amber-600' : 
                                    activeTab === 'research' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                    {memory.type === 'preference' ? <Zap className="w-4 h-4" /> : 
                                     activeTab === 'research' ? <BookOpen className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 leading-relaxed">{memory.content}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                        {new Date(memory.timestamp).toLocaleDateString()}
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        {new Date(memory.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(memory.id)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                                title="Olvidar esta memoria"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newMemory}
                        onChange={(e) => setNewMemory(e.target.value)}
                        placeholder={
                            activeTab === 'preferences' ? "Ej: Prefiero el modo oscuro..." : 
                            activeTab === 'research' ? "Añadir nota de investigación..." : "Ej: Me llamo Alejandro..."
                        }
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button 
                        onClick={handleAdd}
                        disabled={!newMemory.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
