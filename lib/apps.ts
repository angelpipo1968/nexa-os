import { LucideIcon } from 'lucide-react';
import { Palette, Globe, GraduationCap, Search, Image as ImageIcon, Video, Code, Calendar, Newspaper, Eye, FileText, PenTool, Zap, Compass, Music, Shield, Leaf, Brain } from 'lucide-react';

export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: any; // LucideIcon type is tricky to import directly sometimes in Next.js edge cases, keeping any for safety or use React.ComponentType
  category: 'creative' | 'productivity' | 'utility' | 'system';
  color: string;
  isOpen: boolean;
  minimized: boolean;
  component?: string; // Key to identify which component to render
}

export const SYSTEM_APPS: AppDefinition[] = [
  {
    id: 'nexa_ai_app',
    name: 'NEXA AI Suite',
    description: 'Centro de Inteligencia y Video',
    icon: Brain,
    category: 'system',
    color: 'text-blue-500 bg-blue-50/10 border-blue-500/20',
    isOpen: false,
    minimized: false,
    component: 'NexaAIApp'
  },
  {
    id: 'nexa_creator',
    name: 'NEXA Creator',
    description: 'Generador de Arte & Diseño (Gratis)',
    icon: Palette,
    category: 'creative',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    isOpen: false,
    minimized: false,
    component: 'NexaCreator'
  },
  {
    id: 'video_gen',
    name: 'Video Gen',
    description: 'Generación de video a partir de texto o imágenes',
    icon: Video,
    category: 'creative',
    color: 'text-red-600 bg-red-50 border-red-200',
    isOpen: false,
    minimized: false,
    component: 'VideoGen'
  },
  {
    id: 'web_dev',
    name: 'Web Dev',
    description: 'Asistente de desarrollo web',
    icon: Globe,
    category: 'productivity',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    isOpen: false,
    minimized: false,
    component: 'WebDev'
  },
  {
    id: 'learn',
    name: 'Aprender',
    description: 'Tutor personal inteligente',
    icon: GraduationCap,
    category: 'productivity',
    color: 'text-green-600 bg-green-50 border-green-200',
    isOpen: false,
    minimized: false,
    component: 'Learn'
  },
  {
    id: 'research',
    name: 'Investigación',
    description: 'Motor de búsqueda profunda',
    icon: Search,
    category: 'productivity',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    isOpen: false,
    minimized: false,
    component: 'Research'
  },
  {
    id: 'code',
    name: 'Código',
    description: 'Editor y asistente de código',
    icon: Code,
    category: 'productivity',
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    isOpen: false,
    minimized: false,
    component: 'CodeEditor'
  },
  {
    id: 'memory_bank',
    name: 'Memoria',
    description: 'Gestión de aprendizaje y recuerdos',
    icon: Shield,
    category: 'system',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    isOpen: false,
    minimized: false,
    component: 'MemoryBank'
  },
  {
    id: 'security',
    name: 'Seguridad',
    description: 'Centro de seguridad y protección',
    icon: Shield,
    category: 'system',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    isOpen: false,
    minimized: false,
    component: 'Security'
  },
  {
    id: 'dev_library',
    name: 'DevLibrary',
    description: 'Biblioteca de código Open Source',
    icon: Globe,
    category: 'productivity',
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    isOpen: false,
    minimized: false,
    component: 'DevLibrary'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Consola del Sistema',
    icon: Code, // Reusing Code icon or similar if Terminal icon not available in import
    category: 'system',
    color: 'text-green-500 bg-black border-green-900',
    isOpen: false,
    minimized: false,
    component: 'Terminal'
  },
  {
    id: 'living_machine',
    name: 'BioCore',
    description: 'Sistema Biológico Digital',
    icon: Leaf,
    category: 'creative',
    color: 'text-green-500 bg-green-50/10 border-green-500/20',
    isOpen: false,
    minimized: false,
    component: 'LivingMachine'
  }
];

export const getAppById = (id: string) => SYSTEM_APPS.find(app => app.id === id);
