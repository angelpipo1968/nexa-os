import React, { useState } from 'react';
import { APP_REGISTRY } from '../lib/appRegistry';
import { AppLauncher } from './AppLauncher';
import { Power, Wifi, Battery, Clock, Search, MessageSquare } from 'lucide-react';

export default function NexaDesktop({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunch = (appId: string) => {
    setOpenApp(appId);
  };

  const handleClose = () => {
    setOpenApp(null);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center overflow-hidden flex flex-col font-sans text-white">
      {/* Top Bar */}
      <div className="bg-black/40 backdrop-blur-md px-4 py-1 flex justify-between items-center text-xs font-medium border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="font-bold text-blue-400">NEXA OS</span>
          <span className="hidden sm:inline text-gray-300">Archivo</span>
          <span className="hidden sm:inline text-gray-300">Edición</span>
          <span className="hidden sm:inline text-gray-300">Ver</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
             <Wifi className="w-3 h-3" />
             <Battery className="w-3 h-3" />
          </div>
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={onLogout} className="hover:text-red-400 transition-colors">
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="flex-1 p-6 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 content-start animate-in fade-in duration-500">
        {Object.values(APP_REGISTRY).map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => handleLaunch(app.id)}
              className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg
                ${app.id === 'chatbot' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 
                  app.id === 'settings' ? 'bg-gradient-to-br from-slate-600 to-slate-800' :
                  'bg-gradient-to-br from-slate-700/80 to-slate-900/80 backdrop-blur-sm border border-white/10'}
                group-hover:scale-110 transition-transform duration-200
              `}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-xs text-center font-medium text-white/90 drop-shadow-md px-1 rounded">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dock (Optional, for quick access) */}
      <div className="mb-4 mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
        {['chatbot', 'terminal', 'file_manager', 'settings'].map(id => {
            const app = APP_REGISTRY[id];
            if (!app) return null;
            const Icon = app.icon;
            return (
                <button 
                    key={id}
                    onClick={() => handleLaunch(id)}
                    className="p-2.5 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-2 active:scale-95 tooltip"
                    title={app.name}
                >
                    <Icon className="w-6 h-6 text-white" />
                </button>
            )
        })}
        <div className="w-px h-8 bg-white/20 mx-1"></div>
        <button className="p-2.5 rounded-xl hover:bg-white/20 transition-all">
            <Search className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* App Launcher / Window Manager */}
      <AppLauncher
        isOpen={!!openApp}
        appId={openApp}
        onClose={handleClose}
        onSwitchApp={(id) => setOpenApp(id)}
      />
    </div>
  );
}
