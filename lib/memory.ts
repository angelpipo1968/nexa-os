import { supabase } from './supabase';

export interface Conversation { 
  id: string; 
  timestamp: number; 
  messages: Message[]; 
} 

export interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  timestamp: number; 
} 

export interface MemoryItem {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'concept' | 'research';
  timestamp: number;
}

class MemoryManager { 
  private storageKey = 'nexa_conversations'; 
  private userProfileKey = 'nexa_user_profile'; 
  private memoriesKey = 'nexa_memories';

  // Supabase Sync
  async syncToSupabase(userId: string) {
    if (!userId) return;
    
    // Sync Memories
    const memories = this.getMemories();
    if (memories.length > 0) {
        const { error } = await supabase
            .from('memories')
            .upsert(memories.map(m => ({ ...m, user_id: userId })));
        if (error) console.error('Error syncing memories to Supabase:', error);
    }

    // Sync Profile
    const profile = this.getUserProfile();
    if (Object.keys(profile).length > 0) {
        const { error } = await supabase
            .from('profiles')
            .upsert({ user_id: userId, data: profile });
         if (error) console.error('Error syncing profile to Supabase:', error);
    }
  }

  async loadFromSupabase(userId: string) {
      if (!userId) return;

      // Load Memories
      const { data: memories } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', userId);
      
      if (memories) {
          this.saveMemories(memories as unknown as MemoryItem[]);
      }

      // Load Profile
      const { data: profile } = await supabase
          .from('profiles')
          .select('data')
          .eq('user_id', userId)
          .single();
      
      if (profile) {
          this.saveUserProfile(profile.data);
      }
  }

  // Conversation Management
  saveConversation(messages: Message[]) { 
    const conversations = this.getConversations(); 
    const newConversation: Conversation = { 
      id: Date.now().toString(), 
      timestamp: Date.now(), 
      messages 
    }; 
    
    conversations.unshift(newConversation); 
    if (conversations.length > 10) conversations.pop(); 
    
    localStorage.setItem(this.storageKey, JSON.stringify(conversations)); 
  } 

  getConversations(): Conversation[] { 
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.storageKey); 
    return stored ? JSON.parse(stored) : []; 
  } 

  // User Profile Management
  saveUserProfile(profile: any) { 
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.userProfileKey, JSON.stringify(profile)); 
  } 

  getUserProfile() { 
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(this.userProfileKey); 
    return stored ? JSON.parse(stored) : {}; 
  } 

  addPreference(key: string, value: any) { 
    const profile = this.getUserProfile(); 
    profile[key] = value; 
    this.saveUserProfile(profile); 
  } 

  // Memory Item Management (MemorySystem)
  getMemories(): MemoryItem[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.memoriesKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveMemories(memories: MemoryItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.memoriesKey, JSON.stringify(memories));
  }

  addMemory(content: string, type: 'fact' | 'preference' | 'concept' | 'research' = 'fact') {
    const memories = this.getMemories();
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: Date.now()
    };
    memories.unshift(newMemory);
    this.saveMemories(memories);
    return newMemory;
  }

  removeMemory(id: string) {
    const memories = this.getMemories();
    const filtered = memories.filter(m => m.id !== id);
    this.saveMemories(filtered);
  }
} 

export const memory = new MemoryManager();
export const MemorySystem = memory; // Export as MemorySystem for compatibility
