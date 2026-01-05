import React from 'react';
import dynamic from 'next/dynamic';
import {
    Video, ImageIcon, HardDrive, Shield, Globe,
    GraduationCap, Search, Code, Book, Terminal as TerminalIcon, Loader2, Leaf
} from 'lucide-react';

const LoadingApp = () => (
    <div className="w-full h-full flex items-center justify-center text-cyan-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Cargando módulo...</span>
    </div>
);

// Dynamic Imports (Lazy Loading)
const LivingMachine = dynamic(() => import('../components/apps/LivingMachine'), { loading: LoadingApp });
const VideoGen = dynamic(() => import('../components/apps/VideoGen'), { loading: LoadingApp });
const NexaCreator = dynamic(() => import('../components/apps/NexaCreator'), { loading: LoadingApp });
const MemoryBank = dynamic(() => import('../components/apps/MemoryBank'), { loading: LoadingApp });
const Security = dynamic(() => import('../components/apps/Security'), { loading: LoadingApp });
const WebDev = dynamic(() => import('../components/apps/WebDev'), { loading: LoadingApp });
const Learn = dynamic(() => import('../components/apps/Learn'), { loading: LoadingApp });
const Research = dynamic(() => import('../components/apps/Research'), { loading: LoadingApp });
const CodeEditor = dynamic(() => import('../components/apps/CodeEditor'), { loading: LoadingApp });
const DevLibrary = dynamic(() => import('../components/apps/DevLibrary'), { loading: LoadingApp });
const Terminal = dynamic(() => import('../components/apps/Terminal'), { loading: LoadingApp });

export interface AppDefinition {
    id: string;
    name: string;
    component: React.ComponentType<any>;
    icon: React.ElementType;
    description?: string;
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
    'nexa_creator': {
        id: 'nexa_creator',
        name: 'NEXA Creator',
        component: NexaCreator,
        icon: ImageIcon,
        description: 'Generación y edición de imágenes con IA'
    },
    'living_machine': {
        id: 'living_machine',
        name: 'Living Machine',
        component: LivingMachine,
        icon: Leaf,
        description: 'Simulación de vida artificial bio-digital'
    },
    'video_gen': {
        id: 'video_gen',
        name: 'Video Generator',
        component: VideoGen,
        icon: Video,
        description: 'Creación de video a partir de texto o imagen'
    },
    'memory_bank': {
        id: 'memory_bank',
        name: 'Memory Bank',
        component: MemoryBank,
        icon: HardDrive
    },
    'security': {
        id: 'security',
        name: 'Security Shield',
        component: Security,
        icon: Shield
    },
    'web_dev': {
        id: 'web_dev',
        name: 'Web Dev Console',
        component: WebDev,
        icon: Globe
    },
    'learn': {
        id: 'learn',
        name: 'NEXA Academy',
        component: Learn,
        icon: GraduationCap
    },
    'research': {
        id: 'research',
        name: 'Deep Research',
        component: Research,
        icon: Search
    },
    'code_editor': {
        id: 'code_editor',
        name: 'Code Editor Pro',
        component: CodeEditor,
        icon: Code
    },
    'dev_library': {
        id: 'dev_library',
        name: 'Dev Library',
        component: DevLibrary,
        icon: Book
    },
    'terminal': {
        id: 'terminal',
        name: 'System Terminal',
        component: Terminal,
        icon: TerminalIcon
    },
};

export const getAppDefinition = (id: string) => APP_REGISTRY[id];
