import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  Wrench,
  Mic,
  MicOff,
  Send,
  Terminal,
  Cpu,
  Activity,
  Menu,
  X,
  Brain,
  User,
  Video,
  Code
} from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useChatState } from '../hooks/useChatState';
import { useUIState } from '../hooks/useUIState';
import { useNexaIntegration } from '../hooks/useNexaIntegration';
import { aiService } from '../lib/ai-service';

interface NexaPanelProps {
  config?: {
    theme: string;
    modules: string[];
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
  };
}

const NexaPanel: React.FC<NexaPanelProps> = ({ config }) => {
  // Global State Hooks
  const {
    activeApp, setActiveApp,
    sidebarOpen, toggleSidebar
  } = useUIState();

  const {
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    saveMessageToCloud
  } = useChatState();

  // Voice control hook integration (using hook's setInput)
  const { isListening, toggleVoiceRecognition } = useVoiceControl('es', (text) => setInput(text));

  // Video Integration
  const { generateVideoConcept, isProcessing: isVideoProcessing } = useNexaIntegration();
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState('');

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    const result = await generateVideoConcept(videoPrompt);
    setVideoResult(result);
  };

  // Local state for UI specifics that don't need to be global
  const [activeModule, setActiveModule] = useState('chat');

  // Sync activeModule with activeApp if needed, or just use activeApp. 
  // For this refactor, we'll keep activeModule local for the panel tabs 
  // but if we want it global we could sync them. 
  // Let's use the local activeModule for the tab switching to keep it simple and fast, 
  // unless we strictly want global app switching.
  // Actually, let's use the activeModule local state but initialize/sync with activeApp if provided?
  // User asked for "Refactor... extracting logic into custom hooks".
  // Let's rely on local state for the panel *tabs* (chat, assistant, tools) 
  // since activeApp in useUIState seems more for "Opened Apps" like windows.
  // However, the PROPOSAL said: "Replace local useState... with useUIState".
  // Let's try to map them. If activeApp is null, default to 'chat'.

  const currentTab = activeApp || 'chat';
  const setTab = (tab: string) => setActiveApp(tab);

  // Initial greeting - ONLY if empty and no loading happened yet
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      setMessages([
        {
          role: 'assistant',
          content: 'Sistema NEXA en línea. Interfaz futurista cargada. ¿En qué puedo ayudarte?',
        }
      ]);
    }
  }, []); // Run once on mount

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;

    // 1. Add User Message
    const newMessages = [
      ...messages,
      { role: 'user', content: userMsg }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // 2. Save User Message to Cloud (if auth)
    await saveMessageToCloud('user', userMsg);

    try {
      // 3. Generate AI Response
      // We need to convert current messages to AIMessage format for the service
      const history = messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const response = await aiService.generateNEXAResponse(userMsg, history);

      // 4. Add AI Response
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);

      // 5. Save AI Message to Cloud
      await saveMessageToCloud('assistant', response);

      // 6. Handle special commands in response (optional basic parsing)
      if (response.toLowerCase().includes('abriendo panel de herramientas')) {
        setTab('herramientas');
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error en el sistema central. No puedo procesar la solicitud.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nexa-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'hidden'} md:block`}>
        <div className="logo" onClick={toggleSidebar}>
          NEXA OS
        </div>

        <nav>
          <button
            className={currentTab === 'chat' ? 'active' : ''}
            onClick={() => setTab('chat')}
          >
            <MessageSquare size={20} /> Chat Central
          </button>
          <button
            className={currentTab === 'asistente' ? 'active' : ''}
            onClick={() => setTab('asistente')}
          >
            <Bot size={20} /> Asistente IA
          </button>
          <button
            className={currentTab === 'herramientas' ? 'active' : ''}
            onClick={() => setTab('herramientas')}
          >
            <Wrench size={20} /> Herramientas
          </button>
          <button
            className={currentTab === 'video' ? 'active' : ''}
            onClick={() => setTab('video')}
          >
            <Video size={20} /> Generador Video
          </button>
          <button
            className={currentTab === 'code' ? 'active' : ''}
            onClick={() => setTab('code')}
          >
            <Code size={20} /> Editor Código
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {currentTab === 'chat' && (
          <div className="chat-container">
            <div className="robot-container">
              <Bot className={`robot-icon ${isLoading ? 'animate-pulse' : ''}`} />
              <div className="robot-speech">
                {isLoading ? 'Procesando datos...' : 'Sistema en línea. Esperando comandos.'}
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
                    {msg.role === 'assistant' ? 'NEXA' : 'USUARIO'}
                  </div>
                  {msg.content}
                </div>
              ))}
            </div>

            <form className="input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Escribe un comando..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="button" onClick={toggleVoiceRecognition} title="Dictar" disabled={isLoading}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button type="submit" title="Enviar" disabled={isLoading}>
                {isLoading ? <Activity size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </div>
        )}

        {currentTab === 'asistente' && (
          <div className="video-generator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Bot size={120} color="var(--primary)" style={{ marginBottom: '2rem' }} />
            <h2>NEXA ASSISTANT V2.0</h2>
            <p>Inteligencia Artificial Avanzada</p>
          </div>
        )}

        {currentTab === 'herramientas' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="settings">
              <h3><Terminal size={20} style={{ verticalAlign: 'middle' }} /> Terminal</h3>
              <p>Acceso directo al sistema</p>
            </div>
            <div className="settings">
              <h3><Cpu size={20} style={{ verticalAlign: 'middle' }} /> Monitor CPU</h3>
              <p>Rendimiento óptimo</p>
            </div>
            <div className="settings">
              <h3><Brain size={20} style={{ verticalAlign: 'middle' }} /> Red Neural</h3>
              <p>Gestión de memoria</p>
            </div>
          </div>
        )}

        {currentTab === 'video' && (
          <div className="video-generator">
            <h2><Video size={24} style={{ verticalAlign: 'middle' }} /> Generador de Video IA</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <textarea
                placeholder="Describe el video que deseas generar..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                style={{ minHeight: '100px', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--primary)' }}
              />
              <button
                onClick={handleGenerateVideo}
                disabled={isVideoProcessing}
                style={{ alignSelf: 'flex-end' }}
              >
                {isVideoProcessing ? 'Diseñando Concepto...' : 'Generar Concepto'}
              </button>
            </div>
            {videoResult && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                {videoResult}
              </div>
            )}
          </div>
        )}

        {currentTab === 'code' && (
          <div className="code-editor">
            <h2><Code size={24} style={{ verticalAlign: 'middle' }} /> Editor de Código Inteligente</h2>
            <textarea placeholder="// Escribe o pega tu código aquí..." style={{ fontFamily: 'monospace' }}></textarea>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button>Analizar</button>
              <button style={{ background: 'var(--secondary)' }}>Ejecutar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NexaPanel;