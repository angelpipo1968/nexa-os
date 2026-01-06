'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Zap, Globe, MessageSquare, Mic, Shield, Menu, X, ArrowRight, Check } from 'lucide-react';
import NexaPanel from '../components/NexaPanel';
import './nexa-panel.css';

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

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en' | 'zh'>('es');
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '' });

  const t = TRANSLATIONS[lang];

  // Simulación de Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la llamada al backend (Fly.io / Local)
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

  // Render Landing / Auth
  return (
    <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-[#0ff0fc] selection:text-black overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 bg-[#050510]/80 backdrop-blur-md border-b border-[#ffffff]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0ff0fc] to-[#9600ff] rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                NEXA AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setLang('es')} className={`text-sm ${lang === 'es' ? 'text-[#0ff0fc]' : 'text-gray-400 hover:text-white'}`}>ES</button>
              <button onClick={() => setLang('en')} className={`text-sm ${lang === 'en' ? 'text-[#0ff0fc]' : 'text-gray-400 hover:text-white'}`}>EN</button>
              <button onClick={() => setLang('zh')} className={`text-sm ${lang === 'zh' ? 'text-[#0ff0fc]' : 'text-gray-400 hover:text-white'}`}>ZH</button>
              
              <button 
                onClick={() => setView('auth')}
                className="bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all border border-[#ffffff]/10"
              >
                {t.ctaLogin}
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#050510] pt-20 px-4">
          <div className="flex flex-col gap-4">
            <button onClick={() => { setView('auth'); setIsMenuOpen(false); }} className="w-full bg-[#0ff0fc] text-black py-3 rounded-xl font-bold">
              {t.ctaLogin}
            </button>
            <div className="flex justify-center gap-8 mt-8">
              <button onClick={() => setLang('es')} className={lang === 'es' ? 'text-[#0ff0fc]' : 'text-gray-400'}>ES</button>
              <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-[#0ff0fc]' : 'text-gray-400'}>EN</button>
              <button onClick={() => setLang('zh')} className={lang === 'zh' ? 'text-[#0ff0fc]' : 'text-gray-400'}>ZH</button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      {view === 'landing' && (
        <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
          {/* Background Glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0ff0fc]/10 rounded-full blur-[120px] -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/20 text-[#0ff0fc] text-xs font-medium mb-8 animate-fade-in">
            <Zap className="w-3 h-3" />
            <span>v2.5 Stable Release</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            {t.heroTitle} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ff0fc] via-[#9600ff] to-[#0ff0fc] animate-gradient">
              {t.heroSubtitle}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setView('auth')}
              className="group relative px-8 py-4 bg-[#0ff0fc] text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                {t.ctaStart} <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            
            <button className="px-8 py-4 bg-[#ffffff]/5 hover:bg-[#ffffff]/10 text-white font-medium rounded-full border border-[#ffffff]/10 backdrop-blur-sm transition-colors">
              Watch Demo
            </button>
          </div>

          {/* FEATURES GRID */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-[#0ff0fc]" />}
              title={t.features.local.title}
              desc={t.features.local.desc}
            />
            <FeatureCard 
              icon={<Mic className="w-6 h-6 text-[#9600ff]" />}
              title={t.features.voice.title}
              desc={t.features.voice.desc}
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-pink-500" />}
              title={t.features.design.title}
              desc={t.features.design.desc}
            />
          </div>
        </main>
      )}

      {/* AUTH VIEW */}
      {view === 'auth' && (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-[#ffffff]/10 rounded-2xl p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#9600ff]/20 rounded-full blur-[50px]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">{t.auth.title}</h2>
              <p className="text-gray-400 mb-8">Accede a tu panel soberano.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.auth.email}</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0ff0fc] transition-colors"
                    placeholder="usuario@nexa.ai"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.auth.phone}</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0ff0fc] transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0ff0fc] to-[#9600ff] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mt-4"
                >
                  {t.auth.btn}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                {t.auth.footer}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[#ffffff]/5 border border-[#ffffff]/5 hover:border-[#0ff0fc]/30 transition-colors group">
      <div className="mb-4 p-3 bg-black/50 rounded-lg inline-block group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
