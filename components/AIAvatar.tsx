import React, { useEffect, useState } from 'react';
import { Zap, Activity, Cpu } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AIAvatar({ isSpeaking, isListening, isThinking, size = 'md' }: AIAvatarProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setPulse(Math.random() * 1.5 + 0.5);
      }, 100);
    } else {
      setPulse(1);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Core */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 blur-sm transition-all duration-300 ${
        isSpeaking ? 'scale-110' : 'scale-100'
      }`} style={{
        transform: isSpeaking ? `scale(${pulse})` : 'scale(1)',
        opacity: isThinking ? 0.8 : 1
      }} />
      
      {/* Inner Glow */}
      <div className={`absolute inset-1 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center z-10 transition-all duration-500 ${
        isListening ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.5)]' : ''
      }`}>
        {isThinking ? (
            <Activity className="w-1/2 h-1/2 text-white animate-spin-slow" />
        ) : isSpeaking ? (
            <div className="flex gap-0.5 items-center h-1/3">
                <div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_0ms] h-full"></div>
                <div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_200ms] h-3/4"></div>
                <div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_400ms] h-full"></div>
            </div>
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                 <div className="absolute w-full h-full border-2 border-transparent border-t-white/50 rounded-full animate-spin"></div>
            </div>
        )}
      </div>

      {/* Orbital Rings */}
      <div className={`absolute -inset-2 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite] ${isThinking ? 'border-cyan-400/60' : ''}`}></div>
      <div className={`absolute -inset-4 border border-blue-500/20 rounded-full animate-[spin_7s_linear_infinite_reverse]`}></div>
    </div>
  );
}
