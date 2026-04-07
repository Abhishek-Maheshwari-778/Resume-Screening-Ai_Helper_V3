import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-24">
          <Link to="/" className="text-primary hover:text-primary/80 text-[11px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-3 mb-10 transition-all group italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> SYSTEM HUB
          </Link>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase leading-[0.95] italic">
            TERMS OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">
              SERVICE
            </span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium italic opacity-90 leading-relaxed">
            "The legal framework governing our neural engagement."
          </p>
          <p className="text-[var(--text-primary)] text-[11px] font-black uppercase mt-8 tracking-[0.3em] opacity-80">
            LAST SYNC: MARCH 30, 2026
          </p>
        </div>

        <div className="space-y-16 text-[var(--text-secondary)] leading-relaxed font-medium italic">
          <section className="bg-[var(--bg-card)]/50 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-[var(--border-color)] group hover:border-primary/40 transition-all shadow-2xl">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic group-hover:text-primary transition-colors">
              <span className="w-2 h-8 bg-blue-500 rounded-full" /> 1. ACCEPTANCE
            </h2>
            <p className="text-[15px] opacity-80">
              By accessing or utilizing the AI Resume Platform ("Service"), you signify your agreement to be bound by these
              Terms of Service. If you do not align with these protocols, do not initialize the Service.
            </p>
          </section>

          <section className="px-6">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic hover:text-emerald-500 transition-colors">
              <span className="w-2 h-8 bg-emerald-500 rounded-full" /> 2. PROTOCOLS
            </h2>
            <p className="text-[15px] mb-6 opacity-80">You agree to utilize the Service strictly for lawful operations. Restricted actions include:</p>
            <ul className="space-y-4 text-sm ml-6">
              <li className="flex items-center gap-4 group/item"><span className="text-emerald-500 font-bold group-hover/item:scale-125 transition-transform">•</span> MALICIOUS FILE INJECTION OR EXPLOITATION ATTEMPTS</li>
              <li className="flex items-center gap-4 group/item"><span className="text-emerald-500 font-bold group-hover/item:scale-125 transition-transform">•</span> DISCRIMINATORY USE OF HR SCREENING MATRICES</li>
              <li className="flex items-center gap-4 group/item"><span className="text-emerald-500 font-bold group-hover/item:scale-125 transition-transform">•</span> UNAUTHORIZED DATA EXTRACTION OR SCRAPING</li>
              <li className="flex items-center gap-4 group/item"><span className="text-emerald-500 font-bold group-hover/item:scale-125 transition-transform">•</span> REVERSE-ENGINEERING OF THE NEURAL CORE</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-card)]/50 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-[var(--border-color)] group hover:border-violet-500/40 transition-all shadow-2xl">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic group-hover:text-violet-500 transition-colors">
              <span className="w-2 h-8 bg-violet-500 rounded-full" /> 3. NEURAL DISCLAIMER
            </h2>
            <p className="text-[15px] opacity-80 leading-relaxed">
              The platform utilizes advanced LLM models (Groq, DeepSeek) for synthesis.
              Suggestions are <strong className="text-[var(--text-primary)]">not guaranteed to be definitive</strong>.
              You retain final responsibility for auditing AI-generated outputs. ATS metrics
              are simulations and may not reflect specific proprietary HR software behavior.
            </p>
          </section>

          <section className="px-6">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic hover:text-rose-500 transition-colors">
              <span className="w-2 h-8 bg-rose-500 rounded-full" /> 4. LEGAL RECOURSE
            </h2>
            <p className="text-[15px] opacity-80 leading-relaxed">
              AI Resume Platform is provided "as is" without warranty.
              We are not liable for recruitment outcomes, lost opportunities, or decisions derived
              from neural synthesis. Our liability threshold is capped at the total amount paid
              in the preceding 12-month cycle.
            </p>
          </section>
        </div>

        <div className="mt-48 p-16 md:p-20 bg-[var(--bg-card)] rounded-[4rem] border border-[var(--border-color)] text-center shadow-2xl group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-20 -mr-40 -mt-40 group-hover:bg-primary/10 transition-all" />
          <h4 className="text-[var(--text-primary)] font-black text-3xl mb-4 tracking-tighter uppercase italic leading-none">Legal Inquiries?</h4>
          <p className="text-[var(--text-secondary)] text-lg mb-10 font-medium italic opacity-90 leading-relaxed">"Our legal architecture team is online."</p>
          <a href="mailto:legal@resumeai.app" className="inline-block px-10 py-5 bg-primary/10 border-2 border-primary/50 text-primary font-black text-lg uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/20">legal@resumeai.app</a>
        </div>
      </div>
    </div>
  );
};

export default Terms;
