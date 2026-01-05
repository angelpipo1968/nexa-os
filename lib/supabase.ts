import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Intentar obtener configuración de variables de entorno
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Función para obtener el cliente de manera segura
const getSupabaseClient = () => {
  // 1. Prioridad: Variables de entorno
  if (envUrl && envKey) {
    return createClient(envUrl, envKey);
  }

  // 2. Fallback: Configuración local (solo en navegador)
  if (typeof window !== 'undefined') {
    try {
      const localConfig = localStorage.getItem('nexa_supabase_config');
      if (localConfig) {
        const { url, anonKey } = JSON.parse(localConfig);
        // Validar URL básica
        if (url && url.startsWith('http') && anonKey) {
          console.log('Using Supabase config from LocalStorage');
          return createClient(url, anonKey);
        }
      }
    } catch (e) {
      console.warn('Error reading local Supabase config:', e);
    }
  }

  // 3. Fallback final: Cliente "Dummy" para evitar crash
  // Esto permite que la app cargue (por ejemplo, para ir a /setup) aunque falle la DB
  console.warn('Supabase not configured. Using placeholder client.');
  return createClient('https://placeholder.supabase.co', 'placeholder-key');
};

export const supabase = getSupabaseClient();

// Tipos TypeScript
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_active: string;
  preferences: Record<string, any>;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  metadata: Record<string, any>;
}
