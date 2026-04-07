import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <div className="mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary border-2 border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_10px_30px_rgba(34,211,238,0.3)] font-black">
            🇮🇳 Made for the Indian Job Market
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[var(--text-primary)] mb-8 tracking-tighter leading-none uppercase italic">
            High-Performance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">AI Careers for All</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto font-medium opacity-90 leading-relaxed shadow-sm">
            Professional-grade AI screening at a price that respects your journey. Choose your tier and dominate the talent matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch pb-20">
          {/* Free Tier */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3.5rem] hover:border-primary/20 transition-all flex flex-col text-left group shadow-2xl relative">
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-1 uppercase tracking-widest leading-none">Explorer</h3>
            <p className="text-[var(--text-primary)] text-[11px] mb-10 font-bold opacity-80 uppercase tracking-widest">Base Analysis</p>
            
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">₹0</span>
              <span className="text-[var(--text-primary)] font-bold text-[11px] uppercase tracking-widest opacity-60">/ Lifetime</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1 text-[13px]">
              {['Basic ATS Scoring', 'Industry Keyword Scan', 'PDF Resume Header', 'Community Intelligence'].map((feat, i) => (
                <li key={i} className="flex items-center gap-4 text-[var(--text-secondary)] font-medium">
                  <span className="text-primary font-black">✓</span> {feat}
                </li>
              ))}
            </ul>
            
            <Link to="/auth" className="w-full block text-center py-5 rounded-2xl border border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] text-[var(--text-primary)] font-black text-[11px] uppercase tracking-widest transition-all">
              Initialize Free
            </Link>
          </div>

          {/* Pro Tier - INR 9 */}
          <div className="bg-[var(--bg-card)] border-4 border-primary p-10 rounded-[4rem] shadow-[0_20px_100px_rgba(34,211,238,0.25)] flex flex-col text-left relative transform hover:scale-[1.03] transition-all z-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--text-primary)] text-[var(--bg-base)] px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-50 whitespace-nowrap border-4 border-[var(--bg-base)]">
              🔥 Best Value
            </div>
            
            <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-widest leading-none drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Pro Seeker</h3>
            <p className="text-primary text-[11px] mb-10 font-bold opacity-100 uppercase tracking-widest">Elite Intelligence</p>
            
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-7xl font-black text-[var(--text-primary)] tracking-tighter">₹9</span>
              <span className="text-[var(--text-primary)] font-bold text-[11px] uppercase tracking-widest opacity-60">/ Month</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1 text-[13px] text-[var(--text-primary)]">
              {[
                'Deep AI Multi-JD Rank',
                'AI Rewriting Engine',
                'Priority Talent Matrix',
                'AI Interview Coaching',
                'All Premium Templates'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-4 font-black">
                  <span className="text-emerald-500 font-black">✓</span> {feat}
                </li>
              ))}
            </ul>
            
            <Link to="/auth" className="w-full block text-center py-6 rounded-[2rem] bg-primary text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95">
              Activate Pro Mode
            </Link>
          </div>

          {/* Recruiter Tier - INR 49 */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3.5rem] hover:border-violet-500/20 transition-all flex flex-col text-left group shadow-2xl relative">
            <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-widest leading-none">Recruiter</h3>
            <p className="text-primary text-[11px] mb-10 font-bold opacity-100 uppercase tracking-widest">Bulk Ops</p>
            
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">₹49</span>
              <span className="text-[var(--text-primary)] font-bold text-[11px] uppercase tracking-widest opacity-80">/ Month</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1 text-[13px]">
              {[
                'Bulk Parsing (500+)',
                'Candidate Compare Matrix',
                'Skill Gap Visualizer',
                'Advanced NLP Insights',
                'XLS/CSV Bulk Export'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-4 text-[var(--text-secondary)] font-medium">
                  <span className="text-violet-500 font-bold">✓</span> {feat}
                </li>
              ))}
            </ul>
            
            <Link to="/auth" className="w-full block text-center py-5 rounded-2xl border border-[var(--border-color)] hover:bg-violet-500 hover:text-white text-[var(--text-primary)] font-black text-[11px] uppercase tracking-widest transition-all">
              Initialize Talent Ops
            </Link>
          </div>

          {/* Enterprise - Custom Built */}
          <div className="bg-gradient-to-br from-violet-900/10 to-[var(--bg-card)] border border-violet-500/30 p-10 rounded-[3.5rem] hover:scale-[1.02] transition-all flex flex-col text-left relative overflow-hidden group shadow-2xl shadow-violet-500/5">
            <div className="absolute top-0 right-0 p-10 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all">🌐</div>
            <h3 className="text-xl font-black text-violet-400 mb-1 uppercase tracking-widest leading-none relative z-10">Enterprise</h3>
            <p className="text-[var(--text-secondary)] text-[10px] mb-10 font-bold opacity-60 uppercase tracking-widest relative z-10">Custom Sync</p>
            
            <div className="flex items-baseline gap-1 mb-10 relative z-10">
              <span className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">Custom</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1 text-[13px] relative z-10">
              {[
                'Private Model Tuning',
                'Hybrid Cloud Gateway',
                'Custom SLA Protocol',
                '24/7 Priority Channel',
                'Unlimited Talent Data'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-4 text-[var(--text-secondary)] font-medium">
                  <span className="text-violet-400 font-bold">✓</span> {feat}
                </li>
              ))}
            </ul>
            
            <Link to="/contact" className="w-full block text-center py-6 rounded-[2rem] bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-violet-500/30 relative z-10">
              Engage Sales
            </Link>
          </div>
        </div>

        {/* Global Economy Note */}
        <div className="mt-20 p-12 bg-black/5 hover:bg-black/10 border border-[var(--border-color)] rounded-[4rem] max-w-3xl mx-auto flex flex-col items-center gap-6 transition-all">
          <p className="text-sm text-[var(--text-primary)] italic font-bold opacity-90 max-w-xl">
            "Prices are calculated in Indian Rupees (INR) and include all relevant taxes. We believe professional-grade AI should be a fundamental utility for every seeker."
          </p>
          <div className="w-full h-px bg-[var(--border-color)] opacity-10" />
          <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.3em] opacity-40">
            <span>Groq Llama 3.1</span>
            <span>•</span>
            <span>DeepSeek V3 API</span>
            <span>•</span>
            <span>FastAPI Cluster</span>
            <span>•</span>
            <span>Secure TLS 1.3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
