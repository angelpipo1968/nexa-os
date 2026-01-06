import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatInterface from './components/ChatInterface/ChatInterface';
import LogoGenerator from './components/LogoGenerator/LogoGenerator';
import AndroidApp from './components/AndroidApp/AndroidApp';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import Toolbar from './components/Toolbar/Toolbar';
import { useVoiceControl } from './hooks/useVoiceControl';
import FuturisticPanel from './components/FuturisticPanel/FuturisticPanel';
import './styles.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Iniciando sistema NEXA AI v2.0...', timestamp: new Date().toLocaleTimeString() }
  ]);

  // Voice Recognition Hook
  const handleVoiceInput = useCallback((transcript) => {
    setInput(transcript);
  }, []);

  const { isListening, toggleVoiceRecognition, error: voiceError } = useVoiceControl('es', handleVoiceInput);

  // Text-to-Speech
  const speak = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Cancel current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    // Try to find a good Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const handleSendMessage = (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate AI Response
    setTimeout(() => {
        let responseText = "Procesando solicitud en la red neuronal distribuida...";
        
        if (input.toLowerCase().includes('hola')) {
            responseText = "¡Hola! Soy NEXA. ¿En qué puedo ayudarte hoy?";
        } else if (input.toLowerCase().includes('logo')) {
            responseText = "Abriendo módulo de generación de logos...";
            setActiveView('logos');
        } else if (input.toLowerCase().includes('app') || input.toLowerCase().includes('android')) {
            responseText = "Accediendo a configuración de Android...";
            setActiveView('android');
        } else if (input.toLowerCase().includes('red') || input.toLowerCase().includes('nodos')) {
            responseText = "Mostrando estado de la red global...";
            setActiveView('network');
        }

        const aiMsg = { role: 'assistant', content: responseText, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, aiMsg]);
        speak(responseText);
    }, 1000);
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <FuturisticPanel setActiveView={setActiveView} />;
      case 'chat':
        return <ChatInterface messages={messages} />;
      case 'logos':
        return <LogoGenerator />;
      case 'android':
        return <AndroidApp />;
      case 'settings':
        return <SettingsPanel voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled} />;
      case 'network':
        return (
            <div className="p-4" style={{ padding: '2rem' }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Red Global Distribuida</h2>
                <div className="network-stats">
                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-value">42</div>
                            <div className="stat-label">Nodos Activos</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-value">12ms</div>
                            <div className="stat-label">Latencia Global</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-value">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Mapa de Calor de Tráfico (Simulado)</h3>
                    <div style={{ 
                        height: '300px', 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        Visualización Geoespacial 3D Cargando...
                    </div>
                </div>
            </div>
        );
      case 'infra':
         return (
             <div className="p-4" style={{ padding: '2rem' }}>
                 <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Infraestructura Cloud</h2>
                 <div className="iac-container">
                     <div className="file-sidebar">
                         <button className="file-btn active">main.tf</button>
                         <button className="file-btn">variables.tf</button>
                         <button className="file-btn">outputs.tf</button>
                         <button className="file-btn">provider.tf</button>
                     </div>
                     <div className="code-block">
                         <pre className="code-elegant">
                             <span style={{color: '#ff79c6'}}>resource</span> <span style={{color: '#f1fa8c'}}>"google_compute_global_address"</span> <span style={{color: '#50fa7b'}}>"default"</span> &#123;{"\n"}
                               <span style={{color: '#8be9fd'}}>name</span> = <span style={{color: '#f1fa8c'}}>"nexa-global-ip"</span>{"\n"}
                             &#125;{"\n\n"}
                             <span style={{color: '#ff79c6'}}>resource</span> <span style={{color: '#f1fa8c'}}>"google_compute_backend_service"</span> <span style={{color: '#50fa7b'}}>"default"</span> &#123;{"\n"}
                               <span style={{color: '#8be9fd'}}>name</span>        = <span style={{color: '#f1fa8c'}}>"nexa-backend"</span>{"\n"}
                               <span style={{color: '#8be9fd'}}>port_name</span>   = <span style={{color: '#f1fa8c'}}>"http"</span>{"\n"}
                               <span style={{color: '#8be9fd'}}>protocol</span>    = <span style={{color: '#f1fa8c'}}>"HTTP"</span>{"\n"}
                               <span style={{color: '#8be9fd'}}>timeout_sec</span> = <span style={{color: '#bd93f9'}}>10</span>{"\n"}
                             &#125;
                         </pre>
                     </div>
                 </div>
             </div>
         );
      default:
        return <ChatInterface messages={messages} />;
    }
  };

  return (
    <div className="app-container nexa-panel">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
      <Toolbar 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isListening={isListening}
        toggleVoiceRecognition={toggleVoiceRecognition}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        voiceError={voiceError}
      />
    </div>
  );
}

export default App;
