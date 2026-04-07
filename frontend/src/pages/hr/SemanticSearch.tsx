import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = useAuthStore.getState().token;
      
      const res = await fetch(`${API}/api/ai/hr/search`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ query })
      });
      
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      setResults(data.items || []);
    } catch (err: any) {
      toast.error('Search engine error. Try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            🔍 Vector Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">Semantic Search</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-base font-medium opacity-60 italic">"Natural language querying of the entire candidate database via AI embeddings."</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] shadow-2xl overflow-hidden group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 pointer-events-none"></div>
        <form onSubmit={handleSearch} className="p-12 relative z-10 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto items-center">
          <div className="flex-1 relative group/input w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl opacity-30 group-focus-within/input:opacity-70 transition-opacity">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Senior Python developer with fintech experience...'"
              className="w-full bg-black/20 border border-[var(--border-color)] rounded-[2rem] py-6 pl-16 pr-6 text-[var(--text-primary)] focus:ring-2 focus:ring-primary/50 focus:outline-none shadow-inner text-xl placeholder:text-[var(--text-secondary)] placeholder:opacity-30 italic font-medium transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className={`px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 shrink-0 ${
              isSearching || !query.trim()
                ? 'bg-primary/20 text-white/30 cursor-not-allowed'
                : 'bg-primary text-white hover:scale-105 shadow-primary/20'
            }`}
          >
            {isSearching ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Querying...</> : 'Deploy Engine →'}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-8">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs flex items-center gap-4 opacity-70">
              <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-lg">📊</span> Results ({results.length})
            </h3>
            <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-lg">Vector Embedding Match</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {results.map((candidate, i) => (
                <div 
                  key={candidate.id} 
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] hover:border-primary/50 transition-all shadow-2xl animate-in slide-in-from-bottom-12 duration-700 group relative overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center border border-white/10 text-2xl font-black text-white shadow-lg shadow-primary/10">
                        {candidate.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-black text-xl leading-tight uppercase tracking-tight italic group-hover:text-primary transition-colors">{candidate.name}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40 mt-1">{candidate.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-primary tracking-tighter drop-shadow-lg">
                        {Math.round(candidate.score)}%
                      </div>
                      <div className="text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-widest opacity-30 mt-1">Similarity</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-[9px] uppercase font-black tracking-[0.2em] text-[var(--text-secondary)] opacity-30 mb-2">Neural Key Features</div>
                    <div className="flex flex-wrap gap-2.5">
                      {candidate.matched_skills?.slice(0, 8).map((skill: string) => (
                        <span key={skill} className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills?.filter((s: string) => !candidate.matched_skills?.includes(s)).slice(0, 4).map((skill: string) => (
                        <span key={`other-${skill}`} className="px-3.5 py-1.5 bg-white/2 text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest opacity-40">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-[var(--border-color)] flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-[var(--border-color)]">
                      Intelligence DNA
                    </button>
                    <button className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20">
                      Sync Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-[var(--bg-card)]/30 border-2 border-dashed border-[var(--border-color)] rounded-[4rem] p-32 text-center shadow-inner group relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-8xl mb-8 group-hover:scale-110 transition-transform duration-700">📭</div>
              <h3 className="text-[var(--text-primary)] font-black text-2xl mb-4 tracking-tighter uppercase italic leading-none">Zero Signal Match</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm font-medium opacity-40 italic mx-auto">
                No candidate DNA matches the current query hierarchy. Expand the search parameters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;
