import React from 'react';
import { Mic, MicOff, Camera, FileUp, Zap, Headphones, Share2, Menu } from 'lucide-react';

const Toolbar = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  isListening, 
  toggleVoiceRecognition, 
  voiceEnabled, 
  setVoiceEnabled, 
  voiceError 
}) => {
  return (
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
  );
};

export default Toolbar;
