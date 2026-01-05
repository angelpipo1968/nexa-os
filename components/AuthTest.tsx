import React, { useState } from 'react';
import EnhancedAuthService from '../lib/auth_integration';
import { Shield, CheckCircle, AlertTriangle, Fingerprint } from 'lucide-react';

export default function AuthTest() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const testAuth = async () => {
    addLog('Iniciando prueba de autenticación...');
    
    const testUser = { 
        id: 123, 
        name: 'Test User',
        timestamp: new Date().toISOString()
    };
    
    // 1. Almacenar usuario
    addLog('Intentando almacenar usuario seguro...');
    const stored = await EnhancedAuthService.storeUserSecure(testUser);
    addLog(`Usuario almacenado: ${stored ? 'ÉXITO' : 'FALLO'}`);
    
    if (stored) {
        // 2. Obtener usuario
        addLog('Intentando recuperar usuario...');
        const user = await EnhancedAuthService.getSecureUser();
        if (user) {
            addLog(`Usuario recuperado: ${JSON.stringify(user)}`);
        } else {
            addLog('Fallo al recuperar usuario (null)');
        }
    }

    // 3. Probar Biometría
    addLog('Verificando disponibilidad biométrica...');
    const bioSetup = await EnhancedAuthService.setupBiometricAuth();
    if (bioSetup) {
        addLog(`Biometría disponible: ${JSON.stringify(bioSetup)}`);
        
        // Intentar autenticación (solo si es nativo, en web fallará o retornará false)
        addLog('Solicitando autenticación biométrica...');
        const authResult = await EnhancedAuthService.authenticateWithBiometrics();
        addLog(`Resultado autenticación: ${authResult ? 'APROBADO' : 'DENEGADO/CANCELADO'}`);
    } else {
        addLog('Biometría NO disponible en este dispositivo');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="w-6 h-6 text-blue-600" />
        <h3 className="font-bold text-gray-800">Prueba de Autenticación Android</h3>
      </div>
      
      <button 
        onClick={testAuth}
        className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
      >
        <Shield size={18} />
        Ejecutar Diagnóstico de Seguridad
      </button>

      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs h-40 overflow-y-auto border border-gray-800 shadow-inner">
        {logs.length === 0 ? (
            <span className="text-gray-500 opacity-50">Esperando ejecución...</span>
        ) : (
            logs.map((log, i) => (
                <div key={i} className="mb-1 border-b border-gray-800/50 pb-1 last:border-0">
                    {log}
                </div>
            ))
        )}
      </div>
    </div>
  );
}
