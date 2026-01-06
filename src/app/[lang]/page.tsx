'use client';

import React, { useState, useEffect } from 'react';
// Ajustamos las importaciones asumiendo que components sigue en la raíz por ahora
// O idealmente moveremos components a src/components más tarde.
// Usamos rutas relativas profundas para llegar a la raíz.
import NexaPanel from '../../../../components/NexaPanel';
import '../../../../app/nexa-panel.css'; // Reutilizamos el CSS existente
import { Bot, Zap, Globe, MessageSquare, Mic, Shield, Menu, X, ArrowRight, Check } from 'lucide-react';

// --- CONFIGURACIÓN & TEXTOS ---
const TRANSLATIONS = {
  es: {
    heroTitle: "NEXA AI",
    heroSubtitle: "Tu Máquina Viviente Soberana",
    heroDesc: "Inteligencia Artificial local, privada y potente. Chat, voz, generación de video y diseño en una sola plataforma.",
    ctaStart: "Empezar Ahora",
    ctaLogin: "Iniciar Sesión",
    features: {
      local: { title: "100% Local", desc: "Tus datos nunca salen de tu dispositivo." },
      voice: { title: "Control por Voz", desc: "Habla con NEXA en tiempo real." },
      design: { title: "Estudio Creativo", desc: "Genera logos y videos al instante." }
    },
    auth: {
      title: "Bienvenido a NEXA",
      email: "Correo Electrónico",
      phone: "Teléfono (Opcional)",
      btn: "Acceder / Registrarse",
      footer: "Acceso seguro vía Token"
    }
  },
  en: {
    heroTitle: "NEXA AI",
    heroSubtitle: "Your Sovereign Living Machine",
    heroDesc: "Local, private, and powerful AI. Chat, voice, video generation, and design in one platform.",
    ctaStart: "Start Now",
    ctaLogin: "Login",
    features: {
      local: { title: "100% Local", desc: "Your data never leaves your device." },
      voice: { title: "Voice Control", desc: "Talk to NEXA in real-time." },
      design: { title: "Creative Studio", desc: "Generate logos and videos instantly." }
    },
    auth: {
      title: "Welcome to NEXA",
      email: "Email Address",
      phone: "Phone (Optional)",
      btn: "Access / Register",
      footer: "Secure Token Access"
    }
  },
  zh: {
    heroTitle: "NEXA AI",
    heroSubtitle: "您的主权生命机器",
    heroDesc: "本地、私密且强大的人工智能。聊天、语音、视频生成和设计集于一体。",
    ctaStart: "立即开始",
    ctaLogin: "登录",
    features: {
      local: { title: "100% 本地", desc: "您的数据永远不会离开您的设备。" },
      voice: { title: "语音控制", desc: "与 NEXA 实时交谈。" },
      design: { title: "创意工作室", desc: "即时生成徽标和视频。" }
    },
    auth: {
      title: "欢迎来到 NEXA",
      email: "电子邮件地址",
      phone: "电话（可选）",
      btn: "访问 / 注册",
      footer: "安全令牌访问"
    }
  }
};

export default function Page({ params }: { params: { lang: string } }) {
  // Validar idioma, fallback a 'es'
  const langKey = (['es', 'en', 'zh'].includes(params.lang) ? params.lang : 'es') as keyof typeof TRANSLATIONS;
  
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [geoInfo, setGeoInfo] = useState<string>('');

  const t = TRANSLATIONS[langKey];

  // 1. Verificar conexión con el Backend al iniciar
  useEffect(() => {
    const checkSystem = async () => {
      try {
        // Usamos el proxy de Vercel (/api/py/...) que redirige a Render
        const res = await fetch('/api/py/geo'); 
        if (res.ok) {
          const data = await res.json();
          setSystemStatus('online');
          setGeoInfo(`${data.city || 'Ubicación'}, ${data.country || 'Desconocido'}`);
        } else {
          setSystemStatus('offline');
        }
      } catch (e) {
        console.error("Backend unreachable:", e);
        setSystemStatus('offline');
      }
    };
    checkSystem();
  }, []);

  // 2. Enviar datos reales al Backend (Webhook)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/py/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'user_login_attempt',
          data: { email: formData.email, timestamp: new Date().toISOString() },
          source: 'nexa-web-ui'
        })
      });
      console.log("Login signal sent to Core");
    } catch (err) {
      console.error("Failed to signal core:", err);
    }
    // Continuar al dashboard independientemente (para no bloquear al usuario)
    setView('dashboard');
  };

  // Render Dashboard (NexaPanel existente)
  if (view === 'dashboard') {
    return (
      <div className="h-screen w-screen bg-black">
        <NexaPanel config={{
          theme: 'futurista',
          modules: ['chat', 'asistente', 'herramientas'],
          colors: { primary: '#0ff0fc', secondary: '#9600ff', background: '#0a0a1a' }
        }} />
        {/* Botón flotante para salir (demo) */}
        <button 
          onClick={() => setView('landing')}
          className="fixed bottom-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 z-50"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full top-0 z-40 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg animate-pulse" />
            <span className="text-xl font-bold tracking-tight">NEXA OS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {/* Indicador de Estado del Sistema */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md ${
              systemStatus === 'online' 
                ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400' 
                : 'border-red-500/30 bg-red-950/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-cyan-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-mono tracking-wider">
                {systemStatus === 'online' ? `SYSTEM ONLINE • ${geoInfo}` : 'SYSTEM OFFLINE'}
              </span>
            </div>

            <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Manifesto</a>
            <button 
              onClick={() => setView('auth')}
              className="px-5 py-2 bg-white text-black rounded-full font-medium hover:bg-cyan-50 transition-colors"
            >
              {t.ctaLogin}
            </button>
          </div>

          <button className="md:hidden p-2 text-white">
            <Menu />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {view === 'landing' && (
        <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm font-medium text-gray-300">v1.0.0 Stable Release</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setView('auth')}
              className="group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]"
            >
              {t.ctaStart}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium text-lg transition-all">
              Watch Demo
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-cyan-400" />}
              title={t.features.local.title}
              desc={t.features.local.desc}
            />
            <FeatureCard 
              icon={<Mic className="w-8 h-8 text-purple-400" />}
              title={t.features.voice.title}
              desc={t.features.voice.desc}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title={t.features.design.title}
              desc={t.features.design.desc}
            />
          </div>
        </main>
      )}

      {/* --- AUTH VIEW --- */}
      {view === 'auth' && (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
            <button 
              onClick={() => setView('landing')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">{t.auth.title}</h2>
              <p className="text-gray-400 text-sm mt-2">{t.auth.footer}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.auth.email}</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="neo@matrix.com"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20"
              >
                {t.auth.btn}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
      <div className="mb-4 p-3 bg-black/30 rounded-xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
