import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedTheme = localStorage.getItem('app-theme-preference');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    setIsLight((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('app-theme-preference', 'light');
      } else {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('app-theme-preference', 'dark');
      }
      return newTheme;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center shadow-inner border border-white/10 ${
        isLight ? 'bg-indigo-300' : 'bg-[#0a0f1a]'
      }`}
      aria-label="Toggle Theme"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div
        className={`absolute w-5 h-5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-500 ease-in-out flex items-center justify-center ${
          isLight 
            ? 'transform translate-x-[26px] bg-yellow-400' 
            : 'transform translate-x-[6px] bg-[#161b22] border border-blue-500/50'
        }`}
      >
        {isLight ? (
          <span className="text-[10px] text-white preserve-color">☀️</span>
        ) : (
          <span className="text-[10px] text-blue-400 preserve-color">🌙</span>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
