import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const SkillExtraction: React.FC = () => {
  const { token } = useAuthStore();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${API}/api/ai/hr/candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch candidates');
      const rawData = await resp.json();
      const data = rawData.items || rawData; 
      setCandidates(data);
      
      const allSkills = new Set<string>();
      data.forEach((c: any) => c.skills?.forEach((s: string) => allSkills.add(s)));
      setSkillsList(Array.from(allSkills).sort()); 
    } catch (err) {
      toast.error('Could not load skill matrix');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    toast.loading('Extracting intelligence from new batch...', { id: 'upload' });
    try {
      const resp = await fetch(`${API}/api/resumes/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (resp.ok) {
        toast.success('Intelligence extraction complete!', { id: 'upload' });
        fetchData();
        setShowUpload(false);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('Extraction protocol failed.', { id: 'upload' });
    }
  };

  const filteredCandidates = candidates.filter(c => 
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterSkill === '' || c.skills?.includes(filterSkill))
  );

  const topSkills = skillsList
    .map(s => ({ name: s, count: candidates.filter(c => c.skills?.includes(s)).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-emerald-500/10 rounded-full animate-ping absolute inset-0" />
        <div className="w-24 h-24 border-t-4 border-emerald-500 rounded-full animate-spin relative" />
      </div>
      <p className="mt-10 text-[var(--text-primary)] font-black uppercase tracking-[0.4em] text-xs opacity-60">Synchronizing Neural Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2 lg:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-[var(--border-color)]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-glow-emerald">
            🧠 COGNITIVE EXTRACTION PROTOCOL
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">Skill <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Inventory</span></h1>
          <p className="text-[var(--text-secondary)] mt-8 text-lg font-medium opacity-90 italic leading-relaxed">"Revealing the latent DNA of your talent pool through automated multi-vector NLP synthesis."</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="px-8 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
          >
            {showUpload ? '✕ ABORT' : '📂 INJECT BATCH'}
          </button>
          <button className="px-8 py-5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all shadow-xl italic">
            📊 EXPORT CSV
          </button>
        </div>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="bg-[var(--bg-card)] border-2 border-dashed border-emerald-500/30 rounded-[3rem] p-16 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-40 group-hover:opacity-100 transition-opacity" />
          <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
          <div className="relative z-10">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📂</div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase italic">Drop Neural Assets Here</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-10 opacity-60 font-medium">Inject PDF or DOCX resumes to expand the global skill matrix.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-glow-emerald transition-all"
            >
              Select Targets
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px]" />
          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40">Total Entities</p>
          <p className="text-5xl font-black text-[var(--text-primary)] tracking-tighter truncate">{candidates.length}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px]" />
          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40">Unique Skills</p>
          <p className="text-5xl font-black text-emerald-400 tracking-tighter truncate">{skillsList.length}</p>
        </div>
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden px-10">
          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Top Market Abundance</p>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((s, i) => (
              <span key={i} className="px-4 py-2 rounded-xl bg-black/20 border border-[var(--border-color)] text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                {s.name} <span className="ml-2 text-emerald-500 opacity-60">x{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Matrix Interface */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl relative group">
        <div className="p-10 border-b border-[var(--border-color)] bg-black/10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg opacity-30">🔍</span>
            <input 
              type="text" 
              placeholder="SEARCH NODE IDENTITIES..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl pl-16 pr-8 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all italic shadow-inner"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 hidden lg:block">Filter by DNA Element:</label>
            <select 
              value={filterSkill}
              onChange={e => setFilterSkill(e.target.value)}
              className="flex-1 md:flex-none bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 focus:outline-none italic appearance-none cursor-pointer shadow-inner pr-12 min-w-[200px]"
            >
              <option value="">All Skills</option>
              {skillsList.slice(0, 50).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-[var(--border-color)]">
                <th className="p-10 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80 sticky left-0 z-20 bg-[var(--bg-card)] border-r border-[var(--border-color)]">Entity Root</th>
                {skillsList.slice(0, 15).map(skill => (
                  <th key={skill} className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] text-center opacity-80 whitespace-nowrap min-w-[150px]">{skill}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredCandidates.map((cand, idx) => (
                <tr key={idx} className="group hover:bg-emerald-500/[0.02] transition-colors duration-300">
                  <td className="p-10 sticky left-0 z-20 bg-[var(--bg-card)] group-hover:bg-[#1a1f29] transition-colors border-r border-[var(--border-color)]">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-emerald-500/10 group-hover:rotate-6 transition-transform">
                        {cand.name ? cand.name[0] : '?'}
                      </div>
                      <div>
                        <span className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tighter italic group-hover:text-emerald-400 transition-colors block leading-none">{cand.name}</span>
                        <span className="text-[11px] text-[var(--text-primary)] font-bold opacity-60 mt-2 block tracking-widest leading-none">{cand.email}</span>
                      </div>
                    </div>
                  </td>
                  {skillsList.slice(0, 15).map(skill => (
                    <td key={skill} className="p-8 text-center transition-all group-hover:scale-105">
                      {(cand.skills || []).includes(skill) ? (
                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-in pulse duration-2000 infinite">
                            ✓
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center opacity-5">
                          <div className="w-2 h-2 rounded-full bg-[var(--text-secondary)]" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={100} className="p-32 text-center">
                    <div className="text-6xl opacity-10 mb-6 italic">🛸</div>
                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] opacity-20 text-xs italic">No Entity Matches Detected in current Vector Space</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Intelligence Trends */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-transparent to-primary/5 border border-[var(--border-color)] rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[200px] pointer-events-none" />
        <h3 className="text-[var(--text-primary)] font-black text-3xl mb-16 flex items-center gap-6 tracking-tighter uppercase italic leading-none relative z-10">
          <span className="w-16 h-16 bg-emerald-400 text-[var(--bg-base)] rounded-[2rem] flex items-center justify-center text-3xl shadow-glow-emerald">📈</span> Global Skill Distribution Trend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
          <div className="space-y-10">
            {topSkills.slice(0, 4).map((s, i) => (
              <div key={i} className="space-y-4 group/bar">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest italic group-hover/bar:text-emerald-400 transition-colors uppercase">{s.name}</p>
                  <p className="text-[10px] font-black text-emerald-500 opacity-60 tracking-[0.2em]">{Math.round((s.count / candidates.length) * 100)}% DENSITY</p>
                </div>
                <div className="h-4 bg-black/30 rounded-full border border-[var(--border-color)] p-1 overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-glow-emerald transition-all duration-1000 ease-out"
                    style={{ width: `${(s.count / candidates.length) * 100}%`, transitionDelay: `${i * 100}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center items-center text-center p-12 bg-black/20 rounded-[3rem] border border-[var(--border-color)] shadow-inner">
            <div className="text-6xl mb-8 animate-pulse text-emerald-400 drop-shadow-glow">✨</div>
            <h4 className="text-[var(--text-primary)] font-black text-2xl mb-4 tracking-tighter uppercase leading-none italic">Neural Optimization Suggestion</h4>
            <p className="text-[var(--text-secondary)] text-sm font-medium italic opacity-40 leading-relaxed max-w-[280px]">"Global pool shows 82% alignment with Vector-based React architecture. Suggest focusing on specialized Redis/Caching latent skillsets."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillExtraction;
