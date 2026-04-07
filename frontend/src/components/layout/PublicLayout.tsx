import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AIChatbot from '../AIChatbot';
import ThemeToggle from '../ThemeToggle';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const dashboardPath = user?.role === 'admin' ? '/admin' : ['hr', 'employer', 'enterprise'].includes(user?.role ?? '') ? '/hr' : '/app';

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col relative transition-colors duration-500 overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--bg-card)]/80 backdrop-blur-2xl border-b border-[var(--border-color)] shadow-2xl py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-6 transition-all duration-500">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[var(--text-primary)] text-xl font-black tracking-tighter uppercase leading-none block">Resume AI</span>
                <div className="text-[9px] text-primary font-black uppercase tracking-[0.2em] opacity-80 shadow-sm">by Abhishek M.</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2 p-1.5 bg-[var(--bg-card)] rounded-2xl border-2 border-white/20 shadow-2xl">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive(item.path)
                      ? 'text-white bg-primary shadow-lg shadow-primary/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-5">
              <ThemeToggle />
              <div className="w-px h-6 bg-white/20" />
              {user ? (
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95"
                >
                  <span>Portal</span>
                  <span className="opacity-40 animate-pulse">→</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-8 py-3.5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95"
                >
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex lg:hidden items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 text-white flex items-center justify-center transition-all active:scale-90 shadow-xl"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div className={`lg:hidden transition-all duration-700 ease-in-out overflow-hidden ${mobileOpen ? 'max-h-[600px] opacity-100 border-b border-[var(--border-color)] bg-[var(--bg-card)]' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-10 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  isActive(item.path)
                    ? 'text-[var(--bg-base)] bg-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] bg-white/5 border border-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-white/10" />
            <div className="flex flex-col gap-3">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="w-full text-center py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-black uppercase tracking-[0.2em]"
                >
                  Access Your Portal →
                </Link>
              ) : (
                <Link to="/auth" className="w-full text-center py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-black uppercase tracking-[0.2em]">
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 mt-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border-color)] pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            {/* Brand Column */}
            <div className="space-y-8">
              <Link to="/" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <span className="text-white font-black text-2xl">R</span>
                </div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-black text-xl tracking-tighter uppercase leading-none">Resume AI</h3>
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1 opacity-60">Intelligence Engine</p>
                </div>
              </Link>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs font-medium opacity-60">
                The most advanced career intelligence portal. Architected with FastAPI, Python NLP, and Frontier AI Models.
              </p>
              <div className="flex items-center gap-4">
                {['twitter', 'github', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-primary hover:border-primary/50 hover:scale-110 transition-all shadow-xl">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current rounded-md opacity-40" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-white font-black text-[11px] mb-8 uppercase tracking-[0.3em] opacity-80">Intelligence Hub</h4>
              <ul className="space-y-5">
                <li><Link to="/check" className="text-[var(--text-secondary)] hover:text-primary text-sm font-bold transition-all flex items-center gap-3 group">ATS Checker <span className="text-[10px] bg-primary text-white px-3 py-1 rounded-full font-black group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(34,211,238,0.4)]">FREE</span></Link></li>
                <li><Link to="/auth" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">AI Resume Builder</Link></li>
                <li><Link to="/templates" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Design Templates</Link></li>
                <li><Link to="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Access Plans</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-white font-black text-[11px] mb-8 uppercase tracking-[0.3em] opacity-80">Intelligence DNA</h4>
              <ul className="space-y-5">
                <li><Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Our Evolution</Link></li>
                <li><Link to="/features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Core Capabilities</Link></li>
                <li><Link to="/how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">The Algorithm</Link></li>
                <li><Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Direct Support</Link></li>
              </ul>
            </div>

            {/* Support/Links Column */}
            <div>
              <h4 className="text-white font-black text-[11px] mb-8 uppercase tracking-[0.3em] opacity-80">Ethics & Status</h4>
              <ul className="space-y-5">
                <li><Link to="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Data Privacy DNA</Link></li>
                <li><Link to="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Usage Protocols</Link></li>
                <li><Link to="/security" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-all">Security Shields</Link></li>
                <li className="pt-4">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 w-fit shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Active</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[var(--text-secondary)] text-[12px] flex flex-col md:flex-row items-center gap-4 text-center md:text-left opacity-80 font-medium whitespace-nowrap">
              <span>© {new Date().getFullYear()} Career Intelligence Platform.</span>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>Architected by <span className="text-white font-black">Abhishek Maheshwari</span></span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/20 shadow-inner">
                <span className="text-[10px] text-white font-black uppercase tracking-widest opacity-80">Tech Matrix</span>
                <div className="flex items-center -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-[var(--bg-card)] shadow-lg" />
                  <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-[var(--bg-card)] shadow-lg" />
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* NEW: Global AI Assistant */}
      <AIChatbot />
    </div>
  );
};

export default PublicLayout;
