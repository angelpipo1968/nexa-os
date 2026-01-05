import React, { useState } from 'react';
import { auth } from '../lib/auth-service';
import { X, Mail, Lock, LogIn, UserPlus, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await auth.signUp(email, password, name || 'Usuario');
        if (error) throw error;
        if (data.user && !data.session) {
           setMessage('¡Cuenta creada! Revisa tu email para confirmar.');
        } else {
           onClose();
        }
      } else {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
     alert("Inicio de sesión con Google deshabilitado temporalmente.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {mode === 'login' ? 'Bienvenido a NEXA' : 'Crear Cuenta'}
          </h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-sm text-gray-600 ml-1 font-medium">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-600 ml-1 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600 ml-1 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm text-center animate-in slide-in-from-top-2">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={20} /> Iniciar Sesión
                </>
              ) : (
                <>
                  <UserPlus size={20} /> Registrarse
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 mt-4">
              Modo Local Habilitado
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-2 text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
