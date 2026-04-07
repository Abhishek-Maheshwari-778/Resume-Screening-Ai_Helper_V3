import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import AILoadingState from '@/components/AILoadingState';
import IndustryApplicability from '@/components/IndustryApplicability';
import ResumeChatWidget from '@/components/ResumeChatWidget';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResumeChecker: React.FC = () => {
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [activeJdTab, setActiveJdTab] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isJdUploading, setIsJdUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [resumeId]);

  const loadResume = async (id: string) => {
    setIsPreloading(true);
    try {
      const resp = await fetch(`${API}/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to load resume');
      const data = await resp.json();
      setResumeText(data.content || '');
      setActiveTab('paste');
      toast.success('Resume Loaded for Analysis! ✨');
    } catch (err) {
      toast.error('Could not load resume data.');
    } finally {
      setIsPreloading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    toast.success(`${file.name} ready! ✨`);
  };

  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsJdUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`${API}/api/ai/extract-text`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` },
        body: formData 
      });
      if (!resp.ok) throw new Error('Extraction failed');
      const data = await resp.json();
      setJobDescription(data.text);
      toast.success('JD Scanned Successfully!');
    } catch (err) {
      toast.error('Could not extract text from JD.');
    } finally {
      setIsJdUploading(false);
    }
  };

  const handleMainAnalyze = async () => {
    setIsUploading(true);
    setAnalyzed(false);
    const formData = new FormData();
    
    if (activeTab === 'upload') {
      if (!resumeFile) { setIsUploading(false); return toast.error('Please select a resume file'); }
      formData.append('file', resumeFile);
    } else {
      if (resumeText.length < 50) { setIsUploading(false); return toast.error('Resume text too short'); }
      const blob = new Blob([resumeText], { type: 'text/plain' });
      formData.append('file', blob, 'resume.txt');
    }

    if (jobDescription) formData.append('job_description', jobDescription);
    if (targetRole) formData.append('target_role', targetRole);

    try {
      const resp = await fetch(`${API}/api/ai/analyze-public`, { 
        method: 'POST', 
        body: formData 
      });
      if (!resp.ok) throw new Error('Analysis failed');
      const data = await resp.json();
      setResult({
          ...data,
          rawText: data.resume_text || resumeText
      });
      setAnalyzed(true);
      toast.success('AI Deep Analysis Complete! 🎯');
    } catch (err) {
      toast.error('AI Engine Error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setAnalyzed(false);
    setResult(null);
    setResumeText('');
    setResumeFile(null);
    setJobDescription('');
    setTargetRole('');
    setShowChat(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-white text-[11px] font-black uppercase tracking-widest mb-8 italic shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              🚀 SCAN PROTOCOL
           </div>
           <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">ATS <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">CHECKER</span></h1>
           <p className="text-lg text-[var(--text-primary)] mt-6 font-medium italic opacity-100 max-w-lg leading-relaxed shadow-sm">"Revealing deep recruitment intelligence through structural AI deconstruction."</p>
        </div>
        <div className="flex gap-6">
           <button onClick={reset} className="px-10 py-5 rounded-2xl border border-[var(--border-color)] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all shadow-xl italic bg-white/5">RESET NODE</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all opacity-40 invisible dark:visible" />
             <label className="block text-primary text-[11px] font-black uppercase tracking-[0.4em] mb-8 opacity-80 italic ml-2">📍 TARGET CONTEXT</label>
             <input 
               type="text" 
               value={targetRole}
               onChange={e => setTargetRole(e.target.value)}
               placeholder="TARGET ROLE (e.g. SR. AI ENGINEER)"
               className="w-full bg-black/5 border border-[var(--border-color)] rounded-[2.5rem] px-8 py-6 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary/50 transition-all font-mono mb-12 placeholder:text-[var(--text-secondary)] placeholder:opacity-30 uppercase tracking-widest italic"
             />

             <div className="bg-black/5 rounded-[3rem] p-3 border border-[var(--border-color)]">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setActiveJdTab('upload')} className={`flex-1 py-4.5 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all italic ${activeJdTab === 'upload' ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-2xl' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>📄 SCAN JD FILE</button>
                  <button onClick={() => setActiveJdTab('paste')} className={`flex-1 py-4.5 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all italic ${activeJdTab === 'paste' ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-2xl' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>📝 INJECT TEXT</button>
                </div>
                <div className="p-6">
                  {activeJdTab === 'upload' ? (
                    <div onClick={() => jdFileInputRef.current?.click()} className="border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] px-8 py-14 text-center cursor-pointer hover:bg-white/5 transition-all group/up shadow-inner bg-black/5">
                      <input type="file" ref={jdFileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleJdFileUpload} />
                      {isJdUploading ? <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-glow" /> : (
                        <div className="space-y-4">
                           <div className="text-5xl mb-4 group-hover/up:scale-110 transition-transform italic">💼</div>
                           <p className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.3em] group-hover/up:text-primary transition-colors italic">{jobDescription ? 'PROTOCOL SYNCED' : 'DROP JOB REQUIREMENTS'}</p>
                           <p className="text-[var(--text-secondary)] text-[10px] font-bold opacity-30 italic uppercase tracking-widest">{jobDescription ? 'RE-UPLOAD TO UPDATE' : 'PDF / DOCX / TEXT'}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="PASTE TARGET REQUIREMENTS..." rows={6} className="w-full bg-transparent border-none focus:ring-0 text-sm text-[var(--text-secondary)] font-mono resize-none leading-relaxed placeholder:opacity-20 italic uppercase tracking-wider" />
                  )}
                </div>
             </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all opacity-40 invisible dark:visible" />
            <div className="flex items-center justify-between mb-10">
               <label className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] italic ml-2">👤 MASTER SEED</label>
               <div className="flex bg-black/5 p-1.5 rounded-[1.5rem] border border-[var(--border-color)]">
                  <button onClick={() => setActiveTab('upload')} className={`px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'upload' ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-lg' : 'text-[var(--text-secondary)]'}`}>FILE</button>
                  <button onClick={() => setActiveTab('paste')} className={`px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'paste' ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-lg' : 'text-[var(--text-secondary)]'}`}>TEXT</button>
               </div>
            </div>

            {activeTab === 'upload' ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] p-16 text-center hover:border-primary/50 transition-all cursor-pointer bg-black/5 group min-h-[300px] flex flex-col items-center justify-center shadow-inner">
                 <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                 <div className="text-8xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform italic">📄</div>
                 <h4 className="text-[var(--text-primary)] font-black text-lg mb-3 tracking-tighter uppercase italic">{resumeFile ? resumeFile.name : 'SELECT RESUME CORE'}</h4>
                 <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">SOURCE MATERIAL REQUIRED</p>
              </div>
            ) : (
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="INJECT RESUME DATA..." rows={14} className="w-full bg-black/5 border border-border rounded-[3rem] px-10 py-8 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary/50 transition-all font-mono resize-none shadow-inner leading-relaxed placeholder:opacity-20 italic uppercase tracking-wider" />
            )}
          </div>

          <button 
            onClick={handleMainAnalyze}
            disabled={isUploading || (activeTab === 'upload' && !resumeFile) || (activeTab === 'paste' && resumeText.length < 50)}
            className="w-full py-8 rounded-[3rem] bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] disabled:opacity-30 disabled:scale-100 italic"
          >
            {isUploading ? 'SYNCHRONIZING TARGETS...' : '🚀 DEPLOY AI DEEP SCAN'}
          </button>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 h-full">
            {!analyzed && !isUploading ? (
              <div className="bg-[var(--bg-card)]/40 border-2 border-[var(--border-color)] border-dashed rounded-[5rem] p-24 flex flex-col items-center justify-center text-center h-full min-h-[750px] group transition-all relative overflow-hidden shadow-inner">
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="w-48 h-48 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[100px] mb-12 group-hover:scale-110 transition-transform shadow-2xl relative z-10 italic grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">🔍</div>
                 <h3 className="text-[var(--text-primary)] font-black text-5xl mb-6 tracking-tighter uppercase leading-[0.9] italic relative z-10">THE DEEP <br /><span className="text-primary">SCAN</span> ENGINE</h3>
                 <p className="text-[var(--text-secondary)] text-2xl max-w-sm leading-relaxed font-medium opacity-60 italic relative z-10">"Provide source credentials to initialize structural AI analysis."</p>
              </div>
            ) : isUploading ? (
              <div className="h-full min-h-[750px] flex items-center justify-center bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[5rem] shadow-inner">
                <AILoadingState message="DECONSTRUCTING TALENT ARCHITECTURE ACROSS RECRUITER VECTORS..." />
              </div>
            ) : (analyzed && result) ? (
              <div className="space-y-12 animate-in slide-in-from-right duration-1000 h-full">
                 <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[5rem] p-16 shadow-2xl h-auto flex flex-col relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -mt-48 -mr-48 opacity-60" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 relative z-10">
                       <div className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-black/5 rounded-[4rem] border border-white/5">
                          <div className="relative group/score">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover/score:opacity-100 transition-opacity" />
                            <svg className="w-44 h-44 -rotate-90 relative z-10" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--border-color)] opacity-10" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${result.score} ${100 - result.score}`} strokeLinecap="round" className={`transition-all duration-1000 ${getScoreColor(result.score)}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                              <span className={`text-6xl font-black tracking-tighter italic ${getScoreColor(result.score)} leading-none`}>{result.score}</span>
                              <span className="text-white font-black text-[10px] uppercase tracking-[0.4em] mt-2 opacity-90 italic">MATCH</span>
                            </div>
                          </div>
                          <div className={`mt-6 text-2xl font-black italic uppercase ${getScoreColor(result.score)}`}>{result.score >= 80 ? 'ELITE' : result.score >= 60 ? 'MARKET READY' : 'REFINING'}</div>
                       </div>

                       <div className="md:col-span-2">
                          <IndustryApplicability score={result.score} breakdown={result.breakdown} />
                       </div>
                    </div>

                    <p className="text-[var(--text-secondary)] text-xl font-medium italic mb-16 leading-relaxed opacity-60 border-l-4 border-primary/20 pl-8 relative z-10">"{result.recommendation || 'Great potential revealed. Structural fine-tuning will maximize recruitment visibility.'}"</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 relative z-10">
                       <div className="bg-black/5 rounded-[4rem] p-12 border border-[var(--border-color)] shadow-inner group/box">
                         <h4 className="text-emerald-400 font-black text-[11px] uppercase tracking-[0.4em] mb-10 px-2 flex items-center justify-between italic">
                           <span>SYNCED STRENGTHS</span>
                           <span className="text-emerald-500/20 text-4xl group-hover/box:scale-125 transition-transform italic">🎯</span>
                         </h4>
                         <ul className="space-y-5">
                           {(result.strengths || []).map((p: string, i: number) => (
                             <li key={i} className="text-[13px] text-[var(--text-secondary)] font-bold bg-[var(--bg-base)]/40 p-5 rounded-[2rem] border border-white/5 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 flex items-center gap-5 italic leading-tight">
                               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                               <span className="opacity-80 uppercase tracking-tight">{p}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-black/5 rounded-[4rem] p-12 border border-[var(--border-color)] shadow-inner group/box-red">
                         <h4 className="text-red-400 font-black text-[11px] uppercase tracking-[0.4em] mb-10 px-2 flex items-center justify-between italic">
                           <span>STRUCTURAL GAPS</span>
                           <span className="text-red-500/20 text-4xl group-hover/box-red:scale-125 transition-transform italic">🧬</span>
                         </h4>
                         <ul className="space-y-5">
                           {(result.weaknesses || []).map((w: string, i: number) => (
                             <li key={i} className="text-[13px] text-[var(--text-secondary)] font-bold bg-[var(--bg-base)]/40 p-5 rounded-[2rem] border border-white/5 transition-all hover:bg-red-500/10 hover:border-red-500/30 flex items-center gap-5 italic leading-tight">
                               <span className="w-1.5 h-1.5 bg-red-500/40 rounded-full flex-shrink-0" />
                               <span className="opacity-80 uppercase tracking-tight">{w}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row gap-6 relative z-10">
                       <button 
                         onClick={() => setShowChat(!showChat)}
                         className={`flex-1 py-6 rounded-[2rem] border font-black text-[11px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4 ${showChat ? 'bg-primary text-white border-primary shadow-[0_10px_30px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                       >
                          {showChat ? '✕ DISCONNECT DIALOGUE' : '💬 COMMUNICATE WITH AI'}
                       </button>
                       <button onClick={() => window.location.href = '/app/builder'} className="flex-1 py-6 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] uppercase tracking-[0.4em] italic">DEPLOY TO BUILDER →</button>
                    </div>
                 </div>

                 {showChat && (
                    <div className="h-[600px]">
                       <ResumeChatWidget 
                         resumeText={result.rawText} 
                         targetRole={targetRole} 
                         onClose={() => setShowChat(false)} 
                       />
                    </div>
                 )}
              </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResumeChecker;
