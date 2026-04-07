import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import AILoadingState from '@/components/AILoadingState';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface MatchResult {
  job_filename: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
}

const JobMatch: React.FC = () => {
  const { token } = useAuthStore();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFiles, setJdFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!resumeFile || jdFiles.length === 0) {
      toast.error('Upload your resume and at least one job description');
      return;
    }
    setLoading(true);
    setResults(null);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    jdFiles.forEach(file => formData.append('jds', file));

    try {
      const resp = await fetch(`${API}/api/ai/multi-match`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!resp.ok) throw new Error('Matching failed');
      const data = await resp.json();
      setResults(data);
      toast.success('Multi-Job Match Complete! 🎯');
    } catch (err) {
      toast.error('AI Analysis failed. Check your files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24 animate-in fade-in duration-1000 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12">
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">
            🎯 TARGET PRIORITY
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">MULTI <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">MATCH</span></h1>
          <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Rank multiple career opportunities against your neural master profile instantly."</p>
        </div>
        <div className="flex gap-6">
           {results && <button onClick={() => { setResults(null); setResumeFile(null); setJdFiles([]); }} className="px-10 py-5 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all shadow-xl italic">RESET MATRIX</button>}
        </div>
      </div>

      {!results && !loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           <div className="lg:col-span-12 xl:col-span-5 space-y-12">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all opacity-40 invisible dark:visible" />
                 
                 <div className="space-y-14">
                    <div>
                       <label className="block text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] mb-6 opacity-40 italic ml-2">CORE MASTER SEED</label>
                       <div onClick={() => resumeInputRef.current?.click()} className="border-2 border-dashed border-[var(--border-color)] rounded-[3rem] p-16 text-center cursor-pointer hover:bg-black/5 hover:border-primary/50 transition-all bg-black/5 group/resume relative overflow-hidden">
                          <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                          <div className="text-7xl mb-6 group-hover/resume:scale-125 group-hover/resume:rotate-6 transition-transform italic">📄</div>
                          <p className="text-[var(--text-primary)] font-black text-lg mb-2 italic uppercase tracking-tighter">{resumeFile ? resumeFile.name : 'SOURCE DOCUMENT'}</p>
                          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40">COMPARISON BASELINE</p>
                       </div>
                    </div>

                    <div>
                       <label className="block text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] mb-6 opacity-40 italic ml-2">TARGET CLUSTER (MAX 5)</label>
                       <div onClick={() => jdInputRef.current?.click()} className="border-2 border-dashed border-[var(--border-color)] rounded-[3rem] p-16 text-center cursor-pointer hover:bg-black/5 hover:border-emerald-500/50 transition-all bg-black/5 group/jd relative overflow-hidden">
                          <input type="file" ref={jdInputRef} className="hidden" multiple accept=".pdf,.docx,.txt" onChange={(e) => setJdFiles(Array.from(e.target.files || []))} />
                          <div className="text-7xl mb-6 group-hover/jd:scale-125 group-hover/jd:-rotate-6 transition-transform italic">💼</div>
                          <p className="text-[var(--text-primary)] font-black text-lg mb-2 italic uppercase tracking-tighter">{jdFiles.length > 0 ? `${jdFiles.length} NODES SELECTED` : 'MULTI-JD UPLOAD'}</p>
                          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40">BATCH ANALYSIS MODE</p>
                       </div>
                    </div>

                    <button 
                      onClick={handleAnalyze}
                      disabled={loading || !resumeFile || jdFiles.length === 0}
                      className="w-full py-8 rounded-[3rem] bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_60px_rgba(37,99,235,0.4)] disabled:opacity-30 disabled:scale-100 italic"
                    >
                       🚀 EXECUTE NEURAL RANKING
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-center items-center text-center p-24 bg-[var(--bg-card)]/40 border-2 border-[var(--border-color)] border-dashed rounded-[5rem] min-h-[700px] group transition-all relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-48 h-48 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-8xl mb-12 group-hover:scale-110 transition-transform shadow-2xl relative z-10 italic">🎯</div>
              <h4 className="text-[var(--text-primary)] font-black text-5xl mb-6 tracking-tighter uppercase leading-[0.9] italic relative z-10">THE RANKING <br /><span className="text-primary">PROTOCOL</span></h4>
              <p className="text-[var(--text-secondary)] text-2xl max-w-md leading-relaxed font-medium opacity-60 italic relative z-10">"Revealing matching intelligence across your entire professional wishlist in high-valence."</p>
           </div>
        </div>
      ) : loading ? (
        <div className="py-40 min-h-[700px] flex items-center justify-center">
           <AILoadingState message="DECONSTRUCTING TALENT MATRIX ACROSS CLUSTER TARGETS..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom duration-1000">
           {results?.map((res, i) => (
             <div key={i} className={`bg-[var(--bg-card)] border transition-all rounded-[4rem] p-12 relative overflow-hidden group/card flex flex-col h-[650px] shadow-2xl ${i === 0 ? 'border-primary/40 ring-4 ring-primary/5' : 'border-[var(--border-color)]'}`}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -mt-40 -mr-40 group-hover/card:bg-primary/10 transition-all opacity-60" />
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                   <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg italic ${i === 0 ? 'bg-primary text-[var(--bg-base)]' : 'bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)]'}`}>
                      {i === 0 ? '👑 ELITE MATCH' : `NODE #${i + 1}`}
                   </div>
                   <div className="text-6xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums italic leading-none">{Math.round(res.score)}%</div>
                </div>

                <div className="mb-0 relative z-10 flex-shrink-0">
                   <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-80 leading-none italic">POSITION POTENTIAL</p>
                   <h3 className="text-[var(--text-primary)] font-black text-3xl truncate mb-10 uppercase tracking-tighter leading-none group-hover/card:text-primary transition-colors italic">{res.job_filename.split('.')[0]}</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-6 scrollbar-hide py-4 relative z-10 space-y-12 shadow-inner rounded-[2rem] bg-black/5 p-6 mb-8 border border-[var(--border-color)]">
                   <div className="space-y-6">
                     <div className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic opacity-80">
                        <span className="w-8 h-[2px] bg-emerald-500/30" /> COMPETITIVE EDGE
                     </div>
                     <div className="flex flex-wrap gap-2.5">
                        {res.matched_skills.slice(0, 8).map((s, si) => (
                           <span key={si} className="px-5 py-2.5 rounded-xl bg-emerald-500/5 text-emerald-400 text-[10px] font-black border border-emerald-500/10 uppercase tracking-tight italic group-hover/card:border-emerald-500/30 transition-all">
                              {s}
                           </span>
                        ))}
                        {res.matched_skills.length > 8 && <span className="text-[10px] text-[var(--text-secondary)] font-black italic opacity-40 uppercase tracking-widest">+{res.matched_skills.length - 8} MORE STRENGTHS</span>}
                     </div>
                   </div>

                   <div className="space-y-6">
                     <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic opacity-80">
                        <span className="w-8 h-[2px] bg-red-500/30" /> CAPACITY GAPS
                     </div>
                     <div className="flex flex-wrap gap-2.5">
                        {res.missing_skills.length > 0 ? res.missing_skills.slice(0, 8).map((s, si) => (
                           <span key={si} className="px-5 py-2.5 rounded-xl bg-red-500/5 text-red-400 text-[10px] font-black border border-red-500/10 uppercase tracking-tight italic group-hover/card:border-red-500/30 transition-all">
                              {s}
                           </span>
                        )) : (
                          <div className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/10 px-8 py-5 rounded-[2rem] border border-emerald-500/20 italic shadow-xl shadow-emerald-500/10">EXECUTIVE SYNC COMPLETE ✨</div>
                        )}
                        {res.missing_skills.length > 8 && <span className="text-[10px] text-[var(--text-secondary)] font-black italic opacity-40 uppercase tracking-widest">+{res.missing_skills.length - 8} MORE GAPS</span>}
                     </div>
                   </div>
                </div>

                <div className="mt-auto pt-10 border-t border-[var(--border-color)] flex gap-6 relative z-10 flex-shrink-0">
                   <button 
                     onClick={() => toast.success('BRIDGE ROADMAP GENERATED!')}
                     className="flex-1 py-6 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/20 transition-all hover:scale-105 italic shadow-lg"
                   >
                      BRIDGE GAP
                   </button>
                   <button className="flex-1 py-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[var(--bg-base)] transition-all shadow-lg italic">OPTIMIZE NODE</button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default JobMatch;
