import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Monitor, User, Shield, Battery, Cpu, Wifi } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'account', label: 'Cuenta', icon: User },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'system', label: 'Sistema', icon: Cpu },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Configuración del Sistema</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-900">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h2 className="text-2xl font-bold mb-6">Personalización</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800 border-2 border-blue-500 cursor-pointer">
                    <div className="w-full h-24 bg-slate-900 rounded-lg mb-3"></div>
                    <p className="font-medium text-center">Modo Oscuro</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed">
                    <div className="w-full h-24 bg-white rounded-lg mb-3"></div>
                    <p className="font-medium text-center">Modo Claro</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Pantalla</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                    <span className="text-gray-300">Brillo</span>
                    <input type="range" className="w-48 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                    <span className="text-gray-300">Escala de UI</span>
                    <select className="bg-slate-700 rounded-lg px-3 py-1 border-none outline-none">
                      <option>100%</option>
                      <option>125%</option>
                      <option>150%</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6">Información del Sistema</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-6 h-6 text-purple-400" />
                    <h3 className="font-bold text-lg">Procesador</h3>
                  </div>
                  <p className="text-gray-400">NEXA Neural Core v1.0</p>
                  <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[45%] animate-pulse"></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">45% Uso</p>
                </div>

                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Battery className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-lg">Energía</h3>
                  </div>
                  <p className="text-gray-400">Estado: Óptimo</p>
                  <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[92%]"></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">92% Restante</p>
                </div>
              </div>

              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                 <h3 className="font-bold text-lg mb-4">Versión del Software</h3>
                 <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-gray-400">Versión OS</span>
                    <span>NEXA OS 2.0.4 (Beta)</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-gray-400">Build</span>
                    <span>20260105.release</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Kernel</span>
                    <span>React Native Web + Capacitor</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-xl">
                    P
                </div>
                <h2 className="text-2xl font-bold">Usuario Administrador</h2>
                <p className="text-gray-400">pipog@nexa-os.dev</p>
                <button className="mt-8 px-6 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                    Cerrar Sesión
                </button>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6">Privacidad y Seguridad</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Wifi className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="font-medium">Telemetría Anónima</p>
                                <p className="text-xs text-gray-400">Ayuda a mejorar NEXA OS</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-6"></div>
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="font-medium">Encriptación de Datos</p>
                                <p className="text-xs text-gray-400">Tus datos están seguros localmente</p>
                            </div>
                        </div>
                        <div className="text-green-400 text-sm flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Activado
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
