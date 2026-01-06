'use client';

import React from 'react';
// import Lottie from 'lottie-react'; // Descomentar cuando instales la librería
// import animationData from '../public/avatar-animation.json'; // Tu archivo Lottie

const LottieAvatar = () => {
  return (
    <div className="w-64 h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
      {/* 
      <Lottie 
        animationData={animationData} 
        loop={true} 
        className="relative z-10"
      />
      */}
      <div className="flex items-center justify-center h-full text-cyan-400 border-2 border-cyan-500/30 rounded-full">
        <span className="animate-pulse">Avatar Placeholder (Lottie)</span>
      </div>
    </div>
  );
};

export default LottieAvatar;
