import React from 'react';
import { 
  LayoutDashboard,
  MessageSquare, 
  Terminal, 
  Menu,
  Settings,
  Globe,
  Mic,
  Image as ImageIcon,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleCollapse, activeView, setActiveView }) => {
  return (
    <div className={`nexa-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="icon-btn" onClick={toggleCollapse}>
           {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>
        {!isCollapsed && <span className="logo-text">NEXA AI</span>}
      </div>

      <div className="sidebar-menu">
         <div className="menu-group">
           <button className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} title="Dashboard">
             <LayoutDashboard size={20} /> {!isCollapsed && "Dashboard"}
           </button>
           <button className={`menu-item ${activeView === 'chat' ? 'active' : ''}`} onClick={() => setActiveView('chat')} title="Chat">
             <MessageSquare size={20} /> {!isCollapsed && "Chat AI"}
           </button>
           <button className={`menu-item ${activeView === 'logos' ? 'active' : ''}`} onClick={() => setActiveView('logos')} title="Logos">
             <ImageIcon size={20} /> {!isCollapsed && "Gen. Logos"}
           </button>
           <button className={`menu-item ${activeView === 'android' ? 'active' : ''}`} onClick={() => setActiveView('android')} title="Android">
             <Terminal size={20} /> {!isCollapsed && "App Android"}
           </button>
           <button className={`menu-item ${activeView === 'network' ? 'active' : ''}`} onClick={() => setActiveView('network')} title="Red Global">
             <Globe size={20} /> {!isCollapsed && "Red Global"}
           </button>
           <button className={`menu-item ${activeView === 'infra' ? 'active' : ''}`} onClick={() => setActiveView('infra')} title="Infraestructura">
             <Shield size={20} /> {!isCollapsed && "Infraestructura"}
           </button>
         </div>

         <div className="menu-divider"></div>

         <div className="menu-group">
           <button className={`menu-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')} title="Configuración">
             <Settings size={20} /> {!isCollapsed && "Configuración"}
           </button>
           <button className="menu-item" title="Idioma">
             <Globe size={20} /> {!isCollapsed && "Idioma"}
           </button>
           <button className="menu-item" title="Voz">
             <Mic size={20} /> {!isCollapsed && "Voz"}
           </button>
         </div>
      </div>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="footer-links">
            <button className="link-btn">Privacidad</button> • <button className="link-btn">Contacto</button>
          </div>
        )}
        <button className="menu-item logout">
          <LogOut size={20} /> {!isCollapsed && "Salir"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
