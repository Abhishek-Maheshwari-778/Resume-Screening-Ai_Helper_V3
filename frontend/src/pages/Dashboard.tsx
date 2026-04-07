import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const Dashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [statsData, setStatsData] = React.useState({
    resumes_created: 0,
    analyses_completed: 0,
    templates_used: 0,
    average_score: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const API = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API}/api/users/stats`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error("Stats fetch failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const stats = [
    { title: 'Resumes Created', value: isLoading ? '...' : statsData.resumes_created, icon: '📄', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'ATS Analyses', value: isLoading ? '...' : statsData.analyses_completed, icon: '🔍', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Avg Score', value: isLoading ? '...' : `${statsData.average_score || 0}%`, icon: '📈', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Jobs Tracked', value: isLoading ? '...' : statsData.templates_used, icon: '📌', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const quickActions = [
    { title: 'Build Resume', desc: 'AI-powered builder', icon: '📝', href: '/app/builder', badge: 'Soon', color: 'blue' },
    { title: 'ATS Checker', desc: 'Scan against JD', icon: '🔍', href: '/app/checker', color: 'emerald' },
    { title: 'Job Match', desc: 'Find your best fit', icon: '🎯', href: '/app/job-match', color: 'primary', badge: 'New' },
    { title: 'My Resumes', desc: 'Manage vault', icon: '📁', href: '/app/resumes', color: 'purple' },
    { title: 'Templates', desc: 'Premium designs', icon: '🎨', href: '/app/templates', badge: 'Soon', color: 'orange' },
    { title: 'App Tracker', desc: 'Track progress', icon: '📌', href: '/app/tracker', badge: 'Soon', color: 'indigo' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      
      {/* Premium Hero Header */}
      <div className="relative group overflow-hidden rounded-[3.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] p-12 shadow-2xl transition-all">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                 ⚡ Career Intelligence
               </div>
               <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tighter leading-none">
                 Welcome back, <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-black">{user?.name?.split(' ')[0]}!</span>
               </h1>
               <p className="text-[var(--text-primary)] text-xl font-medium leading-relaxed mb-10 opacity-90 italic">
                 Your AI career engine is fully operational. We've identified <span className="text-primary font-black italic underline decoration-primary/30">3 high-match</span> opportunities for you.
               </p>
               <div className="flex flex-wrap gap-4">
                  <Link to="/app/checker" className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-widest rounded-3xl hover:scale-105 transition-all shadow-2xl">Start Analysis</Link>
                  <Link to="/app/job-match" className="px-10 py-5 bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-white/10 transition-all">My Matches</Link>
               </div>
            </div>

            <div className="flex flex-col items-center justify-center p-12 bg-black/5 rounded-[3rem] border border-[var(--border-color)] backdrop-blur-3xl min-w-[300px] shadow-inner">
               <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                  <svg className="w-44 h-44 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--border-color)] opacity-20" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#blue_grad_hero)" strokeWidth="3" strokeDasharray="78 22" strokeLinecap="round" className="transition-all duration-1000" />
                    <defs>
                      <linearGradient id="blue_grad_hero" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter italic">78%</span>
                    <span className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-widest mt-1 opacity-80">Strength</span>
                  </div>
               </div>
               <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full">+5% Trend Score</p>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((s, i) => (
           <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] hover:border-primary/30 transition-all group shadow-xl">
              <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-glow transition-transform group-hover:scale-110`}>{s.icon}</div>
              <div className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">{s.value}</div>
              <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{s.title}</div>
           </div>
         ))}
      </div>

      {/* Action Hub */}
      <div className="space-y-8">
         <h3 className="text-primary font-black text-[12px] uppercase tracking-[0.4em] pl-6 mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-primary/20" />
            TOOLBOX ARCHITECTURE
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="group bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] hover:border-primary/40 transition-all hover:scale-[1.02] flex items-center gap-8 shadow-2xl relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.03] transition-colors`} />
                <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl group-hover:bg-white/[0.1] transition-all border border-transparent group-hover:border-[var(--border-color)]">{action.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-[var(--text-primary)] font-black text-[15px] uppercase tracking-tight">{action.title}</h4>
                    {action.badge && (
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${action.badge === 'New' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-[var(--text-secondary)]'}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] text-xs font-medium opacity-60">{action.desc}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all text-primary text-2xl font-black translate-x-4 group-hover:translate-x-0">→</div>
              </Link>
            ))}
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
