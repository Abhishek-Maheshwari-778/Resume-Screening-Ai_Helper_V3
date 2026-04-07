import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: '01',
      title: 'Neural Ingestion',
      text: 'Our multi-threaded ingestion engine supports PDF, DOCX, and raw text. We utilize local pypdf and pdfminer logic for high-fidelity extraction without data egress.',
      icon: '📥',
      color: 'from-blue-600 to-cyan-500',
      tech: 'Python / PDFMiner / FitZ'
    },
    {
      id: '02',
      title: 'NLP Entity Extraction',
      text: 'Using spaCy transformer models, we identify professional entities, 300+ technical skills, and years of experience across fragmented sentence structures.',
      icon: '🧠',
      color: 'from-cyan-500 to-emerald-500',
      tech: 'spaCy / Transformers / NLP'
    },
    {
      id: '03',
      title: 'Vector Matrix Matching',
      text: 'Resumes are mapped into a high-dimensional vector space. We calculate cosine similarity across JD matrices using scikit-learn to find the absolute match.',
      icon: '📐',
      color: 'from-emerald-500 to-violet-500',
      tech: 'Scikit-Learn / TF-IDF'
    },
    {
      id: '04',
      title: 'LPU Synthesis',
      text: 'The Groq LPU engine synthesizes raw data into career advice, expert praise, and critical fixes with sub-200ms latency for real-time feedback.',
      icon: '✨',
      color: 'from-violet-500 to-purple-500',
      tech: 'Groq Cloud / Llama 3'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-32 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40 invisible dark:visible" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40 invisible dark:visible" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-32 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.4em] mb-12 shadow-[0_0_20px_rgba(34,211,238,0.2)] italic">
             ARCHITECTURE & PROTOCOL
          </div>
          <h1 className="text-4xl md:text-8xl font-black text-[var(--text-primary)] mb-10 tracking-[ -0.05em] uppercase leading-[0.85] italic">
            DECODING THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">AI ENGINE</span>
          </h1>
          <p className="text-2xl text-[var(--text-secondary)] font-medium italic opacity-100 leading-relaxed max-w-2xl mx-auto shadow-sm">
            "Engineered for sub-second precision. Our 4-stage neural pipeline is architected for zero-latency career intelligence."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-32 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="group relative">
               <div className="h-full bg-[var(--bg-card)]/80 backdrop-blur-3xl border border-[var(--border-color)] rounded-[4rem] p-16 transition-all hover:bg-white/5 hover:border-primary/30 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 text-[120px] opacity-[0.03] grayscale transition-all group-hover:opacity-[0.08] group-hover:grayscale-0 italic">{step.icon}</div>
                  
                  <div className="flex items-start justify-between mb-12">
                     <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform italic`}>
                        {step.id}
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#666] italic mb-2">CORE TECHNOLOGY</div>
                        <div className="text-xs font-black text-primary italic tracking-widest leading-none">{step.tech}</div>
                     </div>
                  </div>

                  <h3 className="text-[var(--text-primary)] font-black text-4xl mb-8 tracking-tighter uppercase italic group-hover:text-primary transition-colors leading-none">{step.title}</h3>
                  <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-medium italic opacity-70 mb-10">{step.text}</p>
                  
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className={`h-full bg-gradient-to-r ${step.color} transition-all duration-1000 delay-300`} style={{ width: '100%' }} />
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0b0e14] border border-[var(--border-color)] rounded-[5rem] p-20 md:p-32 shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] opacity-40 -mr-40 -mt-40 group-hover:bg-primary/10 transition-all pointer-events-none" />
          <div className="relative z-10">
            <h4 className="text-[var(--text-primary)] font-black text-4xl md:text-6xl mb-10 tracking-tighter uppercase italic leading-[0.9] max-w-2xl mx-auto">DEPLOY THE <span className="text-primary">FUTURE</span> OF WORK RIGHT NOW.</h4>
            <p className="text-[var(--text-secondary)] text-2xl mb-16 font-medium italic opacity-60 max-w-xl mx-auto leading-relaxed">"Join 5,000+ professionals using the elite recruitment matrix."</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/auth" className="w-full sm:w-auto px-16 py-8 bg-white text-black font-black text-[13px] uppercase tracking-[0.4em] rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] italic">INITIALIZE SYNC →</Link>
              <Link to="/pricing" className="w-full sm:w-auto px-16 py-8 border border-white/10 text-white font-black text-[13px] uppercase tracking-[0.4em] rounded-3xl hover:bg-white/5 transition-all italic">VIEW SUBSCRIPTION MODES</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
