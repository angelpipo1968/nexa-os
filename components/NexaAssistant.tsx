import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../lib/auth-service';
import { db } from '../lib/database-service';
import { supabase } from '../lib/supabase';
import { voiceService } from '../lib/voice-service';
import { aiService, AIMessage } from '../lib/ai-service';
import { nexaPersonality, applyPersonality } from '../lib/personality';
import { useNexaIntegration } from '../hooks/useNexaIntegration';
import VoiceControls from './VoiceControls';
import { Send, Zap, Video, Sparkles, Database, Loader2 } from 'lucide-react';

export default function NexaAssistant() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [emotion, setEmotion] = useState<'happy' | 'thinking' | 'sleeping'>('happy');
  const [energy, setEnergy] = useState(100);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateVideoConcept, isProcessing: videoProcessing } = useNexaIntegration();

  // Inicializar autenticación y cargar datos
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setIsLoading(true);
    
    // Verificar sesión actual
    const { session } = await auth.getSession();
    
    if (session) {
      setUserId(session.user.id);
      setIsAuthenticated(true);
      await loadUserData(session.user.id);
    } else {
      // Modo invitado (usar localStorage temporal)
      const guestName = localStorage.getItem('nexa_guest_name') || 'Amigo';
      setUserName(guestName);
      loadGuestData();
    }
    
    setIsLoading(false);
  };

  const loadUserData = async (userId: string) => {
    // Cargar perfil
    const profile = await db.getUserProfile(userId);
    if (profile) {
      setUserName(profile.name);
    }

    // Cargar última conversación
    const conversations = await db.getUserConversations(userId);
    if (conversations.length > 0) {
      const lastConv = conversations[0];
      setCurrentConversation(lastConv.id);
      const messages = await db.getConversationMessages(lastConv.id);
      setMessages(messages);
    } else {
      // Crear nueva conversación
      const newConv = await db.createConversation(userId, 'Conversación inicial');
      if (newConv) {
        setCurrentConversation(newConv.id);
      }
    }
  };

  const loadGuestData = () => {
    const savedMessages = JSON.parse(localStorage.getItem('nexa_guest_messages') || '[]');
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      setMessages([{
        role: 'assistant',
        content: `Hola, soy NEXA AI. Estoy lista para ayudarte${userName ? `, ${userName}` : ''}.`,
        created_at: new Date().toISOString()
      }]);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Guardar mensajes
  useEffect(() => {
    if (messages.length > 0) {
      if (isAuthenticated && currentConversation) {
        // Los mensajes ya se guardan en la DB al enviarlos
      } else {
        // Modo invitado
        localStorage.setItem('nexa_guest_messages', JSON.stringify(messages));
      }
    }
  }, [messages, isAuthenticated, currentConversation]);

  // Regenerar energía
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage = {
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setEmotion('thinking');

    try {
      // Guardar mensaje en DB si está autenticado
      if (isAuthenticated && currentConversation) {
        await db.saveMessage({
          conversation_id: currentConversation,
          role: 'user',
          content,
          metadata: {}
        });
      }

      // Obtener respuesta de la IA
      const apiMessages: AIMessage[] = messages.slice(-5).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      // Add current message to context
      apiMessages.push({ role: 'user', content: content });

      const rawResponse = await aiService.generateNEXAResponse(content, apiMessages);
      const finalResponse = applyPersonality(rawResponse, nexaPersonality);
      
      const assistantMessage = {
        role: 'assistant',
        content: finalResponse,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Guardar respuesta en DB
      if (isAuthenticated && currentConversation) {
        await db.saveMessage({
          conversation_id: currentConversation,
          role: 'assistant',
          content: finalResponse,
          metadata: { emotion: 'happy' }
        });
      }

      // 🎤 HABLAR LA RESPUESTA
      voiceService.speak(finalResponse, voiceService.getNEXAVoiceConfig());

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu mensaje?',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      voiceService.speak('Disculpa, tuve un problema técnico.');
    } finally {
      setEmotion('happy');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentInput);
    setCurrentInput('');
  };

  const handleVideoGeneration = async () => {
    const videoPrompt = prompt('Describe el video que quieres generar:');
    if (videoPrompt) {
       setEmotion('thinking');
       const concept = await generateVideoConcept(videoPrompt);
       const responseContent = concept;
       
       const assistantMessage = {
         role: 'assistant',
         content: responseContent,
         created_at: new Date().toISOString()
       };
       setMessages(prev => [...prev, assistantMessage]);
       setEmotion('happy');
       voiceService.speak(responseContent);
       
       // Guardar en DB
       if (isAuthenticated && currentConversation) {
         await db.saveMessage({
            conversation_id: currentConversation,
            role: 'assistant',
            content: responseContent,
            metadata: { type: 'video_concept' }
         });
       }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <div className="text-blue-200 font-medium">Cargando NEXA AI...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      {/* Header con memoria activa */}
      <div className="p-4 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-md text-white border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${emotion === 'thinking' ? 'bg-yellow-500/20 animate-pulse' : 'bg-blue-500/20'}`}>
               <span className="text-xl">{emotion === 'happy' ? '🧠' : emotion === 'thinking' ? '⚡' : '😴'}</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">NEXA AI</h2>
              <div className="flex items-center gap-2 text-xs text-blue-200/70">
                 <span className={`w-2 h-2 rounded-full animate-pulse ${isAuthenticated ? 'bg-green-400' : 'bg-orange-500'}`}></span>
                 {isAuthenticated ? 'Conectado a Supabase' : 'Modo Invitado (Local)'}
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-400 mb-1">Nivel de Energía</div>
             <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                  style={{ width: `${energy}%` }}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              <div className="text-[10px] opacity-40 mt-2 text-right">
                {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {videoProcessing && (
           <div className="flex justify-start animate-in fade-in">
              <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-3">
                 <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                 <span className="text-sm text-gray-300">Soñando conceptos visuales...</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controles */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {/* Barra de Acciones Rápidas */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
           <button
             type="button"
             onClick={() => sendMessage('¿Qué puedes hacer?')}
             className="flex-1 whitespace-nowrap py-2 px-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/30 rounded-lg text-xs font-medium transition-all"
           >
             🤖 Capacidades
           </button>
           <button
             type="button"
             onClick={handleVideoGeneration}
             disabled={videoProcessing}
             className="flex-1 whitespace-nowrap py-2 px-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-all"
           >
             🎥 Generar Video
           </button>
           <button
             type="button"
             onClick={() => sendMessage('Cuéntame sobre ti')}
             className="flex-1 whitespace-nowrap py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-600/30 rounded-lg text-xs font-medium transition-all"
           >
             🧠 Sobre NEXA
           </button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-3">
            {/* Controles de Voz Integrados */}
            <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
                 <span className="text-xs text-gray-400 flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    {isAuthenticated ? 'Sincronizado' : 'Offline'}
                 </span>
                 <VoiceControls textToSpeak={messages.length > 0 ? messages[messages.length - 1].content : ''} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <button
                type="button"
                onClick={handleVideoGeneration}
                className="p-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl transition-colors"
                title="Generar idea de video"
              >
                <Video className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Habla con NEXA..."
                  className="w-full p-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700 placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-xl text-white transition-all shadow-lg shadow-blue-900/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
        </div>
        
        <div className="flex justify-between items-center mt-3 px-1">
           <div className="text-[10px] text-gray-500 flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-yellow-500/50" />
             {userName ? `Memoria activa: ${userName}` : 'Aprendiendo de ti...'}
           </div>
           <div className="text-[10px] text-gray-600">
             {process.env.NEXT_PUBLIC_HUNYUAN_API_KEY ? '● IA Conectada' : '○ Modo Simulación'}
           </div>
        </div>
      </div>
    </div>
  );
}
