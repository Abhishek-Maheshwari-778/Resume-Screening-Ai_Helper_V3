import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Profile: React.FC = () => {
  const { user, token, updateProfile, refreshProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    bio: (user as any)?.bio || '',
    linkedin: (user as any)?.linkedin || '',
    github: (user as any)?.github || '',
    website: (user as any)?.website || '',
    location: (user as any)?.location || '',
    phone: (user as any)?.phone || '',
  });

  const roleMeta: Record<string, { label: string; icon: string; color: string }> = {
    candidate: { label: 'Job Seeker', icon: '👤', color: 'from-blue-500 to-cyan-400' },
    employer: { label: 'Employer', icon: '🏢', color: 'from-violet-500 to-purple-400' },
    hr: { label: 'HR Professional', icon: '🎯', color: 'from-emerald-500 to-green-400' },
    enterprise: { label: 'Enterprise', icon: '🌐', color: 'from-orange-500 to-red-400' },
    admin: { label: 'Platform Admin', icon: '🛡️', color: 'from-red-500 to-pink-400' },
  };

  const meta = roleMeta[user?.role || 'candidate'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(form);
      toast.success('Neural Identity Synced! 🧬');
      setEditing(false);
    } catch (e: any) {
      toast.error('Sync Protocol Interrupt: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000 px-6">
      <div className="mb-20 border-b border-[var(--border-color)] pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-8">
            👤 NEURAL IDENTITY
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">CORE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">ENGINE</span></h1>
          <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-90 max-w-lg leading-relaxed shadow-sm">"Your professional heartbeat across the world's most advanced career intelligence matrix."</p>
        </div>
        <div className="flex items-center gap-6 bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-[3rem] shadow-2xl group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-28 h-28 flex items-center justify-center">
             <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
               <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="4" className="text-[var(--border-color)] opacity-10" />
               <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#blue_grad_profile)" strokeWidth="4" strokeDasharray="82 18" strokeLinecap="round" className="transition-all duration-1000" />
               <defs>
                 <linearGradient id="blue_grad_profile" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#3b82f6" />
                   <stop offset="100%" stopColor="#06b6d4" />
                 </linearGradient>
               </defs>
             </svg>
             <div className="absolute flex flex-col items-center">
               <span className="text-3xl font-black text-[var(--text-primary)] tabular-nums italic leading-none">82%</span>
               <span className="text-[11px] text-[var(--text-primary)] font-black uppercase tracking-widest mt-1 opacity-80">PULSE</span>
             </div>
          </div>
          <div>
            <h4 className="text-[var(--text-primary)] font-black text-sm uppercase tracking-tight mb-1 italic">Vetted Profile</h4>
            <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black opacity-40 tracking-widest">RANKED TOP 15% GLOBALLY</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Identity Card */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] overflow-hidden shadow-2xl relative group pb-12 transition-all">
              <div className={`h-48 bg-gradient-to-r ${meta.color} opacity-10`} />
              <div className="px-12 relative">
                 <div className="flex justify-between items-end -mt-16 mb-12">
                    <div className="w-36 h-36 rounded-[2.5rem] border-[8px] border-[var(--bg-card)] overflow-hidden bg-[var(--bg-base)] shadow-2xl relative z-10 group-hover:scale-105 transition-transform">
                       {user?.photo_url ? (
                         <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-6xl bg-black/5 group-hover:rotate-12 transition-transform">{meta.icon}</div>
                       )}
                    </div>
                    {editing ? (
                      <button onClick={handleSave} className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-2xl">SYNK CORE</button>
                    ) : (
                      <button onClick={() => setEditing(true)} className="px-10 py-5 bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all">REFINE HUB</button>
                    )}
                 </div>

                 <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tighter uppercase leading-none italic">{user?.name}</h2>
                 <p className="text-[var(--text-secondary)] text-lg font-bold mb-10 opacity-60 italic leading-none">{user?.email}</p>

                 <div className="space-y-6">
                    <div className="flex items-center gap-6 px-8 py-6 rounded-[2rem] bg-black/5 border border-[var(--border-color)] group/item hover:border-primary/30 transition-all">
                       <span className="text-3xl group-hover/item:rotate-12 transition-transform">🛡️</span>
                       <div>
                          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">NETWORK CLASS</p>
                          <p className="text-[var(--text-primary)] text-sm font-black uppercase tracking-tight italic">{meta.label}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 px-8 py-6 rounded-[2rem] bg-black/5 border border-[var(--border-color)] group/item hover:border-blue-500/30 transition-all">
                       <span className="text-3xl group-hover/item:rotate-12 transition-transform">🌐</span>
                       <div>
                          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">CLOUD HANDSHAKE</p>
                          <p className="text-[var(--text-primary)] text-sm font-black uppercase tracking-tight italic">{user?.auth_provider === 'google' ? 'GOOGLE IDENTITY' : 'INTERNAL SYNC'}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-12 text-center shadow-2xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] mb-10 opacity-40">CRITICAL PROTOCOL</p>
              <button className="w-full py-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-500/10 transition-all shadow-inner">PURGE IDENTITY SYSTEM</button>
           </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-12">
           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-20 -mr-40 -mt-40 group-hover:bg-primary/10 transition-all" />
              <h3 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.5em] mb-12 opacity-40 italic">PROFESSIONAL DNA MATRIX</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[
                   { label: 'NODE BASE', key: 'company', placeholder: 'TechCorp / Nexus Lab' },
                   { label: 'GEO COORDINATES', key: 'location', placeholder: 'Bangalore / Remote' },
                   { label: 'LINKEDIN SIGNAL', key: 'linkedin', placeholder: 'linkedin.com/in/nexus' },
                   { label: 'GITHUB REPO', key: 'github', placeholder: 'github.com/source' },
                   { label: 'VOICE COMMS', key: 'phone', placeholder: '+91 ZERO ...' },
                   { label: 'NEXUS (PORTFOLIO)', key: 'website', placeholder: 'yourpulse.network' },
                 ].map(f => (
                   <div key={f.key} className="space-y-4">
                      <label className="block text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-2">{f.label}</label>
                      <input 
                        type="text"
                        disabled={!editing}
                        value={(form as any)[f.key]}
                        placeholder={f.placeholder}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className={`w-full bg-[var(--bg-base)] border border-[var(--border-color)] rounded-3xl px-8 py-6 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary/50 transition-all font-mono font-bold placeholder:text-[var(--text-secondary)] placeholder:opacity-20 shadow-inner ${!editing && 'opacity-40 cursor-not-allowed border-transparent'}`}
                      />
                   </div>
                 ))}
                 <div className="md:col-span-2 space-y-4">
                    <label className="block text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-2">EXECUTIVE BIOMETRICS (SUMMARY)</label>
                    <textarea 
                      disabled={!editing}
                      rows={6}
                      value={form.bio}
                      placeholder="DECODE YOUR CAREER TRAJECTORY INTO HIGH-VALENCE TEXT..."
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      className={`w-full bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[3rem] px-10 py-8 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary/50 transition-all font-mono font-bold resize-none leading-relaxed placeholder:text-[var(--text-secondary)] placeholder:opacity-20 shadow-inner ${!editing && 'opacity-40 cursor-not-allowed border-transparent'}`}
                    />
                 </div>
              </div>
           </div>

           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3.5rem] p-16 shadow-2xl relative overflow-hidden group">
              <h3 className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.5em] mb-12 opacity-40 italic">VERIFIED SKILLS CLUSTER</h3>
              <div className="flex flex-wrap gap-4">
                 {['React.js', 'TypeScript', 'Node.js', 'FastAPI', 'Deep-Learning', 'NLP', 'Docker', 'AWS', 'System-Design', 'TailwindCSS'].map(skill => (
                   <div key={skill} className="px-6 py-3.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-black uppercase tracking-tight hover:border-primary/40 transition-all cursor-default shadow-lg group/skill relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/skill:opacity-100 transition-opacity" />
                      <span className="relative z-10 italic">{skill}</span>
                   </div>
                 ))}
                 <button className="px-6 py-3.5 rounded-2xl border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all">+ EXPAND STACK</button>
              </div>
           </div>

           <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-[var(--border-color)] rounded-[4rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all grayscale">🛡️</div>
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </div>
                  <p className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tighter italic">RECRUITER VISIBILITY MODE</p>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium max-w-sm leading-relaxed opacity-60 italic">"Expose your neural profile to verified enterprise nodes for passive opportunity acquisition."</p>
             </div>
             <button className="relative z-10 whitespace-nowrap px-10 py-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[var(--bg-base)] transition-all shadow-xl shadow-black/20">SECURITY ROADMAP</button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
