import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import AILoadingState from '@/components/AILoadingState';
const CandidateScreening: React.FC = () => {
  const [jd, setJd] = useState('');
  const [resumes, setResumes] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const runAnalysis = async () => {
    if (!jd || resumes.length === 0) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('job_description', jd);
      resumes.forEach(file => formData.append('resumes', file));

      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = useAuthStore.getState().token;
      
      const res = await fetch(`${API}/api/ai/screen`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      const items = data.results || data; // Handle both {results:[]} and flat array
      setResults(items);
      if (data.warnings && data.warnings.length > 0) {
        toast(`⚠️ ${data.warnings[0]}`, { icon: '⚠️' });
      }
      toast.success(`Screened ${items.length} candidate(s)!`);
    } catch (err: any) {
      const msg = err?.message || 'Error screening resumes';
      toast.error(msg.length > 100 ? 'Error screening resumes. Check file types and try again.' : msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            ⚡ Precision Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">Candidate Screening</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-lg font-medium opacity-90 italic">"Vectorized TF-IDF matching between job DNA and candidate latent skillsets."</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white/5 border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[var(--text-primary)]">
            📥 Intelligence Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left: Inputs */}
        <div className="xl:col-span-1 space-y-10">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-[var(--text-primary)] font-black text-xs mb-8 flex items-center gap-4 uppercase tracking-[0.3em] opacity-40">
              <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">📋</span> Job DNA Input
            </h3>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the target Job Description (JD) hierarchy here..."
              className="w-full h-64 bg-black/10 border border-[var(--border-color)] rounded-3xl p-6 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:ring-2 focus:ring-primary/50 focus:outline-none scrollbar-hide resize-none transition-all shadow-inner italic font-medium"
            />
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-[var(--text-primary)] font-black text-xs mb-8 flex items-center gap-4 uppercase tracking-[0.3em] opacity-40">
              <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">📄</span> Batch Ingestion
            </h3>
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] p-12 text-center hover:border-primary/50 transition-all cursor-pointer relative bg-black/10 group/drop hover:bg-primary/5">
              <input 
                type="file" 
                multiple 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="text-6xl mb-6 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-transform">📂</div>
              <p className="text-[var(--text-primary)] font-black text-sm uppercase tracking-tighter mb-2">Initialize Flow</p>
              <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest opacity-40">PDF / DOCX Payload</p>
              <div className="mt-6">
                <span className="text-[10px] text-primary font-black bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-lg">{resumes.length} Packages Ready</span>
              </div>
            </div>
            {resumes.length > 0 && (
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className={`w-full mt-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 ${
                  isAnalyzing ? 'bg-primary/50 cursor-not-allowed text-white/50' : 'bg-primary text-white hover:opacity-90 hover:scale-[1.02]'
                }`}
              >
                {isAnalyzing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> AI Optimizing...</>
                ) : '⚡ Deploy Matrix Link →'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="xl:col-span-2">
          {results.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[var(--bg-card)]/50 p-6 rounded-[2rem] border border-[var(--border-color)] backdrop-blur-xl">
                 <h3 className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs flex items-center gap-4 opacity-70">
                   <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg">📊</span> Verified Intelligence Matrix ({results.length})
                 </h3>
                 <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-lg">Optimal Ranking Active</span>
              </div>
              <div className="grid gap-6">
                {results.map((res, i) => (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-primary/50 transition-all animate-in slide-in-from-right-12 duration-700 shadow-2xl relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-10">
                      <div className="w-24 h-32 rounded-[2rem] bg-black/20 border border-[var(--border-color)] flex flex-col items-center justify-center shadow-inner group transition-all shrink-0">
                        <div className={`text-4xl font-black ${res.score >= 70 ? 'text-emerald-500' : 'text-primary'} tracking-tighter drop-shadow-lg`}>{res.score}%</div>
                        <div className="text-[8px] text-[var(--text-secondary)] uppercase tracking-[0.15em] font-black mt-2 opacity-40">ATS Match</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <h4 className="text-[var(--text-primary)] font-black text-2xl truncate tracking-tight uppercase italic">{res.name}</h4>
                          {res.score >= 80 && <span className="text-[10px] px-4 py-2 rounded-full font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald tracking-wider leading-none">Elite Tier</span>}
                        </div>
                        <div className="flex items-center gap-8 mb-6">
                          <div className="flex items-center gap-3">
                             <span className="text-lg">📧</span>
                             <span className="text-xs text-[var(--text-secondary)] font-bold opacity-60">{res.email || 'No Signal'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-lg">💼</span>
                             <span className="text-xs text-[var(--text-secondary)] font-bold opacity-60">{res.experience || 'Entry'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                          {res.matched_skills?.slice(0, 6).map((s: string) => (
                            <span key={s} className="px-4 py-2 bg-primary/10 rounded-xl text-xs text-primary font-bold uppercase tracking-wide border border-primary/30 shadow-sm">{s}</span>
                          ))}
                          {res.matched_skills?.length > 6 && <span className="px-4 py-2 bg-white/5 rounded-xl text-xs text-[var(--text-primary)] opacity-80 uppercase font-black tracking-widest border border-[var(--border-color)]">+{res.matched_skills.length - 6} Overlaps</span>}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setExpandedId(expandedId === i ? null : i)}
                        className="px-6 py-4 bg-white/5 text-[var(--text-primary)] rounded-2xl hover:bg-white/10 transition-all text-[10px] border border-[var(--border-color)] font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-lg"
                      >
                        {expandedId === i ? 'Collapse' : 'Explain Score ▼'}
                      </button>
                    </div>

                    {/* Expandable Breakdown */}
                    {expandedId === i && (
                       <div className="mt-4 pt-8 border-t border-[var(--border-color)] animate-in slide-in-from-top-4 duration-500">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            {Object.entries(res.breakdown || {}).map(([label, val]: any) => (
                               <div key={label} className="bg-black/10 p-5 rounded-[1.5rem] border border-[var(--border-color)] text-center shadow-inner group hover:border-primary/30 transition-all">
                                  <div className="text-2xl font-black text-[var(--text-primary)] tracking-tighter mb-1 uppercase group-hover:text-primary transition-colors">{val}%</div>
                                  <div className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-40 italic">{label}</div>
                               </div>
                            ))}
                          </div>
                          <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] text-sm text-[var(--text-secondary)] leading-relaxed italic font-medium relative overflow-hidden group/intel">
                            <div className="absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover/intel:rotate-12 transition-transform">✨</div>
                            <span className="font-black text-primary uppercase tracking-[0.3em] text-[10px] block mb-4">Neural Intelligence Synthesis</span>
                            "{res.summary || res.ai_summary || 'No AI summary generated.'}"
                          </div>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="h-full flex items-center justify-center p-6">
              <AILoadingState 
                message="Screening Candidates..." 
                steps={['Extracting Resume Data...', 'Running NLP Pipeline...', 'TF-IDF Keyword Matching...', 'Comparing against Job Description...', 'Finalizing Ranked Scores...']} 
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-[var(--bg-card)]/30 border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] min-h-[600px] shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-8xl mb-10 group-hover:scale-110 transition-transform duration-700">🔬</div>
              <h3 className="text-[var(--text-primary)] font-black text-2xl mb-4 tracking-tighter uppercase italic leading-none">Awaiting Ingestion</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm font-medium opacity-40 italic">
                Initialize the screening flow by injecting Job DNA and uploading candidate packages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateScreening;
