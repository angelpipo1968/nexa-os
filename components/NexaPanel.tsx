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
  const [activeModule, setActiveModule] = useState('chat');
  const [messages, setMessages] = useState<{role: string, content: string, timestamp: string}[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Voice control hook integration
  const { isListening, toggleVoiceRecognition } = useVoiceControl('es', (text) => setInput(text));

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Sistema NEXA en línea. Interfaz futurista cargada. ¿En qué puedo ayudarte?',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() }
    ];
    setMessages(newMessages);
    setInput('');

    // Simulate processing delay for "futuristic" feel
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 600);
  };

  const generateResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('hola')) return 'Saludos. Todos los sistemas operativos.';
    if (lower.includes('estado')) return 'Sistemas funcionando al 100%. Rendimiento óptimo.';
    if (lower.includes('hora')) return `Marca de tiempo actual: ${new Date().toLocaleTimeString()}`;
    if (lower.includes('herramientas')) {
      setActiveModule('herramientas');
      return 'Abriendo panel de herramientas...';
    }
    return 'Comando recibido. Procesando solicitud...';
  };

  return (
    <div className="nexa-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'hidden'} md:block`}>
        <div className="logo">
          NEXA OS
        </div>

        <nav>
          <button 
            className={activeModule === 'chat' ? 'active' : ''} 
            onClick={() => setActiveModule('chat')}
          >
            <MessageSquare size={20} /> Chat Central
          </button>
          <button 
            className={activeModule === 'asistente' ? 'active' : ''} 
            onClick={() => setActiveModule('asistente')}
          >
            <Bot size={20} /> Asistente IA
          </button>
          <button 
            className={activeModule === 'herramientas' ? 'active' : ''} 
            onClick={() => setActiveModule('herramientas')}
          >
            <Wrench size={20} /> Herramientas
          </button>
          <button 
            className={activeModule === 'video' ? 'active' : ''} 
            onClick={() => setActiveModule('video')}
          >
            <Video size={20} /> Generador Video
          </button>
          <button 
            className={activeModule === 'code' ? 'active' : ''} 
            onClick={() => setActiveModule('code')}
          >
            <Code size={20} /> Editor Código
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeModule === 'chat' && (
          <div className="chat-container">
            <div className="robot-container">
              <Bot className="robot-icon" />
              <div className="robot-speech">
                Sistema en línea. Esperando comandos.
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  <div style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px'}}>
                    {msg.role === 'assistant' ? 'NEXA' : 'USUARIO'} • {msg.timestamp}
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
              />
              <button type="button" onClick={toggleVoiceRecognition} title="Dictar">
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button type="submit" title="Enviar">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {activeModule === 'asistente' && (
          <div className="video-generator" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            <Bot size={120} color="var(--primary)" style={{marginBottom: '2rem'}} />
            <h2>NEXA ASSISTANT V2.0</h2>
            <p>Inteligencia Artificial Avanzada</p>
          </div>
        )}

        {activeModule === 'herramientas' && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
            <div className="settings">
              <h3><Terminal size={20} style={{verticalAlign: 'middle'}} /> Terminal</h3>
              <p>Acceso directo al sistema</p>
            </div>
            <div className="settings">
              <h3><Cpu size={20} style={{verticalAlign: 'middle'}} /> Monitor CPU</h3>
              <p>Rendimiento óptimo</p>
            </div>
            <div className="settings">
              <h3><Brain size={20} style={{verticalAlign: 'middle'}} /> Red Neural</h3>
              <p>Gestión de memoria</p>
            </div>
          </div>
        )}

        {activeModule === 'video' && (
          <div className="video-generator">
            <h2><Video size={24} style={{verticalAlign: 'middle'}} /> Generador de Video IA</h2>
            <textarea placeholder="Describe el video que deseas generar..."></textarea>
            <button>Generar Video</button>
          </div>
        )}

        {activeModule === 'code' && (
          <div className="code-editor">
            <h2><Code size={24} style={{verticalAlign: 'middle'}} /> Editor de Código Inteligente</h2>
            <textarea placeholder="// Escribe o pega tu código aquí..." style={{fontFamily: 'monospace'}}></textarea>
            <div style={{display: 'flex', gap: '1rem'}}>
              <button>Analizar</button>
              <button style={{background: 'var(--secondary)'}}>Ejecutar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NexaPanel;