import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const BulkAnalysis: React.FC = () => {
  const { token } = useAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    const API = import.meta.env.VITE_API_URL || '';
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const resp = await fetch(`${API}/api/resumes/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) throw new Error('Bulk upload failed');
      const results = await resp.json();
      setData(prev => [...results, ...prev]);
      toast.success(`Successfully analyzed ${results.length} resumes! 🚀`);
    } catch (err) {
      toast.error('Failed to process batch. Please try again.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredData = filter === 'All' ? data : data.filter(d => d.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.docx,.doc,.txt"
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            🚀 High-Throughput Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">Bulk Analysis</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-lg font-medium opacity-90 italic">"Mass ingestion of candidate payloads with vectorized TF-IDF ranking."</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-black/20 border border-[var(--border-color)] rounded-2xl p-1.5 backdrop-blur-xl">
            {['All', 'Analyzed', 'Processing', 'Ready'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${
                  filter === f ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-xl' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={triggerUpload}
            disabled={isProcessing}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 ${
              isProcessing ? 'bg-primary/50 cursor-not-allowed opacity-50' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/20'
            }`}
          >
            {isProcessing ? '⚙️ Processing...' : '📂 Batch Upload →'}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden shadow-2xl relative backdrop-blur-3xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity" />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8 shadow-glow" />
            <p className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tighter italic">AI Ingesting Payload...</p>
            <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-[0.3em] mt-4 opacity-40">Vectorizing hierarchies</p>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-[var(--border-color)]">
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80">Identifier</th>
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80">Candidate Entity</th>
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80">Applied Role</th>
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80">Status</th>
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80 text-center">Neural Score</th>
                <th className="p-8 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] opacity-80">Intelligence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredData.length > 0 ? filteredData.map((row, i) => (
                <tr key={row.id} className="group hover:bg-white/2 transition-colors duration-200">
                  <td className="p-8 text-[10px] text-[var(--text-secondary)] font-black opacity-30 font-mono tracking-tighter">{row.id}</td>
                  <td className="p-8">
                    <div className="text-[var(--text-primary)] font-black text-[16px] uppercase tracking-tight italic group-hover:text-primary transition-colors">{row.name}</div>
                    <div className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest opacity-60 mt-1">{row.date}</div>
                  </td>
                  <td className="p-8 text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-tight opacity-70">{row.role}</td>
                  <td className="p-8">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      row.status === 'Analyzed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      row.status === 'Processing' ? 'bg-primary/10 text-primary border border-primary/20' :
                      'bg-white/5 text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <div className="inline-block px-4 py-2 rounded-xl bg-black/20 border border-[var(--border-color)] shadow-inner">
                      <span className={`font-black text-lg tracking-tighter ${row.score > 85 ? 'text-emerald-400' : 'text-primary'}`}>{row.score}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-black ml-1 opacity-20">/100</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex gap-2.5 flex-wrap">
                      {(row.tags || []).map((t: string) => (
                        <span key={t} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-wider border border-transparent group-hover:border-[var(--border-color)] transition-all">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="text-6xl mb-6 opacity-10">📂</div>
                    <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Zero Payload Detected</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkAnalysis;
