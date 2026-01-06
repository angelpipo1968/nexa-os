import React, { useState } from 'react';
import { Zap, Download, Share2, Wand2, Image as ImageIcon } from 'lucide-react';
import './LogoGenerator.css';

const LogoGenerator = () => {
  const [logoText, setLogoText] = useState('NEXA');
  const [logoStyle, setLogoStyle] = useState('Cyberpunk');
  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedLogo(null);
    
    // Simulate API call
    setTimeout(() => {
      // Use different placeholder colors based on style
      let bg = '000000';
      let fg = '00FFFF';
      
      if (logoStyle === 'Minimalist') { bg = 'FFFFFF'; fg = '000000'; }
      if (logoStyle === 'Abstract') { bg = '1A1A1A'; fg = 'FF0080'; }
      
      setGeneratedLogo(`https://via.placeholder.com/300x300/${bg}/${fg}?text=${logoText}`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="logo-generator-container">
      <div className="generator-header">
        <h2 className="generator-title">
          <Wand2 size={32} style={{marginRight: '12px', verticalAlign: 'middle', color: '#FF0080'}}/>
          Generador de Logos IA
        </h2>
        <p className="generator-subtitle">Crea identidades visuales únicas potenciadas por redes neuronales</p>
      </div>

      <div className="generator-content">
        <div className="controls-panel">
          <div className="form-group">
            <label className="form-label">Nombre de la Marca</label>
            <input 
              type="text" 
              className="modern-input"
              value={logoText} 
              onChange={(e) => setLogoText(e.target.value)} 
              placeholder="Ej. NEXA Corp"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estilo Visual</label>
            <select 
              className="modern-select"
              value={logoStyle} 
              onChange={(e) => setLogoStyle(e.target.value)}
            >
              <option value="Cyberpunk">Cyberpunk & Neon</option>
              <option value="Minimalist">Minimalista Moderno</option>
              <option value="Abstract">Abstracto Geométrico</option>
              <option value="3D">3D Metálico</option>
              <option value="Organic">Orgánico & Natural</option>
            </select>
          </div>

          <button 
            className="generate-btn" 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{opacity: isGenerating ? 0.7 : 1}}
          >
            {isGenerating ? (
              <>Generando...</>
            ) : (
              <><Zap size={20} /> Generar Identidad</>
            )}
          </button>
        </div>

        <div className="preview-panel">
          <div className="preview-card">
            {generatedLogo ? (
              <>
                <img src={generatedLogo} alt="Generated Logo" className="result-image" />
                <div className="action-bar">
                  <button className="tool-btn" title="Descargar"><Download size={18} /></button>
                  <button className="tool-btn" title="Compartir"><Share2 size={18} /></button>
                </div>
              </>
            ) : (
              <div style={{textAlign: 'center', opacity: 0.5}}>
                {isGenerating ? (
                  <div className="placeholder-text">Procesando vectores...</div>
                ) : (
                  <>
                    <ImageIcon size={48} style={{marginBottom: '16px'}} />
                    <p>La vista previa aparecerá aquí</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoGenerator;
