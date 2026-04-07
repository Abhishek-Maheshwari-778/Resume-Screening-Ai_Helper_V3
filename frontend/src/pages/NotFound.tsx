import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        {/* 404 Number */}
        <div className="text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 select-none mb-4">
          404
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
          >
            ← Back to Home
          </Link>
          <Link
            to="/auth"
            className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Decorative orbits */}
        <div className="mt-16 flex justify-center gap-6 text-4xl opacity-30 select-none">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>📄</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>🤖</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🎯</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
