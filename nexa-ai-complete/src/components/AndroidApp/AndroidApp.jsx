import React, { useState } from 'react';
import { FileUp } from 'lucide-react';

const AndroidApp = () => {
  const [androidConfig, setAndroidConfig] = useState({
    appName: 'NexaApp',
    packageName: 'com.nexa.app',
    version: '1.0.0'
  });

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
};

export default AndroidApp;
