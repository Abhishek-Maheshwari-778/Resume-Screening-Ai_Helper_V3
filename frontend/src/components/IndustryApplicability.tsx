import React from 'react';

interface Category {
  label: string;
  score: number;
  color: string;
}

interface IndustryApplicabilityProps {
  score: number;
  breakdown?: {
    [key: string]: number;
  };
  compact?: boolean;
}

const IndustryApplicability: React.FC<IndustryApplicabilityProps> = ({ score, breakdown, compact }) => {
  const categories: Category[] = [
    { label: 'TECHNICAL DEPTH', score: breakdown?.Keywords || 0, color: 'from-blue-500 to-cyan-400' },
    { label: 'DOMAIN ALIGNMENT', score: breakdown?.Structure || 0, color: 'from-emerald-500 to-green-400' },
    { label: 'RECRUITER APPEAL', score: breakdown?.Readability || 0, color: 'from-orange-500 to-red-400' },
  ];

  if (!compact) {
    categories.push({ label: 'ATS OPTIMIZATION', score: breakdown?.Formatting || 0, color: 'from-purple-500 to-pink-400' });
  }

  const readiness = score >= 85 ? 'ELITE READY' : score >= 70 ? 'INDUSTRY COMPLIANT' : score >= 50 ? 'MARKET VOLATILE' : 'NEEDS OVERHAUL';

  return (
    <div className={`bg-[#0d1117] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group ${compact ? 'scale-95' : ''}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all opacity-40 invisible dark:visible" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-40 italic mb-2">INDUSTRIAL APPLICABILITY UNIT</h4>
          <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{readiness}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-primary italic leading-none">{score}%</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-[#666] mt-1 italic">VIABILITY INDEX</div>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {categories.map((cat, i) => (
           <div key={i} className="space-y-4">
              <div className="flex justify-between items-end px-1">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888] italic">{cat.label}</span>
                 <span className={`text-xs font-black italic ${score >= 70 ? 'text-white' : 'text-primary'}`}>{cat.score}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div 
                   className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.2)]`} 
                   style={{ width: `${cat.score}%` }}
                 />
              </div>
           </div>
        ))}
      </div>

      <div className="mt-12 py-6 px-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center gap-6 group hover:border-primary/20 transition-all">
         <div className="text-2xl text-emerald-500 animate-pulse">⚡</div>
         <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed uppercase tracking-tight">
           {score >= 80 ? 'RESUME EXCEEDS GLOBAL INDUSTRY STANDARDS FOR THIS ROLE.' : 
            score >= 60 ? 'MARKET READY WITH MINOR OPTIMIZATION OPPORTUNITIES.' : 
            'SIGNIFICANT STRUCTURAL RISKS DETECTED FOR INDUSTRIAL SELECTION.'}
         </p>
      </div>
    </div>
  );
};

export default IndustryApplicability;
