import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie_consent');
    if (!hasConsented) {
      // Delay showing it slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setIsVisible(false);
  };

  const acceptEssentials = () => {
    localStorage.setItem('cookie_consent', 'essentials');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 sm:bottom-6 sm:left-6 sm:right-auto pointer-events-none animate-in slide-in-from-bottom-5 duration-700">
      <div className="bg-[#161b22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 text-white max-w-sm pointer-events-auto relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-start gap-4 mb-5 relative z-10">
          <div className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🍪</div>
          <div>
            <h4 className="font-bold text-lg mb-1">Your Privacy</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              We use cookies to analyze site traffic, personalize content, and provide you with a smooth AI experience.
              Read our <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 relative z-10">
          <button 
            onClick={acceptAll} 
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Accept All Cookies
          </button>
          <button 
            onClick={acceptEssentials} 
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm rounded-xl transition-colors border border-white/10"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
