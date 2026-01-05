import { create } from 'zustand';

type Memory = { id: string; content: string; tags: string[]; createdAt: number };

interface MemoryStore {
    memories: Memory[];
    addMemory: (content: string, tags?: string[]) => void;
    clearMemories: () => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
    memories: [],
    addMemory: (content, tags = []) =>
        set((state) => {
            const newMemory = { id: Date.now().toString(), content, tags, createdAt: Date.now() };
            // Opcional: Persistir si es necesario aquí o en un useEffect externo
            return { memories: [...state.memories, newMemory] };
        }),
    clearMemories: () => set({ memories: [] }),
}));
