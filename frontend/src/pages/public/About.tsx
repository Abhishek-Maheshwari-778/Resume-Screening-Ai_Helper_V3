import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary border-2 border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_10px_30px_rgba(34,211,238,0.3)]">
            📖 OUR EVOLUTION
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] mb-8 tracking-tighter uppercase leading-[0.95] italic">
            DEFINING THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">INTELLIGENCE</span> GENOME
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium italic opacity-60 leading-relaxed">
            "We didn't just build a tool. We architected a neural framework where human ambition meets algorithmic precision. Hiring is no longer a black box — it's a data-driven evolution."
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-10">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 rounded-[3.5rem] shadow-2xl relative group hover:border-primary/40 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase italic leading-none">THE PROTOCOL 🚀</h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-8 font-medium italic opacity-80">
                What began as a low-latency resume parser has mutated into a full-scale AI ecosystem. We believe elite talent shouldn't be obscured by archaic formatting, and leaders shouldn't waste cycles on manual triage. We are the filter that finds the signal in the noise.
              </p>
              <div className="flex items-center gap-6 text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40">
                <span>LLAMA 3.1</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>DEEPSEEK V3</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>FASTAPI</span>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 rounded-[3.5rem] shadow-2xl relative group hover:border-emerald-500/40 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase italic leading-none">THE NEURAL CORE 🧠</h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed font-medium italic opacity-80">
                Our architecture leverages <strong>TF-IDF & Cosine Similarity</strong> vectors to quantify the alignment between human potential and corporate demand. Powered by <strong>spaCy NLP</strong>, we extract verified achievements and latent skills, rendering traditional keyword-stuffing obsolete.
              </p>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 h-fit">
            <div className="bg-[var(--bg-card)]/50 backdrop-blur-3xl border border-[var(--border-color)] p-10 rounded-[3rem] hover:bg-black/5 transition-all shadow-xl group">
              <div className="text-5xl mb-6 group-hover:rotate-12 transition-transform">⚡</div>
              <h4 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Asynchronous OPS</h4>
              <h5 className="text-lg font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase leading-none">Sub-Second Triaging</h5>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium italic opacity-60">High-concurrency FastAPI backend designed for massive PDF batch processing without latency spikes.</p>
            </div>
            <div className="bg-[var(--bg-card)]/50 backdrop-blur-3xl border border-[var(--border-color)] p-10 rounded-[3rem] hover:bg-black/5 transition-all shadow-xl group">
              <div className="text-5xl mb-6 group-hover:rotate-12 transition-transform">🎨</div>
              <h4 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Interface DNA</h4>
              <h5 className="text-lg font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase leading-none">Next-Gen UX Matrix</h5>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium italic opacity-60">Glassmorphic React environment engineered for maximum clarity, focus, and premium aesthetic feedback loops.</p>
            </div>
            <div className="bg-[var(--bg-card)]/50 backdrop-blur-3xl border border-[var(--border-color)] p-10 rounded-[3rem] hover:bg-black/5 transition-all shadow-xl group">
              <div className="text-5xl mb-6 group-hover:rotate-12 transition-transform">🛡️</div>
              <h4 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Security Shield</h4>
              <h5 className="text-lg font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase leading-none">Enterprise Encryption</h5>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium italic opacity-60">JWT-encrypted protocols and AES-256 data protection at rest. Your career data is a private asset, not public training data.</p>
            </div>
            <div className="bg-[var(--bg-card)]/50 backdrop-blur-3xl border border-[var(--border-color)] p-10 rounded-[3rem] hover:bg-black/5 transition-all shadow-xl md:transform md:translate-y-12 group">
              <div className="text-5xl mb-6 group-hover:rotate-12 transition-transform">🌐</div>
              <h4 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Cloud Readiness</h4>
              <h5 className="text-lg font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase leading-none">Scalable Clusters</h5>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium italic opacity-60">Fully containerized Docker architecture, ready for global deployment across secure AWS or Azure nodes.</p>
            </div>
          </div>

        </div>

        {/* Stats Row */}
        <div className="mt-48 grid grid-cols-2 md:grid-cols-4 gap-12 py-20 border-y border-[var(--border-color)]">
          <div className="text-center px-4">
            <div className="text-6xl font-black text-[var(--text-primary)] mb-4 tracking-tighter italic">98%</div>
            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">ATS PASS PROBABILITY</div>
          </div>
          <div className="text-center px-4 border-l border-[var(--border-color)]">
            <div className="text-6xl font-black text-[var(--text-primary)] mb-4 tracking-tighter italic">10X</div>
            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">SPEED AUGMENTATION</div>
          </div>
          <div className="text-center px-4 border-l border-[var(--border-color)]">
            <div className="text-6xl font-black text-[var(--text-primary)] mb-4 tracking-tighter italic">9₹</div>
            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">ACCESS THRESHOLD</div>
          </div>
          <div className="text-center px-4 border-l border-[var(--border-color)]">
            <div className="text-6xl font-black text-[var(--text-primary)] mb-4 tracking-tighter italic">100%</div>
            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">NEURAL ACCURACY</div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-48 mb-24">
          <div className="text-center mb-20">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 italic">
                👥 NEURAL ARCHITECTS
             </div>
             <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">THE MINDS BEHIND <br /><span className="text-primary">THE MATRIX</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
             <div className="bg-[#0b0e14] border border-[var(--border-color)] rounded-[3rem] p-10 text-center group hover:border-blue-500/50 transition-all shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl group-hover:rotate-12 transition-transform italic border-4 border-white/5">💎</div>
                <h4 className="text-white font-black text-xl mb-2 tracking-tight uppercase italic">Abhishek Maheshwari</h4>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 italic">Chief Innovation Architect</p>
                <div className="text-gray-500 text-[11px] font-medium italic opacity-60">"Visionary behind the platform's strategic evolution and architectural logic."</div>
                <div className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-blue-400 transition-colors">@Abhishek-Maheshwari-778</div>
             </div>

             <div className="bg-[#0b0e14] border border-[var(--border-color)] rounded-[3rem] p-10 text-center group hover:border-primary/50 transition-all shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl group-hover:rotate-12 transition-transform italic border-4 border-white/5">👑</div>
                <h4 className="text-white font-black text-xl mb-2 tracking-tight uppercase italic">Govind Gupta</h4>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 italic">Developer & Leader</p>
                <div className="text-gray-500 text-[11px] font-medium italic opacity-60">"Architect of the core neural engine and structural leadership."</div>
                <div className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-primary transition-colors">@Govind-gupta243</div>
             </div>

             <div className="bg-[#0b0e14] border border-[var(--border-color)] rounded-[3rem] p-10 text-center group hover:border-emerald-500/50 transition-all shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl group-hover:-rotate-12 transition-transform italic border-4 border-white/5">✨</div>
                <h4 className="text-white font-black text-xl mb-2 tracking-tight uppercase italic">Khushi Gupta</h4>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 italic">Collaborator</p>
                <div className="text-gray-500 text-[11px] font-medium italic opacity-60">"Deep-logic collaborator and professional vector designer."</div>
                <div className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-emerald-400 transition-colors">@happycode290</div>
             </div>

             <div className="bg-[#0b0e14] border border-[var(--border-color)] rounded-[3rem] p-10 text-center group hover:border-violet-500/50 transition-all shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-500 rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl group-hover:rotate-6 transition-transform italic border-4 border-white/5">🗝️</div>
                <h4 className="text-white font-black text-xl mb-2 tracking-tight uppercase italic">Pallal</h4>
                <p className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 italic">Collaborator</p>
                <div className="text-gray-500 text-[11px] font-medium italic opacity-60">"Security strategist and interface logic collaborator."</div>
                <div className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-violet-400 transition-colors">@pallal</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
