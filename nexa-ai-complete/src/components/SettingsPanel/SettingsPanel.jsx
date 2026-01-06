import React from 'react';
import { Settings, Volume2, Moon, Cpu, Bell, Shield } from 'lucide-react';
import './SettingsPanel.css';

const SettingsPanel = ({ voiceEnabled, setVoiceEnabled }) => {
  const toggleTheme = (e) => {
    const isDark = e.target.checked;
    document.body.className = isDark ? 'dark' : 'light';
    localStorage.setItem('nexa-theme', isDark ? 'dark' : 'light');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">
          <Settings size={28} style={{marginRight: '12px', verticalAlign: 'middle'}}/>
          Configuración del Sistema
        </h2>
        <p style={{color: 'var(--text-secondary)'}}>Personaliza tu experiencia con NEXA OS</p>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <div className="glass-panel">
          <h3 className="group-title"><Cpu size={20}/> General</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Modo Oscuro</span>
              <span className="setting-desc">Interfaz optimizada para baja luminosidad</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked={true} onChange={toggleTheme} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Animaciones de Interfaz</span>
              <span className="setting-desc">Efectos visuales y transiciones suaves</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked={true} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Voice & Audio */}
        <div className="glass-panel">
          <h3 className="group-title"><Volume2 size={20}/> Voz y Audio</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Respuesta de Voz</span>
              <span className="setting-desc">NEXA leerá las respuestas en voz alta</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item" style={{display: 'block'}}>
            <div className="setting-info" style={{marginBottom: '10px'}}>
              <span className="setting-label">Velocidad de Voz</span>
              <span className="setting-desc">Ajusta la velocidad de síntesis de voz</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1.1" className="range-slider" />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
              <span>Lento</span>
              <span>Normal</span>
              <span>Rápido</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel">
          <h3 className="group-title"><Bell size={20}/> Notificaciones</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Alertas del Sistema</span>
              <span className="setting-desc">Notificar sobre estado de CPU y Memoria</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked={true} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Sonidos de Interfaz</span>
              <span className="setting-desc">Feedback auditivo al interactuar</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked={false} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="glass-panel">
          <h3 className="group-title"><Shield size={20}/> Privacidad</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Historial de Chat</span>
              <span className="setting-desc">Guardar conversaciones localmente</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked={true} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
