import React, { useState } from 'react';
import { Book, Code, Globe, Search, Download, ExternalLink, Github, Terminal, Database, Cloud, Cpu, Layers } from 'lucide-react';

interface DevLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  initialQuery?: string;
}

const RESOURCES = [
  {
    id: 'react-patterns',
    title: 'React Design Patterns',
    description: 'Colección de patrones de diseño modernos para React (Hooks, HOCs, Render Props).',
    category: 'frontend',
    source: 'GitHub',
    stars: '45k',
    content: `// React Custom Hook Pattern
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
};`
  },
  {
    id: 'python-ai',
    title: 'Python AI Boilerplate',
    description: 'Estructura base para proyectos de IA con PyTorch y Transformers.',
    category: 'ai',
    source: 'HuggingFace',
    stars: '12k',
    content: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class AIModel:
    def __init__(self, model_name="gpt2"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
    
    def generate(self, prompt, max_length=50):
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_length=max_length)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)`
  },
  {
    id: 'nextjs-api',
    title: 'Next.js API Route Handler',
    description: 'Template robusto para endpoints API en Next.js 14+.',
    category: 'backend',
    source: 'Vercel',
    stars: '28k',
    content: `import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate body here
    
    // Perform database operation
    const result = { success: true, data: body };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }`
  },
  {
    id: 'docker-compose',
    title: 'Docker Compose Microservices',
    description: 'Configuración lista para usar de microservicios con Node, Python y Redis.',
    category: 'devops',
    source: 'Docker',
    stars: '15k',
    content: `version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://cache:6379
  worker:
    build: ./worker
    depends_on:
      - cache
  cache:
    image: redis:alpine`
  }
];

export default function DevLibrary({ isOpen, onClose, onInsert, activeCategory: initialCategory, initialQuery }: DevLibraryProps & { activeCategory?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');

  if (!isOpen) return null;

  const filteredResources = RESOURCES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300" style={{ backdropFilter: 'none' }}>
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] border border-slate-700">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-950 flex items-center justify-between">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-3 text-cyan-400">
                <Database className="w-6 h-6" />
                DevLibrary
                <span className="text-xs font-normal text-slate-400 px-2 py-0.5 border border-slate-700 rounded-full">Open Source Hub</span>
             </h2>
             <p className="text-slate-400 text-sm mt-1">Repositorio central de conocimiento y patrones de código</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <span className="sr-only">Cerrar</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Buscar librerías, patrones, snippets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {[
                    { id: 'all', label: 'Todo', icon: Layers },
                    { id: 'frontend', label: 'Frontend', icon: Code },
                    { id: 'backend', label: 'Backend', icon: Database },
                    { id: 'ai', label: 'AI/ML', icon: Cpu },
                    { id: 'devops', label: 'DevOps', icon: Cloud },
                ].map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                            activeCategory === cat.id 
                            ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50' 
                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                        }`}
                    >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${
                                    resource.category === 'frontend' ? 'bg-blue-500/10 text-blue-400' :
                                    resource.category === 'backend' ? 'bg-green-500/10 text-green-400' :
                                    resource.category === 'ai' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {resource.category === 'ai' ? <Cpu className="w-5 h-5" /> : 
                                     resource.category === 'devops' ? <Terminal className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">{resource.title}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Github className="w-3 h-3" /> {resource.source} • ⭐ {resource.stars}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    onInsert(`He integrado el siguiente patrón de ${resource.title} en mi memoria activa:\n\n\`\`\`${resource.category === 'python-ai' ? 'python' : 'javascript'}\n${resource.content}\n\`\`\``);
                                    onClose();
                                }}
                                className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                                title="Importar a NEXA"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{resource.description}</p>
                        
                        <div className="relative bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-hidden group-hover:border-slate-700 transition-colors">
                            <pre className="text-xs font-mono text-slate-300 overflow-x-hidden line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                                {resource.content}
                            </pre>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90 pointer-events-none"></div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredResources.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No se encontraron recursos que coincidan.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function ServerIcon(props: any) {
    return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
          <line x1="6" x2="6.01" y1="6" y2="6" />
          <line x1="6" x2="6.01" y1="18" y2="18" />
        </svg>
    );
}
