import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AIChatbot from '../AIChatbot';
import ThemeToggle from '../ThemeToggle';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHR = user?.role && ['hr', 'employer', 'enterprise'].includes(user.role);
  const isAdmin = user?.role === 'admin';
  const basePath = isAdmin ? '/admin' : isHR ? '/hr' : '/app';

  const candidateNav = [
    { name: 'Dashboard', path: '/app', icon: '📊' },
    { name: 'Build Resume', path: '/app/builder', icon: '📝', badge: 'Soon' },
    { name: 'ATS Checker', path: '/app/checker', icon: '🔍' },
    { name: 'Job Match', path: '/app/job-match', icon: '🎯', badge: 'New' },
    { name: 'My Resumes', path: '/app/resumes', icon: '📄' },
    { name: 'App Tracker', path: '/app/tracker', icon: '📌', badge: 'Soon' },
    { name: 'Templates', path: '/app/templates', icon: '🎨', badge: 'Soon' },
    { name: 'Profile', path: '/app/profile', icon: '👤' },
  ];

  const hrNav = [
    { name: 'Dashboard', path: '/hr', icon: '📊' },
    { name: 'Screen Candidates', path: '/hr/screening', icon: '🎯' },
    { name: 'Bulk Analysis', path: '/hr/bulk', icon: '📁' },
    { name: 'Skill Extraction', path: '/hr/skills', icon: '🧠' },
    { name: 'Analytics', path: '/hr/analytics', icon: '📈', badge: 'New' },
    { name: 'Profile', path: '/hr/profile', icon: '👤' },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: '🛡️' },
    { name: 'Users', path: '/admin/users', icon: '👥', badge: 'New' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈', badge: 'New' },
    { name: 'Profile', path: '/admin/profile', icon: '👤' },
  ];

  const navItems = isAdmin ? adminNav : isHR ? hrNav : candidateNav;

  const isActive = (path: string) => {
    if (path === basePath) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const roleGradient: Record<string, string> = {
    candidate: 'from-blue-500 to-cyan-500',
    employer: 'from-violet-500 to-purple-500',
    hr: 'from-emerald-500 to-green-500',
    enterprise: 'from-orange-500 to-red-500',
    admin: 'from-red-500 to-pink-500',
  };
  const gradColor = roleGradient[user?.role ?? ''] ?? 'from-blue-500 to-cyan-500';

  const roleLabel: Record<string, string> = {
    candidate: 'Candidate Portal',
    employer: 'Employer Portal',
    hr: 'HR Portal',
    enterprise: 'Enterprise Portal',
    admin: 'Admin Portal',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex text-[var(--text-primary)] transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex flex-col shadow-2xl relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8 border-b border-[var(--border-color)] relative z-10">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-white font-black text-xl">R</span>
          </div>
          <div>
            <div className="text-[var(--text-primary)] font-black text-sm tracking-tight uppercase">Resume AI</div>
            <div className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-none mt-1">{roleLabel[user?.role ?? ''] ?? 'Portal'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-10 overflow-y-auto scrollbar-hide relative z-10">
          <div className="px-6 mb-4">
            <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.25em] px-2 mb-2">Systems</p>
          </div>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between mx-4 px-4 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all mb-2 group
                ${isActive(item.path)
                  ? `bg-gradient-to-r ${gradColor} text-white shadow-xl shadow-blue-500/10`
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent hover:border-[var(--border-color)]'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl leading-none opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.name}
              </div>
              {(item as any).badge && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${isActive(item.path) ? 'bg-white/20 text-white border-white/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                  {(item as any).badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User card / Controls */}
        <div className="p-6 border-t border-[var(--border-color)] bg-white/2 relative z-10">
          <div className="flex items-center gap-4 mb-6 group cursor-pointer" onClick={() => navigate('/app/profile')}>
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradColor} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg overflow-hidden group-hover:scale-105 transition-transform`}>
              {user?.photo_url
                ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[var(--text-primary)] text-xs font-black truncate uppercase tracking-tighter">{user?.name}</div>
              <div className="text-[var(--text-primary)] text-[11px] font-medium truncate opacity-60 italic">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="flex-1 py-3.5 rounded-2xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/10 hover:bg-red-500/10 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        <header className="lg:hidden flex items-center justify-between h-16 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${gradColor} rounded-xl flex items-center justify-center`}>
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-[var(--text-primary)] font-black text-xs uppercase tracking-tight">Resume AI</span>
          </div>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradColor} flex items-center justify-center text-white font-black text-sm overflow-hidden`}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-12 overflow-auto relative">
           {/* Dynamic background orbs that change with theme */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -mt-48 -mr-48 opacity-40" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -mb-48 -ml-48 opacity-20" />
           
           <div className="relative z-10">
             <Outlet />
           </div>
        </main>

        <AIChatbot />
      </div>
    </div>
  );
};

export default Layout;
