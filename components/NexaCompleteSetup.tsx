'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, CheckCircle, MessageCircle, Settings, User, Mic, MicOff, Volume2, VolumeX, Bot, LayoutGrid, Brain } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';

const NexaCompleteSetup = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'auth' | 'chat'>('setup');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configuración inicial

  // Configuración inicial
  const DEFAULT_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-clave-anonima'
  };

  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Efecto para inicializar el chat
  useEffect(() => {
    if (currentView === 'chat' && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hola, soy NEXA AI. ¿En qué puedo ayudarte hoy?' }]);
    }
  }, [currentView]);

  // Manejo de autenticación
  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulación de autenticación rápida
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser({
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email: email,
        name: email.split('@')[0]
      });
      setCurrentView('chat');
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Generador de respuestas locales
  const generateLocalResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('hola') || lower.includes('buenos')) return '¡Hola! Me alegra verte. ¿En qué puedo ayudarte?';
    if (lower.includes('nombre')) return 'Soy NEXA, tu asistente virtual inteligente.';
    if (lower.includes('hora')) return `Son las ${new Date().toLocaleTimeString()}.`;
    if (lower.includes('fecha')) return `Hoy es ${new Date().toLocaleDateString()}.`;
    if (lower.includes('gracias')) return '¡De nada! Estoy aquí para servirte.';
    if (lower.includes('ayuda')) return 'Puedo ayudarte a organizar tareas, responder preguntas o simplemente charlar.';
    return 'He recibido tu mensaje. ¿Hay algo más en lo que pueda ayudarte?';
  };

  // Vista de configuración inicial
  const SetupView = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
            <span className="text-3xl font-bold">N</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">NEXA AI</h1>
          <p className="text-gray-400">Sistema Operativo Inteligente</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl border border-gray-700">
          <p className="text-lg text-gray-300 text-center">
            Bienvenido a tu asistente personal. NEXA está listo para funcionar.
          </p>
          
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button
              onClick={() => setCurrentView('auth')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Comenzar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Vista de autenticación
  const AuthView = () => (
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
                handleSignIn(email, password);
              }}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors shadow-lg"
            >
              {loading ? 'Procesando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Estado para configuración y aplicaciones
  const [showSettings, setShowSettings] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [activeApps, setActiveApps] = useState<string[]>(['Notas', 'Calendario', 'Tareas']);

  // Función para restablecer configuración
  const resetConfig = () => {
    if (confirm('¿Estás seguro de que deseas restablecer NEXA AI a su configuración predeterminada? Esto reiniciará la interfaz.')) {
        setMessages([]);
        setActiveApps(['Notas', 'Calendario', 'Tareas']);
        setVoiceEnabled(true);
        alert('Configuración restablecida correctamente.');
        window.location.reload();
    }
  };

  // Vista de Configuración (Modal simulado)
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" /> Configuración de NEXA
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-6">
                
                {/* Sección de Interfaz */}
                <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">Interfaz</h4>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors">
                            <span className="text-slate-200">Mostrar robot asistente</span>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors">
                            <span className="text-slate-200">Aplicaciones integradas</span>
                             <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Sección de Rendimiento */}
                 <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Rendimiento</h4>
                    <div className="space-y-3">
                         <label className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-purple-500/50 transition-colors">
                            <span className="text-slate-200">Modo Alto Rendimiento</span>
                             <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Botón de Restablecer */}
                <div className="pt-4 border-t border-slate-800">
                    <button 
                        onClick={resetConfig}
                        className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Restablecer a valores predeterminados
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  // Vista de Aplicaciones (Modal simulado)
  const AppsModal = () => (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-purple-400" /> Aplicaciones Integradas
                </h3>
                <button onClick={() => setShowApps(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
                {activeApps.map((app, index) => (
                    <div key={index} className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-xl">📱</span>
                        </div>
                        <span className="font-medium text-slate-200">{app}</span>
                        <span className="text-xs text-green-400">Activo</span>
                    </div>
                ))}
                <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors cursor-pointer">
                    <span className="text-2xl">+</span>
                    <span className="text-sm">Añadir App</span>
                </div>
            </div>
        </div>
      </div>
  );

  // Vista de chat
  const ChatView = () => {
    const { 
      isListening, 
      toggleVoiceRecognition, 
      speakText, 
      voiceEnabled, 
      setVoiceEnabled 
    } = useVoiceControl('es', (text) => setInput(text));

    const [isTyping, setIsTyping] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim()) {
        const userText = input;
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setIsTyping(true);
        
        // Respuesta rápida (500ms)
        setTimeout(() => {
          const aiResponse = generateLocalResponse(userText);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: aiResponse 
          }]);
          setIsTyping(false);
          
          if (voiceEnabled) {
            speakText(aiResponse);
          }
        }, 500);
      }
    };

    return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex gap-4 h-[600px]">
        
        {/* Barra lateral de aplicaciones */}
        <div className="w-16 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center py-4 gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2 hover:bg-blue-500 transition-colors cursor-pointer"
            title="Configuración"
          >
            <Bot className="w-6 h-6 text-white" />
          </button>
          
          <button className="p-2 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors" title="Chat">
            <MessageCircle className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowApps(true)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-colors" 
            title="Aplicaciones"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          
          <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-colors" title="Memoria">
            <Brain className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <button 
            onClick={() => {
              setUser(null);
              setCurrentView('auth');
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors" 
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Área principal del chat */}
        <div className="flex-1 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h2 className="font-semibold text-white">NEXA AI</h2>
                <p className="text-xs text-blue-400">Asistente Virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'text-blue-400 hover:bg-blue-500/10' : 'text-slate-500 hover:bg-slate-800'}`}
                title={voiceEnabled ? "Voz activada" : "Voz desactivada"}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setMessages([])}
                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                title="Limpiar chat"
              >
                <span className="text-xs font-medium">Limpiar</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No hay mensajes aún.</p>
              <p className="text-xs opacity-70">¡Saluda a NEXA!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
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
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceRecognition}
              className={`p-3 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse ring-2 ring-red-500/50' 
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? "Escuchando..." : "Activar micrófono"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Escuchando..." : "Escribe un mensaje..."}
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
        {showSettings && <SettingsModal />}
        {showApps && <AppsModal />}
      </div>
    </div>
    </div>
    );
  };

  // Renderizado condicional
  switch (currentView) {
    case 'auth':
      return <AuthView />;
    case 'chat':
      return <ChatView />;
    default:
      return <SetupView />;
  }
};

export default NexaCompleteSetup;
