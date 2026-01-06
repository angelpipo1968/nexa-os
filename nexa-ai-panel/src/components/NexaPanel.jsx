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
  Code,
  Music,
  BarChart,
  Search,
  PlusCircle,
  Settings,
  Globe,
  Palette,
  Camera,
  FileUp,
  Zap,
  Image as ImageIcon,
  Headphones,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
  Copy
} from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';

const NexaPanel = ({ config }) => {
  const [activeView, setActiveView] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTempChatOpen, setTempChatOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // State for Logo Generator
  const [logoText, setLogoText] = useState('NEXA');
  const [logoStyle, setLogoStyle] = useState('Cyberpunk');
  const [generatedLogo, setGeneratedLogo] = useState(null);

  // State for Android Config
  const [androidConfig, setAndroidConfig] = useState({
    appName: 'NexaApp',
    packageName: 'com.nexa.app',
    version: '1.0.0'
  });

  // Voice control hook integration
  const { isListening, toggleVoiceRecognition, error: voiceError } = useVoiceControl('es', (text) => setInput(text));

  // Initial greeting
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexa-theme') || 'dark';
    document.body.className = savedTheme;

    setMessages([
      {
        role: 'assistant',
        content: '¡Hola Ángel! Sistema NEXA en línea. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const handleSendMessage = (e) => {
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
      const botMsg = { role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMsg]);
      
      if (voiceEnabled) {
        speak(response);
      }
    }, 600);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.1; // Slightly faster for robotic feel
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('hola')) return 'Saludos. Todos los sistemas operativos.';
    if (lower.includes('estado')) return 'Sistemas funcionando al 100%. Rendimiento óptimo.';
    if (lower.includes('hora')) return `Marca de tiempo actual: ${new Date().toLocaleTimeString()}`;
    if (lower.includes('logo')) {
      setActiveView('logos');
      return 'Abriendo módulo de Generación de Logos...';
    }
    if (lower.includes('android') || lower.includes('app')) {
      setActiveView('android');
      return 'Iniciando configuración de aplicación Android...';
    }
    if (lower.includes('configuracion') || lower.includes('ajustes')) {
      setActiveView('settings');
      return 'Abriendo panel de configuración...';
    }
    if (lower.includes('ayuda') || lower.includes('error') || lower.includes('lento') || lower.includes('problema')) {
      return 'Diagnóstico: Si experimentas lentitud o errores, intenta limpiar la caché y reiniciar el sistema. Verifica tu conexión y actualizaciones.';
    }
    if (lower.includes('crear un sitio web') || lower.includes('blog')) {
       return '¡Genial! Generando plantilla Qwen3 para Android... [Progreso animado]';
    }
    return 'Comando recibido. Procesando solicitud...';
  };

  const renderContent = () => {
    switch(activeView) {
      case 'logos':
        return (
          <div className="module-container">
            <h2>Generador de Logos IA</h2>
            <div className="form-group">
              <label>Texto del Logo</label>
              <input type="text" value={logoText} onChange={(e) => setLogoText(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Estilo</label>
              <select value={logoStyle} onChange={(e) => setLogoStyle(e.target.value)}>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Minimalist">Minimalista</option>
                <option value="Abstract">Abstracto</option>
                <option value="3D">3D Metálico</option>
              </select>
            </div>
            <button className="action-btn primary" onClick={() => {
              setGeneratedLogo(null);
              setTimeout(() => setGeneratedLogo(`https://via.placeholder.com/300x300/000000/00FFFF?text=${logoText}`), 1500);
            }}>
              <Zap size={16} /> Generar Logo
            </button>
            
            {generatedLogo ? (
              <div className="result-preview pop-in">
                <img src={generatedLogo} alt="Generated Logo" />
                <div className="actions">
                  <button className="tool-btn"><Download size={16} /></button>
                  <button className="tool-btn"><Share2 size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="placeholder-preview">
                <p>Esperando generación...</p>
              </div>
            )}
          </div>
        );
      case 'android':
        return (
          <div className="module-container">
            <h2>Configuración Android App</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de la App</label>
                <input type="text" value={androidConfig.appName} onChange={(e) => setAndroidConfig({...androidConfig, appName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Package Name</label>
                <input type="text" value={androidConfig.packageName} onChange={(e) => setAndroidConfig({...androidConfig, packageName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Versión</label>
                <input type="text" value={androidConfig.version} onChange={(e) => setAndroidConfig({...androidConfig, version: e.target.value})} />
              </div>
            </div>
            <div className="android-preview">
               <div className="phone-mockup">
                 <div className="screen">
                    <div className="app-icon">{androidConfig.appName[0]}</div>
                    <p>{androidConfig.appName}</p>
                 </div>
               </div>
            </div>
            <button className="action-btn primary"><FileUp size={16} /> Exportar APK</button>
          </div>
        );
      case 'settings':
        return (
          <div className="module-container">
            <h2>Configuración del Sistema</h2>
            <div className="settings-list">
              <div className="setting-item">
                <span>Modo Oscuro</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item">
                <span>Notificaciones de Voz</span>
                <input type="checkbox" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
              </div>
              <div className="setting-item">
                <span>Velocidad de Respuesta</span>
                <input type="range" min="0.5" max="2" step="0.1" defaultValue="1.1" />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="chat-viewport">
            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  <div className="bubble-header">
                    <span className="role-name">{msg.role === 'assistant' ? 'NEXA' : 'TÚ'}</span>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                  <div className="bubble-content">{msg.content}</div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="nexa-layout">
      {/* Left Sidebar (Collapsible) */}
      <div className={`nexa-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="icon-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
             {isSidebarCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
          {!isSidebarCollapsed && <span className="logo-text">NEXA AI</span>}
        </div>

        <div className="sidebar-menu">
           <div className="menu-group">
             <button className={`menu-item ${activeView === 'chat' ? 'active' : ''}`} onClick={() => setActiveView('chat')} title="Chat">
               <MessageSquare size={20} /> {!isSidebarCollapsed && "Chat AI"}
             </button>
             <button className={`menu-item ${activeView === 'logos' ? 'active' : ''}`} onClick={() => setActiveView('logos')} title="Logos">
               <ImageIcon size={20} /> {!isSidebarCollapsed && "Gen. Logos"}
             </button>
             <button className={`menu-item ${activeView === 'android' ? 'active' : ''}`} onClick={() => setActiveView('android')} title="Android">
               <Terminal size={20} /> {!isSidebarCollapsed && "App Android"}
             </button>
           </div>

           <div className="menu-divider"></div>

           <div className="menu-group">
             <button className={`menu-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')} title="Configuración">
               <Settings size={20} /> {!isSidebarCollapsed && "Configuración"}
             </button>
             <button className="menu-item" title="Idioma">
               <Globe size={20} /> {!isSidebarCollapsed && "Idioma"}
             </button>
             <button className="menu-item" title="Voz">
               <Mic size={20} /> {!isSidebarCollapsed && "Voz"}
             </button>
           </div>
        </div>

        <div className="sidebar-footer">
          {!isSidebarCollapsed && (
            <div className="footer-links">
              <a href="#">Privacidad</a> • <a href="#">Contacto</a>
            </div>
          )}
          <button className="menu-item logout">
            <LogOut size={20} /> {!isSidebarCollapsed && "Salir"}
          </button>
        </div>
      </div>

      {/* Center Main Area */}
      <div className="nexa-main">
        <div className="main-header">
           <div className="welcome-banner">
             <div className="robot-avatar-container">
               <Bot size={40} className="robot-avatar" />
               <div className="status-indicator"></div>
             </div>
             <div className="welcome-text">
               <h1>¡Hola, Ángel!</h1>
               <p>Soy tu asistente AI. ¿Qué vamos a crear hoy?</p>
             </div>
           </div>
           <div className="notification-badge">
             ¡Felicidades por unirte! 🎉
           </div>
        </div>

        {renderContent()}

        {/* Bottom Toolbar */}
        <div className="nexa-toolbar">
           <div className="toolbar-left">
             <button className="tool-btn" onClick={toggleVoiceRecognition} title={isListening ? "Escuchando..." : "Activar Micrófono"}>
               {isListening ? <MicOff className="recording" /> : <Mic />}
             </button>
             <button className="tool-btn"><Camera /></button>
             <button className="tool-btn"><FileUp /></button>
           </div>
           
           <div className="toolbar-center">
             <form onSubmit={handleSendMessage} className="main-input-form">
               <input 
                 type="text" 
                 placeholder="Escribe un comando o pregunta..." 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
               />
               <button type="submit" className="send-btn"><Zap size={18} /></button>
             </form>
             {voiceError && <div className="voice-error-toast">{voiceError}</div>}
           </div>

           <div className="toolbar-right">
              <div className="ai-toggles">
                 <button 
                   className={`toggle-btn ${voiceEnabled ? 'active' : ''}`} 
                   onClick={() => setVoiceEnabled(!voiceEnabled)}
                   title="Voz Digital"
                 >
                   <Headphones size={18} />
                 </button>
              </div>
              <button className="tool-btn"><Share2 size={18} /></button>
              <button className="tool-btn"><Menu size={18} /></button>
           </div>
        </div>
      </div>

      {/* Right Temp Panel */}
      <div className={`nexa-right-panel ${isTempChatOpen ? 'open' : 'closed'}`}>
         <div className="panel-header">
           <h3>Chat Temporal</h3>
           <button onClick={() => setTempChatOpen(false)}><X size={18} /></button>
         </div>
         
         <div className="recent-history">
            <div className="history-item">
               <div className="thumb-icon"><Code size={16} /></div>
               <div className="history-info">
                 <span>Blog Astronomía</span>
                 <small>Hace 2 min</small>
               </div>
            </div>
            <div className="history-item">
               <div className="thumb-icon"><ImageIcon size={16} /></div>
               <div className="history-info">
                 <span>Imagen Nebulosa</span>
                 <small>Hace 5 min</small>
               </div>
            </div>
         </div>

         <div className="panel-actions">
            <button className="action-btn danger">
               <Trash2 size={16} /> Borrar Chat Temporal
            </button>
         </div>
      </div>
    </div>
  );
};

export default NexaPanel;
