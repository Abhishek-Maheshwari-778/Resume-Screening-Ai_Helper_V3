import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

interface Resume {
  id: string;
  title: string;
  target_role: string;
  updated_at: string;
  ats_score?: number;
}

const MyResumes: React.FC = () => {
  const { token } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) setResumes(await resp.json());
    } catch { toast.error('Failed to load resumes'); }
    setLoading(false);
  };

  const handleSeedResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSeeding(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // 1. Extract Text
      const extractResp = await fetch(`${API}/api/ai/extract-text`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!extractResp.ok) throw new Error('Extraction failed');
      const { text } = await extractResp.json();
      
      // 2. We can either parse it here or just save it as a "Imported" resume
      // For now, let's just save it as a new resume record
      const saveResp = await fetch(`${API}/api/resumes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: `Imported: ${file.name.split('.')[0]}`,
          target_role: 'N/A',
          raw_text: text,
          sections: {
            "Personal Information": [{"content": `Imported from ${file.name}`}],
            "Imported Content": [{"content": text}]
          }
        })
      });
      
      if (!saveResp.ok) throw new Error('Save failed');
      toast.success('Resume imported and seeded successfully! 🚀');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to seed resume. Ensure it is a valid PDF/DOCX.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">
            📁 DATA VAULT
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">RESUME <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">CLOUD</span></h1>
          <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Securely architecting and managing your professional evolution in the neural cloud."</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleSeedResume} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isSeeding}
            className="px-10 py-5 rounded-2xl border border-[var(--border-color)] hover:bg-white/5 text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-xl group"
          >
            <span className="text-xl group-hover:scale-125 transition-transform">{isSeeding ? '🧬' : '📤'}</span>
            {isSeeding ? 'SYNCING CORE...' : 'SEED MASTER FILE'}
          </button>
          <Link to="/app/builder" className="px-10 py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 italic">
            + DEPLOY NEW BUILD
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-10">
          <div className="w-20 h-20 border-[6px] border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl" />
          <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.5em] animate-pulse italic opacity-40">ACCESSING NEURAL VAULT...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-[var(--bg-card)]/40 border-2 border-[var(--border-color)] border-dashed rounded-[4rem] p-24 text-center max-w-4xl mx-auto group shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all grayscale">🏜️</div>
          <div className="w-32 h-32 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[2.5rem] flex items-center justify-center text-7xl mx-auto mb-10 shadow-2xl group-hover:rotate-6 transition-transform">🏜️</div>
          <h3 className="text-[var(--text-primary)] font-black text-4xl mb-6 tracking-tighter uppercase leading-none italic">VAULT ZERO</h3>
          <p className="text-[var(--text-secondary)] text-xl leading-relaxed mb-14 opacity-60 italic font-medium max-w-md mx-auto">"Your career index is currently offline. Start by seeding a master document to initialize your professional matrix."</p>
          <button onClick={() => fileInputRef.current?.click()} className="px-12 py-6 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all italic">INITIALIZE MASTER SEED</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {resumes.map(r => (
             <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3.5rem] p-12 hover:border-primary/40 transition-all group relative overflow-hidden shadow-2xl flex flex-col h-[480px] group/card">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover/card:bg-primary/10 transition-all opacity-40" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                   <div className="w-16 h-16 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-4xl group-hover/card:rotate-12 transition-all shadow-lg italic">📄</div>
                   <div className="px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase text-primary tracking-[0.2em] italic shadow-inner">MASTER NODE</div>
                </div>
                
                <div className="flex-1 relative z-10">
                   <h3 className="text-[var(--text-primary)] font-black text-2xl mb-3 truncate uppercase tracking-tighter leading-none group-hover/card:text-primary transition-colors italic">{r.title}</h3>
                   <div className="flex flex-col gap-3 text-xs font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-[0.2em] italic">
                      <span className="flex items-center gap-3"><span className="w-6 h-[1px] bg-[var(--border-color)]" /> 🎯 {r.target_role}</span>
                      <span className="flex items-center gap-3"><span className="w-6 h-[1px] bg-[var(--border-color)]" /> 📅 {new Date(r.updated_at).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="mt-auto space-y-6 relative z-10">
                   <div className="flex gap-4">
                      <Link to={`/app/builder?id=${r.id}`} className="flex-1 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-2xl text-center text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl italic">REFINE CORE</Link>
                      <Link to={`/app/checker?id=${r.id}`} className="flex-1 py-5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl text-center text-[11px] font-black uppercase text-[var(--text-primary)] hover:bg-white/5 transition-all italic font-mono shadow-inner">ANALYZER</Link>
                   </div>
                   <div className="flex justify-between items-center px-4">
                      <button onClick={() => {}} className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic">
                         <span className="w-2 h-2 bg-red-500/20 rounded-full" /> PURGE
                      </button>
                      <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-10 uppercase tracking-tighter tabular-nums font-mono">NODEID: {r.id.slice(0, 12)}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Suggested Feature Banner */}
      <div className="mt-48 p-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[4rem] relative overflow-hidden group shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
         <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all grayscale pointer-events-none">🧬</div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6 italic">
               ⚡ NEURAL PROTOCOL
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-4xl mb-6 tracking-tighter uppercase leading-[0.95] italic">AI PROFILE <br />SEEDING CORE</h4>
            <p className="text-[var(--text-secondary)] text-xl leading-relaxed mb-0 font-medium opacity-60 italic max-w-lg">"Utilize our hyper-seeding engine to instantly populate identity data from any legacy document. Our AI reconstructs your professional evolution automatically."</p>
         </div>
         <div className="flex relative z-10">
            <button onClick={() => fileInputRef.current?.click()} className="px-12 py-6 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all italic">LAUNCH SYNC HUB</button>
         </div>
      </div>
    </div>
  );
};

export default MyResumes;
