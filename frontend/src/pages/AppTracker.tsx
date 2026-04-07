import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  company: string;
  role: string;
  status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Archived';
  date: string;
  salary?: string;
  location?: string;
}

const INITIAL_JOBS: Job[] = [
  { id: '1', company: 'Google', role: 'SRE-2', status: 'Applied', date: '2026-04-01', salary: '₹24-30L', location: 'Remote' },
  { id: '2', company: 'Meta', role: 'React Developer', status: 'Interview', date: '2026-04-03', salary: '₹18-22L', location: 'Bangalore' },
  { id: '3', company: 'OpenAI', role: 'Full Stack Engineer', status: 'Wishlist', date: '2026-04-05', salary: 'Equity-based', location: 'WFH' },
];

const AppTracker: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const columns: Job['status'][] = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Archived'];

  const moveJob = (id: string, newStatus: Job['status']) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    toast.success(`Moved to ${newStatus} 🚀`, {
      style: { background: '#111827', color: '#60a5fa', border: '1px solid #1e3a8a' }
    });
  };

  const addJob = () => {
    const company = prompt('Company Name?');
    const role = prompt('Role Title?');
    if (company && role) {
      setJobs([...jobs, { 
        id: Date.now().toString(), 
        company, 
        role, 
        status: 'Wishlist', 
        date: new Date().toISOString().split('T')[0],
        location: 'TBD'
      }]);
    }
  };

  return (
    <div className="max-w-full pb-24 animate-in fade-in duration-1000 h-full flex flex-col px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">
              📌 APPLICATION PIPELINE
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">OPPORTUNITY <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">MATRIX</span></h1>
           <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Visualizing every career evolution trajectory in real-time."</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
           <div className="hidden lg:flex flex-col items-end px-8 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-inner">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">CONVERSION PULSE</span>
              <span className="text-2xl font-black text-emerald-400 italic tabular-nums tracking-tighter leading-none mt-1">12.5%</span>
           </div>
           <button 
             onClick={addJob} 
             className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] italic"
           >
             + ADD NODE
           </button>
        </div>
      </div>

      <div className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide px-2">
        {columns.map(col => (
          <div key={col} className="min-w-[360px] w-[360px] flex flex-col gap-8">
             <div className="flex items-center justify-between px-8 py-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] backdrop-blur-3xl shadow-xl">
                <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${col === 'Offer' ? 'bg-emerald-500' : col === 'Interview' ? 'bg-blue-500' : 'bg-[var(--text-secondary)] opacity-20'}`} />
                   <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] italic ${col === 'Offer' ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>{col}</h3>
                </div>
                <span className="bg-[var(--bg-base)] border border-[var(--border-color)] px-4 py-1.5 rounded-full text-[10px] font-black text-[var(--text-secondary)] opacity-60 tabular-nums shadow-inner">{jobs.filter(j => j.status === col).length}</span>
             </div>
             
             <div className="flex-1 space-y-6 min-h-[700px] p-2">
                {jobs.filter(j => j.status === col).map(job => (
                  <div key={job.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3.5rem] p-10 shadow-2xl group/card hover:border-primary/40 transition-all cursor-default relative overflow-hidden group">
                     {/* Gradient highlight for group hover */}
                     <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover/card:bg-primary/10 transition-colors opacity-40 invisible dark:visible" />
                     
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex flex-col">
                           <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] italic opacity-80 mb-2 leading-none">{job.company}</p>
                           <h4 className="text-[var(--text-primary)] font-black text-2xl leading-[0.9] transition-colors group-hover/card:text-primary tracking-tighter uppercase italic">{job.role}</h4>
                        </div>
                        <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-20 tabular-nums italic font-mono">{job.date.split('-').slice(1).join('/')}</span>
                     </div>
                     
                     <div className="space-y-4 mb-10 relative z-10">
                        <div className="flex items-center gap-4 text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest opacity-40 italic">
                           <span>📍 {job.location || 'Distributed'}</span>
                           <span className="w-1 h-1 bg-[var(--text-secondary)] rounded-full" />
                           <span>💰 {job.salary || 'NDA'}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-8 border-t border-[var(--border-color)] gap-4 relative z-10">
                        <div className="relative flex-1">
                           <select 
                              className="w-full bg-[var(--bg-base)] text-[9px] font-black text-[var(--text-secondary)] uppercase border border-[var(--border-color)] rounded-2xl py-4 px-6 focus:ring-0 appearance-none cursor-pointer hover:bg-white/5 transition-colors text-center shadow-inner italic tracking-[0.2em]"
                              value={job.status}
                              onChange={(e) => moveJob(job.id, e.target.value as any)}
                           >
                              {columns.map(c => <option key={c} value={c} className="bg-[var(--bg-base)]">{c}</option>)}
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[10px]">▼</div>
                        </div>
                        <button className="w-14 h-14 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-xl hover:bg-white/5 transition-all shadow-inner grayscale hover:grayscale-0 group-hover/card:rotate-12">💬</button>
                     </div>
                  </div>
                ))}
                
                {jobs.filter(j => j.status === col).length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[4rem] py-32 opacity-10 grayscale group/empty hover:opacity-20 transition-all shadow-inner relative overflow-hidden">
                      <div className="text-6xl mb-6 group-hover/empty:scale-110 group-hover/empty:-rotate-6 transition-transform">🏜️</div>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">SILENCE IN SECTOR</p>
                   </div>
                )}

                {/* Coming Soon Feature Card Preview in last column */}
                {col === 'Archived' && jobs.filter(j => j.status === col).length > 0 && (
                   <div className="mt-8 p-10 bg-primary/5 border border-primary/20 border-dashed rounded-[3.5rem] relative overflow-hidden group/soon">
                      <div className="absolute top-0 right-0 p-6 text-4xl opacity-10">🔮</div>
                      <h5 className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">COMING SOON</h5>
                      <p className="text-[var(--text-secondary)] text-[11px] font-bold italic opacity-60 leading-relaxed mb-6">AI Automated Pre-Screening & Interview Shadowing</p>
                      <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-1 italic">VIEW ROADMAP →</button>
                   </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppTracker;
