import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  status: 'Open' | 'Draft' | 'Closed';
  applicants: number;
  created_at: string;
  deadline: string;
  description: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const JobPostings: React.FC = () => {
  const { token } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Open' | 'Draft' | 'Closed'>('All');
  const [form, setForm] = useState({ title: '', department: '', location: '', employment_type: 'Full-time', deadline: '', description: '', status: 'Draft' });

  // CEO-5: Connect HR Job Postings to actual backend API
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.items.map((j: any) => ({
          ...j,
          applicants: j.applicants || 0, // Mock applicants for now until fully wired
          created_at: new Date(j.created_at).toISOString().split('T')[0],
          deadline: j.deadline || '',
        })));
      }
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const addJob = async (status: 'Draft' | 'Open') => {
    if (!form.title) return;
    try {
      const payload = { ...form, status };
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Job ${status === 'Open' ? 'published' : 'saved as draft'}!`);
        setForm({ title: '', department: '', location: '', employment_type: 'Full-time', deadline: '', description: '', status: 'Draft' });
        setShowModal(false);
        fetchJobs();
      } else {
        toast.error('Failed to create job');
      }
    } catch (err) {
      toast.error('Error creating job');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : currentStatus === 'Draft' ? 'Open' : 'Draft';
    // Optimistic update
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus as any } : j));
    try {
      await fetch(`${API}/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      toast.error("Failed to update status");
      fetchJobs(); // Revert
    }
  };

  const deleteJob = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    // Optimistic update
    setJobs(prev => prev.filter(j => j.id !== id));
    try {
      await fetch(`${API}/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job deleted");
    } catch (err) {
      toast.error("Failed to delete job");
      fetchJobs(); // Revert
    }
  };

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);

  const statusBadge = (status: string) => {
    if (status === 'Open') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'Draft') return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            💼 Talent Acquisition
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">Job Postings</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-base font-medium opacity-60 italic">"Manage the active position hierarchy and track inbound candidate DNA influx."</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-10 py-5 rounded-2xl bg-primary text-[var(--bg-base)] font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shrink-0">
          + Deploy New Opening
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 text-sm animate-pulse">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          Loading your jobs...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {(['Open', 'Draft', 'Closed'] as const).map(s => (
              <div key={s} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 text-center shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tighter drop-shadow-md">{jobs.filter(j => j.status === s).length}</div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${s === 'Open' ? 'text-emerald-400' : s === 'Draft' ? 'text-yellow-400' : 'text-[var(--text-secondary)] opacity-40'}`}>{s} Positions</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex bg-black/20 border border-[var(--border-color)] rounded-2xl p-1.5 w-fit mb-10 backdrop-blur-xl shadow-inner">
            {(['All', 'Open', 'Draft', 'Closed'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-2xl' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div className="grid gap-6">
            {filtered.map(job => (
              <div key={job.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 hover:border-primary/50 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap mb-4">
                      <h3 className="text-2xl font-black text-[var(--text-primary)] pr-2 truncate tracking-tight uppercase italic" title={job.title}>{job.title}</h3>
                      <span className={`text-[9px] px-3 py-1.5 rounded-full border font-black uppercase tracking-widest ${statusBadge(job.status)} shadow-sm`}>{job.status}</span>
                      <span className="text-[9px] px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10 font-black uppercase tracking-widest">{job.employment_type}</span>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] text-[var(--text-secondary)] font-bold mb-6 flex-wrap opacity-60">
                      {job.department && <span className="flex items-center gap-2">🏢 {job.department}</span>}
                      {job.location && <span className="flex items-center gap-2">📍 {job.location}</span>}
                      <span className="flex items-center gap-2 uppercase tracking-widest">📅 {job.created_at}</span>
                      {job.deadline && <span className="flex items-center gap-2 uppercase tracking-widest text-primary">⏰ {job.deadline}</span>}
                    </div>
                    {job.description && (
                       <p className="text-[var(--text-secondary)] text-sm line-clamp-2 italic font-medium opacity-40 group-hover:opacity-80 transition-opacity">"{job.description}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-6 shrink-0">
                    <div className="text-center bg-black/20 p-5 rounded-[2rem] border border-[var(--border-color)] shadow-inner">
                      <div className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">{job.applicants}</div>
                      <div className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Inbound DNA</div>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => toggleStatus(job.id, job.status)} className="text-[9px] px-5 py-3 rounded-xl bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        {job.status === 'Draft' ? '▶ Deploy' : job.status === 'Open' ? '⏹ Terminate' : '↺ Relist'}
                      </button>
                      <button onClick={() => deleteJob(job.id)} className="text-[9px] px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all shadow-lg">Purge</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-600 flex flex-col items-center">
                <div className="text-5xl mb-4">💼</div>
                <p>No {filter !== 'All' ? filter.toLowerCase() : ''} job postings yet.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 animate-in fade-in duration-500">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto scrollbar-hide relative group/modal">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex justify-between items-center mb-10 pb-8 border-b border-[var(--border-color)]">
              <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">Deploy Opening</h2>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black/20 border border-[var(--border-color)] rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform">×</button>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Job Taxonomy Identity *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-5 text-[var(--text-primary)] text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner italic font-medium" placeholder="e.g. Senior Neural Systems Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Department</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner" placeholder="Engineering" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Location Layer</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner" placeholder="Hub / Remote" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Employment Protocol</label>
                  <select value={form.employment_type} onChange={e => setForm(f => ({ ...f, employment_type: e.target.value }))} className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner appearance-none cursor-pointer">
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Ingestion Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 [color-scheme:dark] shadow-inner" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] block opacity-40">Role DNA Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full bg-black/20 border border-[var(--border-color)] rounded-[2rem] px-6 py-6 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner resize-none italic font-medium" placeholder="Specify the core competencies, vectorized requirements, and latent expectations..." />
              </div>
            </div>
            <div className="flex gap-6 mt-12 pt-8 border-t border-[var(--border-color)]">
              <button onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-2xl bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all">Abort</button>
              <button onClick={() => addJob('Draft')} className="flex-1 py-5 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500/20 transition-all shadow-lg shadow-yellow-500/10">Stash Draft</button>
              <button onClick={() => addJob('Open')} className="flex-1 py-5 rounded-2xl bg-primary text-[var(--bg-base)] font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20">Finalize Payload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostings;
