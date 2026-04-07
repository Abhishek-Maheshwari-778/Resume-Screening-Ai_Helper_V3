import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VulnerabilityReportModal from '@/components/VulnerabilityReportModal';

const Security: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <Link to="/" className="text-primary hover:text-primary/80 text-[11px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-3 mb-10 transition-all group italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> SYSTEM HUB
          </Link>
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-2xl border border-primary/20 group-hover:rotate-12 transition-transform">
            🛡️
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase leading-[0.95] italic">SECURITY <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">CENTER</span></h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium italic opacity-90 leading-relaxed max-w-lg mx-auto shadow-sm">"Architecting the impenetrable containment field around your professional evolution."</p>
        </div>

        {/* Status Tracker */}
        <div className="bg-[var(--bg-card)]/80 backdrop-blur-3xl border border-[var(--border-color)] rounded-[3.5rem] p-10 mb-20 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl group">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-5 h-5 bg-emerald-500 rounded-full animate-ping absolute inset-0 opactiy-20" />
              <div className="w-5 h-5 bg-emerald-500 rounded-full relative z-10 shadow-lg shadow-emerald-500/40" />
            </div>
            <div>
              <h4 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">SYSTEM STATUS: FULLY OPERATIONAL</h4>
              <p className="text-[var(--text-primary)] text-[11px] uppercase font-black italic opacity-60">UPTIME 99.9% • NEURAL LATENCY 140MS</p>
            </div>
          </div>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-base)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] opacity-40 hover:opacity-100 transition-opacity cursor-help shadow-lg">{i+1}</div>
            ))}
          </div>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          {[
            { icon: '🔒', title: 'AES-256 ENCRYPTION', desc: 'ALL DATA AT REST IS ENCRYPTED UTILIZING BANK-GRADE ENCRYPTION STANDARDS.' },
            { icon: '🌐', title: 'TLS 1.3 PROTOCOL', desc: 'SECURE TRANSIT DURING EVERY INTERACTION BETWEEN YOUR NODE AND OUR CORE.' },
            { icon: '🔑', title: 'JWT KEYFRAME', desc: 'GRANULAR SESSION MANAGEMENT WITH ROTATING JSON WEB TOKENS.' },
            { icon: '🏚️', title: 'ZERO RETENTION', desc: 'TRANSIENT ANALYSIS RESULTS ARE HELD IN VOLATILE MEMORY AND PURGED.' },
          ].map((item, i) => (
            <div key={i} className="p-12 rounded-[3.5rem] bg-[var(--bg-card)]/60 backdrop-blur-3xl border border-[var(--border-color)] hover:border-primary/40 transition-all group flex flex-col items-start text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl mb-8 group-hover:rotate-12 transition-transform">{item.icon}</div>
              <h3 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors italic leading-none">{item.title}</h3>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium italic opacity-60">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-16 text-[var(--text-secondary)] leading-relaxed font-medium italic pb-32 border-b border-[var(--border-color)] mb-32">
          <section className="bg-[var(--bg-card)]/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-[var(--border-color)] group hover:border-primary/40 transition-all shadow-2xl">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic group-hover:text-primary transition-colors">
              <span className="w-2 h-8 bg-blue-500 rounded-full" /> 1. CORE ARCHITECTURE
            </h2>
            <p className="text-[15px] opacity-80 leading-relaxed">
              Resume AI is deployed on Tier-1 secure cloud infrastructure with global ISO 27001, SOC 2, and PCI compliance certificates. Our database matrix, 
              <strong>MongoDB Atlas Core</strong>, provides deep multi-region redundancy and continuous backups to ensure your professional identity is never compromised.
            </p>
          </section>

          <section className="px-6">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic hover:text-emerald-500 transition-colors">
              <span className="w-2 h-8 bg-emerald-500 rounded-full" /> 2. NEURAL SAFETY
            </h2>
            <p className="text-[15px] opacity-80 leading-relaxed">
              We leverage <strong>Groq Llama 3.1</strong> and <strong>DeepSeek V3</strong> for intelligence synthesis. We enforce strict Data 
              Processing Agreements (DPA) with our model providers. Your neural profile is utilized <strong>only</strong> for the immediate 
              triage requested and is never extracted for external model training.
            </p>
          </section>

          <section className="bg-[var(--bg-card)]/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-[var(--border-color)] group hover:border-violet-500/40 transition-all shadow-2xl">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter flex items-center gap-4 italic group-hover:text-violet-500 transition-colors">
              <span className="w-2 h-8 bg-violet-500 rounded-full" /> 3. HR DATA SEGREGATION
            </h2>
            <p className="text-[15px] opacity-80 leading-relaxed">
              Our Bulk Analysis engine for employers segregates telemetry at the organization node level. No candidate metadata 
              from one employer ever bleeds into another. Every analytic action is logged within the HR Command Center for auditability.
            </p>
          </section>
        </div>

        {/* Report Section */}
        <div className="p-16 md:p-24 rounded-[4rem] bg-[var(--bg-card)] border border-[var(--border-color)] text-center shadow-2xl mb-48 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-20 -mr-40 -mt-40 group-hover:bg-primary/10 transition-all" />
          <div className="w-20 h-20 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl group-hover:rotate-12 transition-transform">💡</div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase italic leading-none">Security Vulnerability?</h3>
          <p className="text-[var(--text-secondary)] text-lg mb-12 max-w-md mx-auto font-medium italic opacity-60 leading-relaxed">
            "Help us reinforce the perimeter. We operate a responsible disclosure program for all intelligence hubs."
          </p>
          <button 
            onClick={() => setModalOpen(true)}
            className="px-14 py-6 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            REPORT BREACH SEQUENCE →
          </button>
        </div>

        <VulnerabilityReportModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Security;
