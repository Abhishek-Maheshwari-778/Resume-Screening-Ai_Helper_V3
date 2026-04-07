import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Developer', 'ML Engineer', 'DevOps Engineer'];

const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuthStore();
  const dashboardPath = user?.role === 'admin' ? '/x-control-center' : ['hr', 'employer', 'enterprise'].includes(user?.role ?? '') ? '/hr' : '/app';
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'results'>('idle');
  // BUG-1 FIX: store full analysis result, not just {name, score}
  const [fileData, setFileData] = useState<{
    name: string;
    score: number;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: string;
    recommendations?: string[];
    breakdown?: Record<string, number>;
  } | null>(null);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('uploading');
    
    const API = import.meta.env.VITE_API_URL || '';
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload and Parse
      const resp = await fetch(`${API}/api/ai/analyze-public`, {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) throw new Error('Analysis failed');
      
      setUploadState('analyzing');
      const data = await resp.json();
      
      // Artificial delay to show processing steps for better UX
      setTimeout(() => {
        setFileData(data);
        setUploadState('results');
        toast.success('Analysis complete! See your results below ✨', { 
          icon: '📊', 
          style: { borderRadius: '12px', background: '#111420', color: '#fff' } 
        });
      }, 1000);
    } catch (err: any) {
      toast.error('Could not analyze resume. Please try again.');
      setUploadState('idle');
    }
  };

  const handleExport = async () => {
    if (!fileData) return;
    const API = import.meta.env.VITE_API_URL || '';
    try {
      // BUG-1 FIX: send full analysis report, not just the recommendation string
      const reportContent = [
        `ATS ANALYSIS REPORT`,
        `File: ${fileData.name}`,
        `ATS Score: ${fileData.score}%`,
        ``,
        `STRENGTHS:`,
        ...(fileData.strengths || []).map(s => `• ${s}`),
        ``,
        `AREAS TO IMPROVE:`,
        ...(fileData.weaknesses || []).map(w => `• ${w}`),
        ``,
        `AI RECOMMENDATION:`,
        fileData.recommendation || '',
      ].join('\n');

      const resp = await fetch(`${API}/api/ai/export-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: reportContent,  // BUG-1 FIX: full structured report
          name: fileData.name
        })
      });

      if (!resp.ok) throw new Error('Export failed');

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Report_${fileData.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ATS Report exported! 📄');
    } catch (err) {
      toast.error('Export failed. Please try again.');
    }
  };

  const resetHero = () => {
    setUploadState('idle');
    setFileData(null);
  };

  // UX-7: Role cycling uses CSS keyframes now (no JS intervals/renders needed)

  const features = [
    {
      icon: '🤖',
      title: 'AI Resume Builder',
      description: 'Groq Llama3 generates powerful bullet points, rewrites weak sentences, and tailors your resume to any job role in seconds.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🎯',
      title: 'DeepSeek ATS Checker',
      description: 'Instantly score your resume against ATS parsers, find missing keywords, and get a structured improvement breakdown.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: '🧠',
      title: 'NLP Skill Extraction',
      description: 'Our spaCy model auto-identifies 150+ skills from any resume text — categorized, ranked, and ready to compare.',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: '📁',
      title: 'HR Bulk Screening',
      description: 'Upload hundreds of resumes at once. TF-IDF + Keyword Overlap instantly ranks every candidate against your Job Description.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '⚔️',
      title: 'Head-to-Head Compare',
      description: 'Pick any two candidates and compare their skills, experience, and gaps side-by-side in one clean view.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: '🛡️',
      title: 'Enterprise Data Security',
      description: 'Your data is encrypted with AES-256 and stored in secure, private clusters. We never sell your data or use it to train public models.',
      color: 'from-cyan-500 to-teal-500',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer, Google',
      avatar: 'P',
      color: 'from-blue-500 to-cyan-500',
      text: 'I went from getting zero callbacks to landing 3 interviews in a week. The ATS Checker showed me exactly which keywords I was missing.',
    },
    {
      name: 'Rahul Gupta',
      role: 'HR Manager, Infosys',
      avatar: 'R',
      color: 'from-emerald-500 to-green-500',
      text: 'Bulk screening 200+ resumes used to take my team 3 days. Now it takes 10 minutes. The TF-IDF ranking is incredibly accurate.',
    },
    {
      name: 'Ananya Singh',
      role: 'Data Scientist, Microsoft',
      avatar: 'A',
      color: 'from-violet-500 to-purple-500',
      text: 'The AI bullet point generator transformed my resume from generic to impressive. Got my dream job within a month of using this platform.',
    },
  ];

  const faqs = [
    {
      q: 'Is this platform free to use?',
      a: 'Yes! You can use the ATS Checker, Resume Tips, and basic features for free without even creating an account. Create a free account to unlock the full AI Resume Builder and advanced tracking tools.',
    },
    {
      q: 'How does the ATS Score work?',
      a: 'Our AI (powered by DeepSeek) reads your resume and compares it against standard ATS parsing rules — keyword density, formatting, section headers, and job description match. You get a score out of 100 with specific improvement suggestions.',
    },
    {
      q: 'Can HR teams use this for bulk screening?',
      a: 'Absolutely. HR and Employer accounts can upload 100s of resumes at once, run them against any job description, and get an AI-ranked shortlist instantly. Sign up with the "HR / Employer" role to access these features.',
    },
    {
      q: 'Is my data private and secure?',
      a: 'Yes. Your resumes are stored securely in MongoDB Atlas. We never share your data with third parties. You can delete your account and all data at any time from your profile settings.',
    },
    {
      q: 'Which AI models power the platform?',
      a: 'We use Groq (Llama3-70B) for fast content generation, DeepSeek for deep ATS analysis, and spaCy NLP for skill extraction. All three run in the backend through our FastAPI server.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-x-hidden transition-colors duration-500">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-primary/10 rounded-[100%] blur-[160px] pointer-events-none z-0 opacity-40" />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            {/* Left Col: Text */}
            <div className="text-center lg:text-left space-y-10 relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary border-2 border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_10px_30px_rgba(34,211,238,0.3)] animate-pulse">
                🚀 v3.1 Career Intelligence Engine Active
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-[var(--text-primary)] leading-[1.1] tracking-tighter uppercase italic">
                Dominate <br className="hidden md:block" />
                <span className="h-[1.25em] overflow-hidden inline-flex flex-col align-bottom">
                  <span className="animate-role-spin text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 m-0 p-0 list-none flex flex-col whitespace-nowrap">
                    <span className="h-[1.2em] leading-[1.2] flex items-center">Tech</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center">Eng</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center">Product</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center">Data</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center">Design</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center">DevOps</span>
                    <span className="h-[1.2em] leading-[1.2] flex items-center" aria-hidden="true">Tech</span>
                  </span>
                </span>
                <br /> Hierarchy
              </h1>
              <p className="text-xl text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-70 italic">
                "The frontier platform for candidates to build <span className="text-[var(--text-primary)] font-black">ATS-Proof DNA</span> and for leaders to source elite talent through bulk-AI matrix screening."
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-6">
                {!user ? (
                  <Link to="/auth" className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-blue-500/10 text-center text-sm">
                    Initialize Free Sync →
                  </Link>
                ) : (
                  <Link to={dashboardPath} className="px-12 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl text-sm">
                    Enter Personal Dashboard →
                  </Link>
                )}
                <Link to="/pricing" className="px-10 py-5 bg-transparent border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-black uppercase tracking-widest hover:bg-black/5 transition-all text-center text-sm">
                  View Access Plans
                </Link>
              </div>

              {/* Trust markers */}
              <div className="flex items-center justify-center lg:justify-start gap-10 pt-12">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-black/10 border-4 border-[var(--bg-base)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] uppercase shadow-lg">AI</div>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-primary border-4 border-[var(--bg-base)] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg">+5k</div>
                </div>
                <div className="text-xs text-white leading-tight font-bold">
                  <div className="text-[var(--text-primary)] font-black uppercase tracking-[0.2em] text-[10px] mb-1">Global Intelligence</div>
                  <span className="opacity-80">Serving 5,000+ elite seekers weekly</span>
                </div>
              </div>
            </div>

            {/* Right Col: Try-Now Widget */}
            <div className="relative group">
              <div className="absolute -inset-8 bg-primary/20 blur-[120px] rounded-full group-hover:bg-primary/30 transition-all duration-1000 opacity-60" />
              <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-2xl group-hover:border-primary/30 transition-all min-h-[520px] flex flex-col justify-center">
                
                {uploadState === 'idle' && (
                  <div className="animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner border border-primary/20 group-hover:rotate-12 transition-transform">🎯</div>
                        <div>
                          <h3 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tighter leading-none">Instant Scan</h3>
                          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Llama 3.1 & DeepSeek Analysis</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-lg">Zero Barrier</span>
                    </div>

                    <div className="space-y-10">
                      <label className="border-4 border-dashed border-[var(--border-color)] rounded-[3rem] p-16 text-center hover:border-primary/50 transition-all cursor-pointer bg-black/5 group/upload relative overflow-hidden flex flex-col items-center">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                        <div className="text-7xl mb-6 group-hover/upload:scale-110 transition-transform">📄</div>
                        <p className="text-[var(--text-primary)] font-black text-lg mb-2 uppercase tracking-tighter">Initialize Upload</p>
                        <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest opacity-40">PDF / DOCX / TXT Hierarchy</p>
                        <input type="file" className="hidden" onChange={handleQuickUpload} accept=".pdf,.docx,.txt" />
                      </label>
                      <div className="flex items-center gap-6 py-2 opacity-30">
                        <div className="flex-1 h-px bg-[var(--text-primary)]" />
                        <span className="text-[var(--text-primary)] font-black text-[9px] uppercase tracking-[0.3em] font-mono">Neural Interface</span>
                        <div className="flex-1 h-px bg-[var(--text-primary)]" />
                      </div>
                    </div>
                  </div>
                )}

                {(uploadState === 'uploading' || uploadState === 'analyzing') && (
                  <div className="text-center py-16 animate-in fade-in duration-500">
                    <div className="relative w-32 h-32 mx-auto mb-10 flex items-center justify-center">
                      <div className="absolute inset-0 border-8 border-primary/10 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-5xl animate-bounce">🤖</div>
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tighter uppercase">
                      {uploadState === 'uploading' ? 'Extracting DNA...' : 'Neural Mapping...'}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Parsing latent intent and match-probability</p>
                  </div>
                )}

                {uploadState === 'results' && fileData && (
                  <div className="animate-in fade-in zoom-in-95 duration-700 scale-100 text-center">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-emerald-500/20">📊</div>
                        <div>
                          <div className="text-[var(--text-primary)] font-black text-sm truncate max-w-[150px] uppercase tracking-tight">{fileData.name}</div>
                          <div className="text-[var(--text-secondary)] text-[10px] uppercase font-black opacity-40 tracking-widest">Protocol Finalized</div>
                        </div>
                      </div>
                      <button onClick={resetHero} className="w-10 h-10 rounded-xl bg-black/5 hover:bg-red-500 hover:text-white flex items-center justify-center text-[var(--text-secondary)] transition-all text-xl">✕</button>
                    </div>

                    <div className="flex items-center gap-12 justify-center py-10">
                      <div className="text-center relative">
                        <div className={`text-8xl font-black ${fileData.score >= 70 ? 'text-emerald-500' : 'text-orange-500'} tracking-tighter tabular-nums leading-none`}>{fileData.score}%</div>
                        <div className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-[0.2em] mt-3 opacity-40">ATS Match Ready</div>
                        {fileData.score >= 70 && <div className="absolute -top-4 -right-4 text-3xl animate-bounce">🔥</div>}
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 mb-8 text-left relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:rotate-12 transition-transform">✨</div>
                      <div className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        Neural Intelligence Matrix
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {fileData.breakdown && Object.entries(fileData.breakdown).map(([key, val]) => (
                          <div key={key} className="bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="text-[var(--text-secondary)] text-[8px] uppercase font-black opacity-40 mb-1">{key}</div>
                            <div className="text-white font-black text-sm tabular-nums">{val}%</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        {fileData.strengths?.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-center gap-3 text-emerald-400 text-[11px] font-bold group-hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" /> {s}
                          </div>
                        ))}
                        {fileData.weaknesses?.slice(0, 2).map((w, i) => (
                          <div key={i} className="flex items-center gap-3 text-orange-400 text-[11px] font-bold group-hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]" /> {w}
                          </div>
                        ))}
                      </div>

                      {fileData.recommendations && fileData.recommendations.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <div className="text-[var(--text-secondary)] text-[8px] uppercase font-black opacity-30 tracking-widest">Priority Improvement Vectors</div>
                          {fileData.recommendations.slice(0, 2).map((rec, i) => (
                            <div key={i} className="bg-primary/10 p-4 rounded-xl text-[11px] text-primary/90 font-bold italic leading-relaxed border border-primary/20 animate-pulse">
                              "{rec}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleExport}
                        className="w-full py-5 bg-[var(--text-primary)] text-[var(--bg-base)] font-black rounded-2xl text-center shadow-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em]"
                      >
                        📥 Download Full Report
                      </button>
                      
                      <Link to="/auth" className="block w-full py-5 text-[var(--text-primary)] hover:bg-black/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-[var(--border-color)]">
                        Initialize Full Optimization →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hidden xl:block absolute -top-10 -right-10 bg-[var(--bg-card)] border-2 border-primary/60 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(34,211,238,0.3)] animate-in slide-in-from-right duration-1000 delay-500 backdrop-blur-3xl group-hover:scale-110 transition-transform">
                <div className="text-white font-black text-5xl text-center tracking-tighter drop-shadow-[0_0_25px_rgba(34,211,238,1)]">98.4%</div>
                <div className="text-xs text-white font-black uppercase tracking-widest text-center mt-3 opacity-100 italic leading-tight brightness-200">Optima Reach <br />Pass Frequency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROLE CARDS ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Candidate Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3.5rem] p-12 relative overflow-hidden group hover:border-primary/40 transition-all shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all -mr-40 -mt-40" />
            <div className="text-7xl mb-8">👤</div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase">Elite Seekers</h2>
            <p className="text-[var(--text-secondary)] text-lg mb-10 opacity-60 font-medium italic leading-relaxed">"The frontier weapons to build career DNA that demands a callback."</p>
            <ul className="space-y-4 text-[var(--text-secondary)] mb-12 font-bold">
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-primary" /> Multi-JD AI Matrix Ranking</li>
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-primary" /> Llama 3.1 Atomic Bullet Rewriting</li>
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-primary" /> Real-time Pass/Fail Probability Gauge</li>
            </ul>
            <Link to="/auth" className="text-primary font-black uppercase tracking-[0.3em] text-[11px] hover:opacity-70 flex items-center gap-3 transition-all">
              Initialize Talent Sync <span className="text-xl">→</span>
            </Link>
          </div>

          {/* Employer / HR Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3.5rem] p-12 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all -mr-40 -mt-40" />
            <div className="text-7xl mb-8">🏢</div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase leading-none">Command Hub</h2>
            <p className="text-[var(--text-secondary)] text-lg mb-10 opacity-60 font-medium italic leading-relaxed">"Screen resumes and rank candidates instantly through our TF-IDF & DeepSeek hybrid ranker."</p>
            <ul className="space-y-4 text-[var(--text-secondary)] mb-12 font-bold">
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Mass Bulk Extraction (500+ Resumes)</li>
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500" /> NLP Skill-Overlap Visualizer</li>
              <li className="flex items-center gap-4 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Head-to-Head Candidate Matrix</li>
            </ul>
            <Link to="/auth" className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[11px] hover:opacity-70 flex items-center gap-3 transition-all">
              Deploy Recruiter Ops <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ───────────────────────────────────── */}
      <section className="bg-[var(--bg-card)]/30 py-32 border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] mb-6 tracking-tighter uppercase leading-none italic">Frontier Operations</h2>
            <p className="text-xl text-[var(--text-secondary)] font-medium opacity-40 uppercase tracking-[0.4em]">FastAPI · Python NLP · Frontier LLMs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 transition-all hover:-translate-y-2 group cursor-default shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-8 bg-gradient-to-br ${f.color} shadow-2xl shadow-blue-500/10 group-hover:rotate-6 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-4 group-hover:text-primary transition-colors tracking-tighter uppercase">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-medium opacity-60 italic">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: '3+', label: 'FRONTIER AI MODELS', color: 'text-primary' },
            { value: '300+', label: 'SKILLS EXTRACTION', color: 'text-emerald-500' },
            { value: '<1s', label: 'LATENCY CLUSTER', color: 'text-violet-500' },
            { value: '100%', label: 'GDPR PRIVACY DNA', color: 'text-orange-500' },
          ].map((s, i) => (
            <div key={i} className="border-r border-[var(--border-color)] last:border-r-0 px-6">
              <div className="text-6xl font-black text-[var(--text-primary)] mb-3 tracking-tighter italic">{s.value}</div>
              <div className={`${s.color} font-black text-[10px] uppercase tracking-[0.3em] opacity-80 leading-none`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-[var(--bg-card)]/30 py-32 border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase leading-none italic">Portal Feedback</h2>
            <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Verifying the evolution</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-12 hover:border-primary/40 transition-all shadow-2xl relative group">
                <div className="absolute top-10 right-12 text-blue-500/20 text-6xl font-black opacity-20">"</div>
                <div className="flex text-emerald-400 text-[10px] mb-8 gap-1 tracking-widest">{Array(5).fill('★').join('')}</div>
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-10 font-medium italic opacity-80">"{t.text}"</p>
                <div className="flex items-center gap-5 pt-8 border-t border-[var(--border-color)]">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/10`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-[var(--text-primary)] font-black text-sm uppercase tracking-tighter leading-none mb-1">{t.name}</div>
                    <div className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-widest opacity-40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase italic leading-none">Knowledge Core</h2>
          <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">Decrypting the Platform</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className={`bg-[var(--bg-card)] border transition-all rounded-[2rem] overflow-hidden group ${openFaq === i ? 'border-primary' : 'border-[var(--border-color)]'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-10 py-8 text-left"
              >
                <span className="text-[var(--text-primary)] font-black text-[13px] pr-8 uppercase tracking-[0.1em]">{faq.q}</span>
                <span className={`text-[var(--text-secondary)] opacity-40 transition-transform duration-500 text-xl font-bold ${openFaq === i ? 'rotate-180 text-primary opacity-100' : ''}`}>▼</span>
              </button>
              <div
                className="overflow-hidden transition-all duration-700 ease-in-out"
                style={{ maxHeight: openFaq === i ? '400px' : '0px' }}
              >
                <div className="px-10 pb-10">
                  <div className="h-px bg-[var(--border-color)] mb-8 opacity-40" />
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-medium italic opacity-80">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-40">
        <div className="bg-gradient-to-br from-blue-900/60 to-violet-900/60 rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden border border-blue-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[160px] opacity-60" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-[160px] opacity-60" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.95] italic">
              Seize Your <br /> Career Dominance
            </h2>
            <p className="text-xl md:text-2xl text-blue-200 mb-16 max-w-2xl mx-auto font-medium opacity-80 italic">
              "Thousands are building their evolution with Resume AI. Access the engine right now."
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/auth"
                className="px-12 py-5 bg-white text-blue-900 rounded-2xl text-sm font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-all w-full sm:w-auto"
              >
                Initialize Account
              </Link>
              <Link
                to="/check"
                className="px-12 py-5 bg-white/10 border-2 border-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all w-full sm:w-auto backdrop-blur-xl"
              >
                Neural Scan Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
