import React, { useState } from 'react';
import { Zap, Download, Share2 } from 'lucide-react';

const LogoGenerator = () => {
  const [logoText, setLogoText] = useState('NEXA');
  const [logoStyle, setLogoStyle] = useState('Cyberpunk');
  const [generatedLogo, setGeneratedLogo] = useState(null);

  const handleGenerate = () => {
    setGeneratedLogo(null);
    setTimeout(() => setGeneratedLogo(`https://via.placeholder.com/300x300/000000/00FFFF?text=${logoText}`), 1500);
  };

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
      <button className="action-btn primary" onClick={handleGenerate}>
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
};

export default LogoGenerator;
