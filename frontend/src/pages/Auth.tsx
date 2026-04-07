import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/stores/authStore';
import toast from 'react-hot-toast';

type AuthMode = 'select' | 'role' | 'signup' | 'login';

interface RoleOption {
  id: UserRole;
  icon: string;
  title: string;
  description: string;
  color: string;
  gradient: string;
  needsCompany?: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: 'candidate',
    icon: '👤',
    title: 'Job Seeker',
    description: 'Build ATS-perfect resumes & track applications',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'hr',
    icon: '🏢',
    title: 'HR / Employer',
    description: 'Bulk screening, NLP analysis & candidate ranking',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-green-500',
    needsCompany: true,
  },
];

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@resume.ai', password: 'Admin@123', gradient: 'from-red-500 to-pink-500', icon: '🛡️' },
  { label: 'HR', email: 'hr@techcorp.com', password: 'Hr@12345', gradient: 'from-emerald-500 to-green-500', icon: '🎯' },
  { label: 'Candidate', email: 'john@example.com', password: 'Cand@123', gradient: 'from-blue-500 to-cyan-500', icon: '👤' },
];

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, registerWithEmail, loginWithEmail, isLoading, user, clearError } = useAuthStore();

  const [step, setStep] = useState<AuthMode>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [company, setCompany] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roleOption = ROLES.find(r => r.id === selectedRole)!;

  React.useEffect(() => {
    if (user) {
      const dest = user.role === 'admin' ? '/x-control-center' : user.role === 'candidate' ? '/app' : '/hr';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const redirect = () => {
    const role = useAuthStore.getState().user?.role;
    navigate(role === 'admin' ? '/x-control-center' : role === 'candidate' ? '/app' : '/hr', { replace: true });
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await signInWithGoogle(selectedRole, roleOption.needsCompany ? company : undefined);
      toast.success('Welcome! Signed in successfully 🎉');
      redirect();
    } catch (err: any) {
      toast.error(err.message || 'Sign-in failed');
    }
  };

  const handleEmailRegister = async () => {
    setFormError('');
    if (!form.name || !form.email || !form.password) return setFormError('All fields are required');
    if (form.password !== form.confirmPassword) return setFormError('Passwords do not match');
    if (form.password.length < 8) return setFormError('Password must be at least 8 characters');
    if (roleOption.needsCompany && !company) return setFormError('Company name is required for this role');
    try {
      clearError();
      await registerWithEmail(form.email, form.password, form.name, selectedRole, company || undefined);
      toast.success('Account created! Welcome 🎉');
      redirect();
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  const handleEmailLogin = async (emailOverride?: string, passwordOverride?: string) => {
    const email = emailOverride ?? form.email;
    const password = passwordOverride ?? form.password;
    setFormError('');
    if (!email || !password) return setFormError('Email and password are required');
    try {
      clearError();
      await loginWithEmail(email, password);
      toast.success('Welcome back! 👋');
      redirect();
    } catch (err: any) {
      setFormError(err.message || 'Login failed — check credentials');
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setForm(f => ({ ...f, email, password }));
    setStep('login');
    await handleEmailLogin(email, password);
  };

  // ─── Left panel (branding) ────────────────────────────────────────────────
  const LeftPanel = () => (
    <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0d1117] via-[#0f1720] to-[#0a1628] border-r border-white/5 relative overflow-hidden">
      {/* ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px]" />

      {/* Logo */}
      <div className="relative z-10">
        <Link to="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <div>
            <div className="text-white font-bold">Resume AI</div>
            <div className="text-gray-500 text-xs">by Abhishek Maheshwari</div>
          </div>
        </Link>

        <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
          Build Your Perfect<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI-Powered Resume</span>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          One platform for job seekers and HR teams. Get started in seconds — no credit card required.
        </p>

        {/* Feature bullets */}
        <div className="space-y-4">
          {[
            { icon: '🤖', text: 'AI bullet generation with Groq Llama3', sub: 'Instantly improve any job description point' },
            { icon: '🎯', text: 'ATS score analysis via DeepSeek', sub: 'Know exactly which keywords you\'re missing' },
            { icon: '📌', text: 'Application tracker & cover letters', sub: 'Manage your entire job search in one place' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
              <div>
                <div className="text-white text-sm font-medium">{f.text}</div>
                <div className="text-gray-500 text-xs mt-0.5">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom mini stats */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        {[
          { value: '3+', label: 'AI Models' },
          { value: '150+', label: 'Skills Detected' },
          { value: 'Free', label: 'To Get Started' },
        ].map((s, i) => (
          <div key={i} className="text-center bg-white/5 border border-white/5 rounded-xl py-3">
            <div className="text-white font-bold text-xl">{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b12] lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
      <LeftPanel />

      {/* ─── Right Panel (Form) ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12 min-h-screen bg-[#080b12] border-l border-white/5">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <span className="text-white font-bold text-lg">Resume AI</span>
            </Link>
          </div>

          {/* ── Select: Sign Up / Sign In ──────────────────────────────── */}
          {step === 'select' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
                <p className="text-gray-400 text-sm">Join thousands of candidates and HR professionals.</p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setStep('role')}
                  className="group w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/30 hover:border-blue-500/60 text-white font-medium rounded-2xl transition-all hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-xl flex-shrink-0 shadow-lg shadow-blue-500/30">🚀</div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">Create New Account</div>
                    <div className="text-gray-400 text-xs">Set up your profile in under 2 minutes</div>
                  </div>
                  <div className="ml-auto text-gray-500 group-hover:text-white transition-colors">→</div>
                </button>

                <button
                  onClick={() => setStep('login')}
                  className="group w-full flex items-center gap-4 p-4 bg-white/3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium rounded-2xl transition-all hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">🔑</div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">Sign In to Existing Account</div>
                    <div className="text-gray-400 text-xs">Welcome back — continue where you left off</div>
                  </div>
                  <div className="ml-auto text-gray-500 group-hover:text-white transition-colors">→</div>
                </button>
              </div>

              <p className="text-center text-gray-600 text-xs mb-8">
                By continuing, you agree to our{' '}
                <span className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">Terms of Service</span>
                {' '}and{' '}
                <span className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">Privacy Policy</span>
              </p>

              {/* Demo logins */}
              <DemoSection onDemo={handleDemoLogin} isLoading={isLoading} />
            </div>
          )}

          {/* ── Role Selection ──────────────────────────────────────────── */}
          {step === 'role' && (
            <div>
              <button onClick={() => setStep('select')} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
                ← Back
              </button>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Who are you?</h1>
                <p className="text-gray-400 text-sm">Choose your role to personalize your dashboard and tools.</p>
              </div>

              <div className="space-y-2.5 mb-6">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
                      {role.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-white font-semibold text-sm">{role.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{role.description}</div>
                    </div>
                    {selectedRole === role.id && (
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {roleOption.needsCompany && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Google, TCS, Startup Inc."
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                onClick={() => setStep('signup')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Sign Up ─────────────────────────────────────────────────── */}
          {step === 'signup' && (
            <div>
              <button onClick={() => setStep('role')} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
                ← Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleOption.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
                  {roleOption.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Create Account</h1>
                  <span className={`text-xs font-medium ${roleOption.color}`}>{roleOption.title}</span>
                </div>
              </div>

              {formError && <ErrorBanner message={formError} />}

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl transition-all mb-5 disabled:opacity-50 shadow-sm"
              >
                <GoogleIcon />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <Divider />

              <div className="space-y-3 mb-5">
                <input type="text" placeholder="Full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
                <input type="email" placeholder="Email address" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 characters)" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors pr-10" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                <input type="password" placeholder="Confirm password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
              </div>

              <button
                onClick={handleEmailRegister}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 mb-4"
              >
                {isLoading ? 'Creating your account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-500 text-xs">
                Already have an account?{' '}
                <button onClick={() => setStep('login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign In</button>
              </p>
            </div>
          )}

          {/* ── Sign In ─────────────────────────────────────────────────── */}
          {step === 'login' && (
            <div>
              <button onClick={() => setStep('select')} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
                ← Back
              </button>

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h1>
                <p className="text-gray-400 text-sm">Sign in to your account to continue.</p>
              </div>

              {formError && <ErrorBanner message={formError} />}

              {/* Google */}
              <button
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl transition-all mb-5 disabled:opacity-50 shadow-sm"
              >
                <GoogleIcon />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <Divider />

              <div className="space-y-3 mb-5">
                <input type="email" placeholder="Email address" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors pr-10" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <button
                id="btn-login"
                onClick={() => handleEmailLogin()}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 mb-4"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-gray-500 text-xs mb-8">
                Don't have an account?{' '}
                <button onClick={() => setStep('select')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one free</button>
              </p>

              <DemoSection onDemo={handleDemoLogin} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const Divider = () => (
  <div className="flex items-center gap-3 mb-5">
    <div className="flex-1 h-px bg-white/8" />
    <span className="text-gray-600 text-xs">or continue with email</span>
    <div className="flex-1 h-px bg-white/8" />
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-5 flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
    <span className="text-base flex-shrink-0">⚠️</span>
    {message}
  </div>
);

const DemoSection: React.FC<{ onDemo: (email: string, password: string) => void; isLoading: boolean }> = ({ onDemo, isLoading }) => (
  <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Verified Portal Access</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Admin', email: 'admin@resume.ai', password: 'Admin@123', gradient: 'from-red-600 to-pink-600' },
        { label: 'HR', email: 'hr@techcorp.com', password: 'Hr@12345', gradient: 'from-emerald-600 to-green-600' },
        { label: 'Candidate', email: 'john@example.com', password: 'Cand@123', gradient: 'from-blue-600 to-cyan-600' },
      ].map(d => (
        <button
          key={d.label}
          onClick={() => onDemo(d.email, d.password)}
          disabled={isLoading}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-br ${d.gradient} bg-opacity-10 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.03] disabled:opacity-50`}
          style={{ background: 'transparent' }}
        >
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${d.gradient} flex items-center justify-center text-xs shadow-sm font-bold text-white`}>
            {d.label[0]}
          </div>
          <span className="text-white text-xs font-medium">{d.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default Auth;
