'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, User, Settings, Database, MessageSquare, Shield, CheckCircle } from 'lucide-react';

// =============================================================================
// 🔧 CONFIGURACIÓN DE SUPABASE
// =============================================================================

// ⚠️ REEMPLAZA ESTAS CREDENCIALES CON LAS TUYAS DE SUPABASE
const DEFAULT_CONFIG = {
  url: 'https://tu-proyecto-id.supabase.co',
  anonKey: 'tu-anon-key-aqui'
};

// Cliente de Supabase simplificado
class SimpleSupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.url}/rest/v1${endpoint}`, {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    return response.json();
  }

  // Autenticación
  auth = {
    signUp: async (email: string, password: string, name: string) => {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, data: { name } })
      });
      
      const data = await response.json();
      return { data, error: data.error ? { message: data.error.message || data.msg } : null };
    },

    signIn: async (email: string, password: string) => {
      const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      return { data, error: data.error ? { message: data.error_description || data.error } : null };
    },

    signOut: async () => {
      return { error: null };
    },

    getUser: async (token: string) => {
      const response = await fetch(`${this.url}/auth/v1/user`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      return { user: data };
    },

    signInWithOAuth: async (provider: string) => {
      const redirectTo = window.location.href.split('#')[0];
      window.location.href = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
      return { error: null };
    }
  };

  // Base de datos
  from(table: string) {
    const getHeaders = () => ({
      'apikey': this.key,
      'Authorization': `Bearer ${localStorage.getItem('supabase_token') || this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const response = await fetch(`${this.url}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
              headers: getHeaders()
            });
            const data = await response.json();
            return { data: Array.isArray(data) ? (data[0] || null) : null, error: null };
          },
          order: (orderColumn: string, { ascending = true } = {}) => 
             this.request(`/${table}?select=${columns}&${column}=eq.${value}&order=${orderColumn}.${ascending ? 'asc' : 'desc'}`)
               .then(data => ({ data, error: null }))
               .catch(error => ({ data: null, error }))
        }),
        // Soporte básico para select sin filtros
        order: (column: string, { ascending = true } = {}) => 
             this.request(`/${table}?select=${columns}&order=${column}.${ascending ? 'asc' : 'desc'}`)
               .then(data => ({ data, error: null }))
               .catch(error => ({ data: null, error }))
      }),
      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            const response = await fetch(`${this.url}/rest/v1/${table}`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(values)
            });
            const data = await response.json();
            return { data: Array.isArray(data) ? (data[0] || null) : data, error: null };
          }
        })
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => 
             fetch(`${this.url}/rest/v1/${table}?${column}=eq.${value}`, {
                 method: 'PATCH',
                 headers: getHeaders(),
                 body: JSON.stringify(values)
             })
             .then(res => res.json())
             .then(data => ({ data, error: null }))
             .catch(error => ({ data: null, error }))
      }),
      delete: () => ({
        eq: (column: string, value: any) => 
             fetch(`${this.url}/rest/v1/${table}?${column}=eq.${value}`, {
                 method: 'DELETE',
                 headers: getHeaders()
             })
             .then(async res => {
                 if (res.ok) return { data: true, error: null };
                 else {
                     const err = await res.json().catch(() => ({ message: res.statusText }));
                     return { data: null, error: err };
                 }
             })
             .catch(error => ({ data: null, error }))
      })
    };
  }
}

// =============================================================================
// 🎨 COMPONENTE PRINCIPAL TODO-EN-UNO
// =============================================================================

export default function NEXACompleteSetup() {
  const [currentView, setCurrentView] = useState<'setup' | 'auth' | 'chat'>('setup');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Referencia al cliente supabase
  const supabaseRef = useRef<SimpleSupabaseClient | null>(null);

  // Inicializar configuración desde localStorage si existe
  useEffect(() => {
    const storedConfig = localStorage.getItem('nexa_supabase_config');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      setConfig(parsed);
      // Si parece válida, instanciar cliente
      if (!parsed.url.includes('tu-proyecto')) {
        supabaseRef.current = new SimpleSupabaseClient(parsed.url, parsed.anonKey);

        // Verificar hash para OAuth callback
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken && supabaseRef.current) {
                supabaseRef.current.auth.getUser(accessToken).then(({ user }) => {
                    if (user) {
                        setUser(user);
                        setCurrentView('chat');
                        initializeChat(user.id);
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                });
            }
        }
      }
    }
  }, []);

  // Verificar configuración
  const isConfigured = !config.url.includes('tu-proyecto') && !config.anonKey.includes('tu-anon-key');

  // Simulación de base de datos local (fallback)
  const [localDB, setLocalDB] = useState({
    users: [] as any[],
    conversations: [] as any[],
    messages: [] as any[]
  });

  // Cargar datos locales al inicio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalDB({
        users: JSON.parse(localStorage.getItem('nexa_users') || '[]'),
        conversations: JSON.parse(localStorage.getItem('nexa_conversations') || '[]'),
        messages: JSON.parse(localStorage.getItem('nexa_messages') || '[]')
      });
    }
  }, []);

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleSaveConfig = () => {
    localStorage.setItem('nexa_supabase_config', JSON.stringify(config));
    supabaseRef.current = new SimpleSupabaseClient(config.url, config.anonKey);
    setCurrentView('auth');
  };

  // Guardar mensaje en persistencia (Supabase o Local)
  const saveMessage = async (message: any, targetChatId?: string) => {
    const chatId = targetChatId || conversationId;
    
    if (isConfigured && supabaseRef.current && chatId) {
        try {
            await (supabaseRef.current.from('messages') as any).insert([
                { ...message, conversation_id: chatId }
            ]);
        } catch (e) {
            console.error("Error saving message to Supabase:", e);
        }
    } else {
        const updatedMessages = [...localDB.messages, message];
        setLocalDB(prev => ({ ...prev, messages: updatedMessages }));
        saveToLocal('nexa_messages', updatedMessages);
    }
  };

  // Cargar mensajes (y crear conversación si es necesario)
  const loadUserMessages = async (userId: string, userName?: string) => {
     if (isConfigured && supabaseRef.current) {
         // Lógica Supabase (reutilizando initializeChat)
         await initializeChat(userId);
     } else {
         // Lógica Local
         const userMessages = localDB.messages.filter((m: any) => m.user_id === userId || (m.user_id === 'system' && localDB.conversations.find(c => c.user_id === userId))); 
         // Nota: La lógica local simplificada asume que todos los mensajes del sistema son visibles o filtra por chat. 
         // Para simplificar, en local mostramos los mensajes donde el usuario es el dueño o es system.
         
         // Mejor: Filtrar por "sesión" o mostrar bienvenida si está vacío
         if (userMessages.length > 0) {
             setMessages(userMessages);
         } else {
             // Mensaje de bienvenida de vuelta si no hay mensajes recientes (opcional)
             const welcomeBack = {
               role: 'assistant',
               content: `¡Bienvenido de vuelta, ${userName || 'Usuario'}! ¿En qué puedo ayudarte hoy?`,
               created_at: new Date().toISOString(),
               user_id: 'system'
             };
             setMessages([welcomeBack]);
             // No guardamos el "bienvenido de vuelta" automáticamente para no llenar la DB, o sí.
             // saveMessage(welcomeBack); 
         }
         await initializeChat('local'); // Para setear conversationId dummy
     }
  };

  // Inicializar Chat
  const initializeChat = async (userId: string) => {
    let chatId = conversationId;
    
    if (isConfigured && supabaseRef.current) {
        // Buscar conversación existente
        if (!chatId) {
            const { data: existingConvs } = await supabaseRef.current.from('conversations')
                .select('id')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });
                
            if (existingConvs && existingConvs.length > 0) {
                chatId = existingConvs[0].id;
            } else {
                // Crear nueva
                const { data: newConv } = await supabaseRef.current.from('conversations')
                    .insert({ user_id: userId, title: 'Nueva conversación' })
                    .select()
                    .single();
                chatId = newConv?.id;
            }
        }
        
        if (chatId) {
            setConversationId(chatId);
            // Cargar mensajes
            const { data: msgs } = await supabaseRef.current.from('messages')
                .select('*')
                .eq('conversation_id', chatId)
                .order('created_at', { ascending: true });
                
            if (msgs) setMessages(msgs);
        }
    } else {
        // Local
        setConversationId('local-chat');
        const userMessages = localDB.messages.filter((m: any) => m.user_id === userId || (m.user_id === 'system')); 
        if (userMessages.length > 0) setMessages(userMessages);
    }
    return chatId;
  };

  // Enviar Mensaje
  const sendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      user_id: user?.id || 'local-user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    saveMessage(userMsg);

    // Simular respuesta AI
    setTimeout(() => {
        const responses = [
            "Entiendo, cuéntame más.",
            "Interesante punto de vista.",
            "Estoy procesando esa información...",
            "¿Podrías elaborar un poco más?",
            "¡Claro! Estoy aquí para ayudarte.",
            "Eso suena fascinante."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const aiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: randomResponse,
            user_id: 'system',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
        saveMessage(aiMsg);
    }, 1000 + Math.random() * 2000);
  };

  // Agregar mensaje de bienvenida (Registro)
  const addWelcomeMessage = (name: string, chatId?: string) => {
    const welcomeMsg = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `¡Hola ${name}! Soy NEXA AI, tu asistente viviente. Estoy listo para ayudarte con lo que necesites.`,
      created_at: new Date().toISOString(),
      user_id: 'system'
    };
    
    setMessages(prev => [...prev, welcomeMsg]);
    saveMessage(welcomeMsg, chatId);
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError('');

    try {
      if (isConfigured && supabaseRef.current) {
        // Usar Supabase real
        const { data, error } = await supabaseRef.current.auth.signUp(email, password, name);
        if (error) throw error;
        
        const userData = data.user || data;
        setUser(userData);
        setCurrentView('chat');
        const chatId = await initializeChat(userData.id);
        setTimeout(() => addWelcomeMessage(name, chatId || undefined), 1000);
      } else {
        // Modo demo/local
        const newUser = { id: Date.now().toString(), email, name, created_at: new Date().toISOString() };
        const updatedUsers = [...localDB.users, newUser];
        setLocalDB(prev => ({ ...prev, users: updatedUsers }));
        saveToLocal('nexa_users', updatedUsers);
        
        setUser(newUser);
        setCurrentView('chat');
        await initializeChat('local');
        addWelcomeMessage(name);
      }
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setLoading(true);
    setError('');

    // Fallback automático a modo invitado si no hay servidor configurado
    if (!isConfigured) {
        setTimeout(() => {
            setUser({ id: 'guest', email: email, user_metadata: { name: 'Invitado' } });
            setCurrentView('chat');
            initializeChat('guest');
            setLoading(false);
        }, 800);
        return;
    }

    try {
      const { data, error } = await supabaseRef.current!.auth.signIn(email, pass);
      if (error) throw error;
      
      const userData = data.user || data;
      setUser(userData);
      setCurrentView('chat');
      initializeChat(userData.id);
    } catch (err: any) {
      setError(err.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isConfigured && supabaseRef.current) {
        await supabaseRef.current.auth.signInWithOAuth('google');
      } else {
        throw new Error('Configura Supabase primero para usar Google Login');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Referencia para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
      if (isConfigured && supabaseRef.current) {
          await supabaseRef.current.auth.signOut();
      }
      setUser(null);
      setCurrentView('auth');
      setMessages([]);
      setConversationId(null);
  };

  if (currentView === 'chat') {
      return <NexaDesktop user={user} onLogout={handleLogout} />;
  }

  const clearChat = async () => {
    if (!window.confirm('¿Borrar historial del chat?')) return;
    
    setMessages([]);
    
    if (isConfigured && supabaseRef.current && conversationId) {
        await supabaseRef.current.from('messages')
            .delete()
            .eq('conversation_id', conversationId);
    } else {
        // Local: Limpiar mensajes de la conversación actual
        const remaining = localDB.messages.filter((m: any) => 
            (conversationId && m.conversation_id !== conversationId) || 
            (!conversationId && m.conversation_id !== 'local-chat')
        ); 
        
        setLocalDB(prev => ({ ...prev, messages: remaining }));
        saveToLocal('nexa_messages', remaining);
    }
  };

  // Componente de Setup
  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
              <span className="text-3xl font-bold">N</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">NEXA AI - Setup</h1>
            <p className="text-gray-400">Configuración inicial del sistema</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl border border-gray-700">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Pasos de Configuración:
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
                  <span className="text-blue-400 font-bold mt-0.5">1.</span>
                  <div>
                    <p className="font-medium text-blue-100">Crea proyecto en Supabase</p>
                    <p className="text-sm text-gray-400">Ve a <a href="https://supabase.com" target="_blank" className="text-blue-400 hover:underline">supabase.com</a> y crea una cuenta gratuita.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
                  <span className="text-blue-400 font-bold mt-0.5">2.</span>
                  <div className="w-full">
                    <p className="font-medium text-blue-100">Ejecuta este SQL en Supabase:</p>
                    <div className="relative group mt-2">
                        <pre className="text-xs bg-gray-950 p-3 rounded-lg overflow-x-auto text-gray-300 font-mono border border-gray-800">
{`-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función y Trigger para nuevos usuarios
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Crear tabla de conversaciones
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);`}
                        </pre>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-900/30">
                  <span className="text-yellow-400 font-bold mt-0.5">3.</span>
                  <div className="w-full">
                    <p className="font-medium text-yellow-100">⚠️ ACTUALIZA LAS CREDENCIALES</p>
                    <p className="text-sm text-gray-400 mb-2">Ingresa tus credenciales reales aquí:</p>
                    <div className="mt-2 space-y-3">
                       <div>
                         <label className="block text-xs font-medium text-gray-400 mb-1">URL del Proyecto</label>
                         <input
                           type="text"
                           value={config.url}
                           onChange={e => setConfig({ ...config, url: e.target.value })}
                           className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                           placeholder="https://..."
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-400 mb-1">Clave Anónima (Anon Key)</label>
                         <input
                           type="password"
                           value={config.anonKey}
                           onChange={e => setConfig({ ...config, anonKey: e.target.value })}
                           className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                           placeholder="eyJh..."
                         />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex flex-col gap-3">
               <button
                   onClick={handleSaveConfig}
                   className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-colors shadow-lg"
               >
                   {isConfigured ? 'Continuar con Supabase' : 'Guardar Configuración'}
               </button>
               
               {!isConfigured && (
                 <button
                   onClick={() => setCurrentView('auth')}
                   className="text-center text-yellow-400 text-sm mt-2 hover:underline bg-transparent border-none cursor-pointer"
                 >
                   ⚠️ Continuar en Modo Demo (Datos locales)
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Componente de Autenticación
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <h1 className="text-2xl font-bold text-white">NEXA AI</h1>
            <p className="text-gray-400">Máquina Viviente</p>
          </div>

          <div className="space-y-4">
            {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                id="signup-name"
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholder="Tu nombre"
              />
            </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                id="signup-email"
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                id="signup-password"
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const email = (document.getElementById('signup-email') as HTMLInputElement).value;
                  const password = (document.getElementById('signup-password') as HTMLInputElement).value;
                  
                  if (authMode === 'signup') {
                      const name = (document.getElementById('signup-name') as HTMLInputElement).value;
                      if (name && email && password) {
                        handleSignUp(email, password, name);
                      } else {
                        setError('Por favor completa todos los campos');
                      }
                  } else {
                      if (email && password) {
                        handleSignIn(email, password);
                      } else {
                        setError('Por favor completa todos los campos');
                      }
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors shadow-lg"
              >
                {loading ? 'Procesando...' : (authMode === 'signup' ? 'Registrarse' : 'Iniciar Sesión')}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">O continúa con</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              {!isConfigured && (
                  <button
                    onClick={() => {
                        setUser({ id: 'guest', email: 'guest@local', user_metadata: { name: 'Invitado' } });
                        setCurrentView('chat');
                        initializeChat('guest');
                    }}
                    className="w-full py-3 mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center gap-2 border border-gray-600"
                  >
                    <User className="w-5 h-5" />
                    Entrar como Invitado (Offline)
                  </button>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setError('');
                  }}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {authMode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado del Chat (cuando no es setup ni auth)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex flex-col h-[600px]">
        
        {/* Header del Chat */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold">N</span>
                </div>
                <div>
                    <h2 className="font-semibold text-white">NEXA AI</h2>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={clearChat}
                    className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Limpiar chat"
                >
                    <span className="text-xs font-medium">Limpiar</span>
                </button>
                <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Cerrar sesión"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Lista de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
            {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hay mensajes aún.</p>
                <p className="text-xs opacity-70">¡Saluda a NEXA!</p>
                </div>
            ) : (
                messages.map((msg) => (
                <div
                    key={msg.id || Math.random()}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                        msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}
                    >
                    {msg.content}
                    </div>
                </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 rounded-b-2xl">
            <form onSubmit={sendMessage} className="relative flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors text-white placeholder-slate-500"
            />
            <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
                <Send className="w-5 h-5 text-white" />
            </button>
            </form>
        </div>
      </div>
    </div>
  );
}
