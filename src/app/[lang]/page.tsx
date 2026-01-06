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

  const t = TRANSLATIONS[langKey];

  // Simulación de Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la llamada al backend (FastAPI / Node)
    console.log("Login con:", formData);
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
          className="fixed bottom-4 right-4 z-50 bg-red-500/20 hover:bg-red-500/40 text-red-200 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-red-500/30"
        >
          Exit Demo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans selection:bg-[#0ff0fc]/30">
      {/* Navbar Simple */}
      <nav className="fixed w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0ff0fc] to-[#9600ff]" />
              <span className="font-bold text-xl tracking-wider">NEXA OS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Manifesto</a>
              <button onClick={() => setView('auth')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/10">
                {t.ctaLogin}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {view === 'landing' && (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0ff0fc] via-white to-[#9600ff]">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              {t.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setView('auth')}
                className="group relative px-8 py-4 bg-[#0ff0fc] text-black font-bold rounded-full overflow-hidden hover:scale-105 transition-transform"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t.ctaStart} <ArrowRight size={20} />
                </span>
                <div className="absolute inset-0 bg-white/50 translate-y-full group-hover:translate-y-0 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9600ff]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0ff0fc]/20 rounded-full blur-[100px]" />
          </div>
        </div>
      )}

      {/* Auth View */}
      {view === 'auth' && (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ff0fc] to-[#9600ff]" />
            <h2 className="text-3xl font-bold mb-6 text-center">{t.auth.title}</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.auth.email}</label>
                <input 
                  type="email" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-[#0ff0fc] outline-none transition-colors"
                  placeholder="neo@matrix.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#0ff0fc] to-[#9600ff] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                {t.auth.btn}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Shield size={12} /> {t.auth.footer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
