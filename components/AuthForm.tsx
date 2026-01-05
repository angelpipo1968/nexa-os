import React, { useState } from 'react';
import { auth } from '../lib/auth-service';
import { User, Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function AuthForm({ onSuccess, defaultMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await auth.signUp(email, password, name);
        if (error) throw error;
        
        if (data?.user && !data?.session) {
            setMessage('¡Cuenta creada! Por favor revisa tu email para confirmar.');
        } else {
            if (onSuccess) onSuccess();
        }
      } else {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setLoading(true);
        const { error } = await auth.signInWithGoogle();
        if (error) throw error;
    } catch (err: any) {
        setError(err.message || 'Error iniciando sesión con Google');
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a NEXA AI'}
        </h2>
        <p className="text-slate-400 text-sm">
          {mode === 'login' 
            ? 'Accede a tu memoria y configuraciones' 
            : 'Comienza tu viaje con tu asistente personal'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 ml-1">Nombre</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Tu nombre"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 ml-1">Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center animate-in fade-in">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs text-center animate-in fade-in">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f172a] px-2 text-slate-500">O continúa con</span>
            </div>
        </div>

        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
            Google
        </button>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium hover:underline focus:outline-none"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}