import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const HRDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState({ candidates_screened: 0, top_matches: 0, active_sessions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch(`${API}/api/ai/hr/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch HR stats:', err);
      }
    };
    if (token) fetchStats();
  }, [token]);

  const roleColor = { employer: 'from-violet-500 to-purple-500', hr: 'from-emerald-500 to-green-500', enterprise: 'from-orange-500 to-red-500' };
  const color = roleColor[user?.role as keyof typeof roleColor] || 'from-blue-500 to-cyan-500';

  const quickActions = [
    { title: 'Screen Candidates', desc: 'Upload resumes & rank against JD', icon: '🎯', href: '/hr/screening', color: 'from-blue-600 to-cyan-600' },
    { title: 'Bulk Analysis', desc: 'Analyze multiple resumes at once', icon: '📊', href: '/hr/bulk', color: 'from-violet-600 to-purple-600' },
    { title: 'JD Synthesizer', desc: 'Generate & refine JDs with AI', icon: '📝', href: '/hr/jd-maker', color: 'from-orange-600 to-red-600' },
    { title: 'Skill Extraction', desc: 'Extract skill matrix from resumes', icon: '🧠', href: '/hr/skills', color: 'from-emerald-600 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-4 md:p-8 transition-colors duration-500">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[128px] opacity-40" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[140px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Welcome header */}
        <div className={`bg-gradient-to-r ${color} rounded-3xl p-8 mb-8 relative overflow-hidden shadow-sm`}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl bg-white/20 p-3 rounded-2xl shadow-sm">
                {user?.role === 'hr' ? '🎯' : user?.role === 'enterprise' ? '🌐' : '🏢'}
              </span>
              <div>
                <p className="text-white/100 text-sm font-black uppercase tracking-widest leading-none mt-1">{user?.role} · {user?.company || 'Your Organization'}</p>
              </div>
            </div>
            <p className="text-white/90 text-sm font-bold italic tracking-wide">Screen candidates, extract skills, and find the best talent using AI</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Candidates Screened', value: stats.candidates_screened, icon: '👥', color: 'text-blue-500' },
            { label: 'Active Sessions', value: stats.active_sessions, icon: '⚡', color: 'text-violet-500' },
            { label: 'Top Matches Found', value: stats.top_matches, icon: '⭐', color: 'text-emerald-500' },
          ].map((s, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all group backdrop-blur-xl">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
              <div className={`text-6xl font-black ${s.color} mb-3 tracking-tighter drop-shadow-sm`}>{s.value}</div>
              <div className="text-[var(--text-primary)] font-black text-[11px] uppercase tracking-[0.2em] opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter italic">Intelligence Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((a, i) => (
            <Link key={i} to={a.href}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50 rounded-3xl p-8 transition-all group flex flex-col shadow-xl hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl mb-6 group-hover:rotate-6 transition-transform">{a.icon}</div>
              <h3 className="text-[var(--text-primary)] font-black text-2xl mb-4 group-hover:text-primary transition-colors tracking-tighter uppercase">{a.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-10 flex-1 opacity-80 font-medium italic leading-relaxed">{a.desc}</p>
              <div className={`w-full py-4 text-center text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-r ${a.color} shadow-lg active:scale-95 transition-all`}>
                Deploy Tool →
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-40" />
          <h3 className="text-[var(--text-primary)] font-black text-2xl mb-12 flex items-center gap-4 tracking-tighter uppercase italic">
            <span className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🔬</span> Core AI Methodology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Secure mass upload of PDF/DOCX hierarchies', icon: '📁' },
              { step: '02', title: 'Neural Parsing', desc: 'spaCy & NER extraction of latent skillsets', icon: '🔍' },
              { step: '03', title: 'Vector Scoring', desc: 'TF-IDF semantics rank match probability', icon: '📊' },
              { step: '04', title: 'AI Synthesis', desc: 'Llama 3.1 generates deep intel summaries', icon: '🤖' },
            ].map((step, i) => (
              <div key={i} className="text-center relative group">
                {i < 3 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-[var(--border-color)] opacity-40" />}
                <div className="relative z-10 w-12 h-12 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center text-primary font-black text-xs mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">{step.icon}</div>
                <h4 className="text-[var(--text-primary)] font-black text-[12px] mb-3 uppercase tracking-widest">{step.title}</h4>
                <p className="text-[var(--text-secondary)] text-[12px] leading-relaxed opacity-80 font-bold italic">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
