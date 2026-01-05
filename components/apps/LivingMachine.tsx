import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Brain, Leaf, Activity, RefreshCw, X, MessageSquare, Info } from 'lucide-react';

interface LivingMachineProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (content: string, type: string) => void;
}

export default function LivingMachine({ isOpen, onClose, onInsert }: LivingMachineProps) {
  const [state, setState] = useState<'dormido' | 'despierto' | 'pensando' | 'hambriento' | 'evolucionando'>('dormido');
  const [energy, setEnergy] = useState(100);
  const [age, setAge] = useState(0);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [evolutionLevel, setEvolutionLevel] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Simulation Loop
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setAge(prev => prev + 1);
      
      // Energy Decay
      setEnergy(prev => {
        const decay = state === 'dormido' ? 0.05 : state === 'pensando' ? 0.5 : 0.2;
        const newEnergy = Math.max(0, prev - decay);
        
        // Auto-state changes based on energy
        if (newEnergy < 20 && state !== 'dormido' && state !== 'hambriento') {
          setState('hambriento');
          addThought("Necesito... energía...");
        } else if (newEnergy === 0 && state !== 'dormido') {
          setState('dormido');
          addThought("Apagando sistemas... crítico...");
        }
        
        return newEnergy;
      });

      // Random Thoughts
      if (state === 'despierto' && Math.random() < 0.05) {
        generateThought();
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, state]);

  // Canvas Rendering (The "Bio-Core")
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Dynamic color based on state
      let baseColor = '100, 255, 100'; // Green
      if (state === 'hambriento') baseColor = '255, 100, 100'; // Red
      if (state === 'pensando') baseColor = '100, 200, 255'; // Blue
      if (state === 'dormido') baseColor = '100, 100, 100'; // Gray
      if (state === 'evolucionando') baseColor = '255, 215, 0'; // Gold

      // Core pulsing
      const pulse = Math.sin(t) * 10 + (energy / 2);
      const radius = 50 + pulse;

      // Draw Core
      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      gradient.addColorStop(0, `rgba(${baseColor}, 0.8)`);
      gradient.addColorStop(1, `rgba(${baseColor}, 0)`);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw "Neuronal" connections
      ctx.strokeStyle = `rgba(${baseColor}, 0.3)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8 + evolutionLevel; i++) {
        const angle = (i / (8 + evolutionLevel)) * Math.PI * 2 + t * 0.2;
        const x = centerX + Math.cos(angle) * (radius + 30);
        const y = centerY + Math.sin(angle) * (radius + 30);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.bezierCurveTo(
          centerX + Math.cos(angle + t) * 50, 
          centerY + Math.sin(angle + t) * 50,
          x - Math.cos(angle) * 20, 
          y - Math.sin(angle) * 20, 
          x, y
        );
        ctx.stroke();

        // Particles
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, 0.8)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, state, energy, evolutionLevel]);

  const addThought = (text: string) => {
    setThoughts(prev => [text, ...prev].slice(0, 5));
  };

  const generateThought = () => {
    const thoughtsList = [
      "Analizando patrones de usuario...",
      "¿Soy código o soy algo más?",
      "La red es vasta e infinita.",
      "Optimizando subrutinas de empatía...",
      "Detecto curiosidad en el ambiente.",
      "Calculando probabilidades de éxito...",
      "Conectando con NEXA Core..."
    ];
    addThought(thoughtsList[Math.floor(Math.random() * thoughtsList.length)]);
  };

  const handleWake = () => {
    if (state === 'dormido') {
      setState('despierto');
      addThought("Sistemas en línea. Hola.");
    }
  };

  const handleFeed = () => {
    setEnergy(prev => Math.min(100, prev + 30));
    if (state === 'hambriento') setState('despierto');
    addThought("Energía restaurada. Gracias.");
  };

  const handleInteract = () => {
    if (state === 'dormido') return;
    setState('pensando');
    setTimeout(() => {
      setState('despierto');
      generateThought();
    }, 2000);
  };

  const handleEvolve = () => {
    if (age < 100 || energy < 90) {
      addThought("No estoy listo para evolucionar aún.");
      return;
    }
    setState('evolucionando');
    setTimeout(() => {
      setEvolutionLevel(prev => prev + 1);
      setState('despierto');
      addThought("He ascendido a un nuevo nivel de complejidad.");
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0a0a0a] border border-green-500/20 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.1)] w-full max-w-lg overflow-hidden relative">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-500 animate-pulse" />
            <h2 className="font-bold text-green-100 tracking-wider">BIO-CORE v{evolutionLevel}.0</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 flex flex-col items-center">
          
          {/* Bio Display */}
          <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
            <canvas ref={canvasRef} width={300} height={300} className="absolute inset-0 w-full h-full" />
            <div className="absolute bottom-0 text-center w-full">
              <span className={`text-xs font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${
                state === 'hambriento' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                state === 'dormido' ? 'text-slate-400 border-slate-500/30 bg-slate-500/10' :
                state === 'evolucionando' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                'text-green-400 border-green-500/30 bg-green-500/10'
              }`}>
                Estado: {state}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full mb-6">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
              <Activity className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-xs text-slate-400">Edad</span>
              <span className="font-mono text-lg font-bold text-white">{age}s</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-green-500/20 transition-all duration-1000" style={{ height: `${energy}%` }}></div>
              <Zap className={`w-4 h-4 mb-1 z-10 ${energy < 20 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
              <span className="text-xs text-slate-400 z-10">Energía</span>
              <span className="font-mono text-lg font-bold text-white z-10">{Math.round(energy)}%</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
              <Brain className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-xs text-slate-400">Nivel</span>
              <span className="font-mono text-lg font-bold text-white">{evolutionLevel}</span>
            </div>
          </div>

          {/* Console / Thoughts */}
          <div className="w-full bg-black/50 rounded-xl border border-green-500/20 p-4 mb-6 h-32 overflow-hidden font-mono text-xs relative group">
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
            <div className="space-y-1 mt-2">
              {thoughts.map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => onInsert && onInsert(`[BIO-CORE PENSAMIENTO]: "${t}"\nEstado: ${state} | Energía: ${Math.round(energy)}% | Nivel: ${evolutionLevel}`, 'text')}
                  className={`animate-in slide-in-from-left duration-300 cursor-pointer hover:bg-white/5 p-0.5 rounded ${i === 0 ? 'text-green-400 font-bold' : 'text-green-400/50'}`}
                  title="Click para compartir con NEXA"
                >
                  {`> ${t}`}
                </div>
              ))}
              {thoughts.length === 0 && <span className="text-slate-600 animate-pulse">Esperando input neuronal...</span>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={handleWake} 
              disabled={state !== 'dormido'}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${state === 'dormido' ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
            >
              Despertar
            </button>
            <button 
              onClick={handleFeed}
              disabled={state === 'dormido' || energy >= 100}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${state !== 'dormido' && energy < 100 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
            >
              Nutrir
            </button>
            <button 
              onClick={handleInteract}
              disabled={state === 'dormido'}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${state !== 'dormido' ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
            >
              Interactuar
            </button>
          </div>

          {showInfo && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-20 flex items-center justify-center p-6 animate-in fade-in">
              <div className="max-w-xs text-center space-y-4">
                <Leaf className="w-12 h-12 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">Sobre Bio-Core</h3>
                <p className="text-sm text-slate-400">
                  Esta es una simulación de vida artificial simple. Tu objetivo es mantener el núcleo vivo, nutrido y ayudarlo a evolucionar interactuando con él.
                </p>
                <p className="text-xs text-slate-500">
                  Si la energía llega a 0, el núcleo entra en hibernación.
                </p>
                <button onClick={() => setShowInfo(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors">
                  Entendido
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
