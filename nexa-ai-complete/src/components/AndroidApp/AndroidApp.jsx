import React, { useState } from 'react';
import { FileUp, Smartphone, Settings, Box } from 'lucide-react';
import './AndroidApp.css';

const AndroidApp = () => {
  const [androidConfig, setAndroidConfig] = useState({
    appName: 'NexaApp',
    packageName: 'com.nexa.app',
    version: '1.0.0'
  });

  return (
    <div className="android-app-container">
      <div className="android-header">
        <h2 className="android-title">
          <Smartphone size={32} style={{marginRight: '12px', verticalAlign: 'middle', color: '#10b981'}}/>
          Configuración Android App
        </h2>
        <p className="android-subtitle">Personaliza y exporta tu aplicación móvil nativa</p>
      </div>

      <div className="android-content">
        <div className="config-panel">
          <div className="form-group">
            <label className="form-label"><Smartphone size={16} style={{marginRight: '8px'}}/>Nombre de la App</label>
            <input 
              type="text" 
              className="modern-input"
              value={androidConfig.appName} 
              onChange={(e) => setAndroidConfig({...androidConfig, appName: e.target.value})} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label"><Box size={16} style={{marginRight: '8px'}}/>Package Name</label>
            <input 
              type="text" 
              className="modern-input"
              value={androidConfig.packageName} 
              onChange={(e) => setAndroidConfig({...androidConfig, packageName: e.target.value})} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label"><Settings size={16} style={{marginRight: '8px'}}/>Versión</label>
            <input 
              type="text" 
              className="modern-input"
              value={androidConfig.version} 
              onChange={(e) => setAndroidConfig({...androidConfig, version: e.target.value})} 
            />
          </div>

          <button className="export-btn">
            <FileUp size={20} /> Exportar APK
          </button>
        </div>

        <div className="phone-preview-panel">
          <div className="phone-mockup">
            <div className="phone-notch"></div>
            <div className="screen">
               <div className="screen-content">
                  <div className="app-icon-preview">
                    {androidConfig.appName ? androidConfig.appName[0].toUpperCase() : 'N'}
                  </div>
                  <p className="app-name-preview">{androidConfig.appName || 'App Name'}</p>
                  <p className="app-version-preview">v{androidConfig.version}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AndroidApp;
