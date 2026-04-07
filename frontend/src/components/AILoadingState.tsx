import React, { useState, useEffect } from 'react';

interface AILoadingStateProps {
  message?: string;
  steps?: string[];
}

const defaultSteps = [
  "Parsing document structure...",
  "Extracting semantic keywords...",
  "Aligning with target job description...",
  "Calculating weighted ATS score...",
  "Generating improvement suggestions...",
  "Finalizing AI report..."
];

const AILoadingState: React.FC<AILoadingStateProps> = ({ 
  message = "Analyzing with AI...",
  steps = defaultSteps 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progress through steps automatically to give the illusion of deep work
    // Since backend processing can take 3-10 seconds
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
      {/* Background ambient light */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated AI Core */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[spin_4s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-[spin_3s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 rounded-full border border-emerald-500/50 animate-[spin_2s_linear_infinite]"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse"></div>
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-white mb-2">{message}</h3>
        
        {/* Dynamic Step Text */}
        <div className="h-6 overflow-hidden">
          <div 
            className="flex flex-col transition-transform duration-500 ease-out" 
            style={{ transform: `translateY(-${currentStepIndex * 24}px)` }}
          >
            {steps.map((step, i) => (
              <span key={i} className="text-sm font-medium text-blue-400 h-6 flex items-center justify-center">
                {step}
              </span>
            ))}
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2 mt-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-500 rounded-full ${
                i === currentStepIndex 
                  ? 'w-6 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]' 
                  : i < currentStepIndex 
                    ? 'w-2 bg-blue-500/50' 
                    : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AILoadingState;
