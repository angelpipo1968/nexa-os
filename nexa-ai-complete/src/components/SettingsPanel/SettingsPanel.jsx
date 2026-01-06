import React from 'react';

const SettingsPanel = ({ voiceEnabled, setVoiceEnabled }) => {
  const toggleTheme = (e) => {
    const isDark = e.target.checked;
    document.body.className = isDark ? 'dark' : 'light';
    localStorage.setItem('nexa-theme', isDark ? 'dark' : 'light');
  };

  return (
    <div className="module-container">
      <h2>Configuración del Sistema</h2>
      <div className="settings-list">
        <div className="setting-item">
          <span>Modo Oscuro</span>
          <input type="checkbox" defaultChecked={document.body.className === 'dark'} onChange={toggleTheme} />
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
};

export default SettingsPanel;
