import React from 'react';

const HRAnalytics: React.FC = () => {
  const metrics = [
    { label: 'Total Applications', value: '1,248', change: '+12%', icon: '📥', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Avg. Time to Hire', value: '18 days', change: '-3 days', icon: '⏱️', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Shortlist Rate', value: '24%', change: '+2%', icon: '🎯', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Offer Acceptance', value: '78%', change: '+5%', icon: '🤝', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ];

  const topSkills = [
    { skill: 'Python', count: 342, pct: 90 },
    { skill: 'React', count: 289, pct: 76 },
    { skill: 'Node.js', count: 218, pct: 57 },
    { skill: 'SQL', count: 195, pct: 51 },
    { skill: 'Docker', count: 167, pct: 44 },
    { skill: 'AWS', count: 143, pct: 38 },
  ];

  const pipeline = [
    { stage: 'Applied', count: 1248, color: 'bg-blue-500' },
    { stage: 'Screened', count: 380, color: 'bg-violet-500' },
    { stage: 'Interviewed', count: 142, color: 'bg-yellow-500' },
    { stage: 'Offered', count: 48, color: 'bg-emerald-500' },
    { stage: 'Hired', count: 37, color: 'bg-green-500' },
  ];

  const weeklyApps = [45, 62, 38, 89, 73, 55, 91, 67, 84, 72, 95, 68];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxApp = Math.max(...weeklyApps);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            📈 Global Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">HR Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-base font-medium opacity-60 italic">"Data-driven insights into your hiring pipeline and candidate evolution."</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`text-4xl mb-6 w-16 h-16 rounded-2xl ${m.bg.split(' ')[0]} border ${m.bg.split(' ')[1]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>{m.icon}</div>
            <div className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">{m.value}</div>
            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{m.label}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${m.color} bg-white/2 inline-block px-3 py-1 rounded-full shadow-inner`}>{m.change} Trend Flow</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Applications Bar Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-40" />
          <h3 className="text-[var(--text-primary)] font-black text-xs mb-10 uppercase tracking-[0.3em] opacity-40">Monthly Applications Payload</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyApps.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-primary/80 to-cyan-400/80 hover:from-primary hover:to-cyan-400 transition-all shadow-glow relative"
                  style={{ height: `${(val / maxApp) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-base)] text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">{val}</div>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase opacity-20">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] opacity-40" />
          <h3 className="text-[var(--text-primary)] font-black text-xs mb-10 uppercase tracking-[0.3em] opacity-40">Hiring Probability Funnel</h3>
          <div className="space-y-6">
            {pipeline.map((p, i) => (
              <div key={i} className="flex items-center gap-6 group/funnel">
                <div className="w-24 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 group-hover/funnel:opacity-100 transition-opacity">{p.stage}</div>
                <div className="flex-1 bg-black/20 rounded-full h-4 overflow-hidden shadow-inner p-1">
                  <div
                    className={`h-2 rounded-full ${p.color} transition-all duration-1000 ease-out shadow-glow`}
                    style={{ width: `${(p.count / pipeline[0].count) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs text-[var(--text-primary)] font-black tracking-tighter italic">{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Skills in Market */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] opacity-40" />
        <h3 className="text-[var(--text-primary)] font-black text-xs mb-10 uppercase tracking-[0.3em] opacity-40">🧠 High-Match Market Taxonomies</h3>
        <div className="space-y-6">
          {topSkills.map((s, i) => (
            <div key={i} className="flex items-center gap-6 group/skill">
              <div className="w-10 text-center text-[var(--text-secondary)] text-[10px] font-black opacity-20 group-hover/skill:opacity-100 transition-opacity">0{i + 1}</div>
              <div className="w-24 text-[12px] text-[var(--text-primary)] font-black uppercase tracking-tight italic group-hover/skill:text-primary transition-colors">{s.skill}</div>
              <div className="flex-1 bg-black/20 rounded-full h-3 p-0.5 shadow-inner">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000 ease-out shadow-glow"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <div className="w-24 text-right text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 group-hover/skill:opacity-80 leading-none">{s.count} Entities</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRAnalytics;
