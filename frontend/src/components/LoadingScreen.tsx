import React from 'react';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-blue-600/15 rounded-[100%] blur-[80px] pointer-events-none" />
      <div className="relative z-10 text-center">
        {/* Animated logo */}
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-black text-2xl">R</span>
          </div>
          {/* Orbit ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        </div>
        <p className="text-white font-semibold text-lg">{message}</p>
        <p className="text-gray-500 text-sm mt-1">Resume AI Platform</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
