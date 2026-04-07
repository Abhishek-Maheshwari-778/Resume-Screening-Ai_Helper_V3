import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SECTION_KEYWORDS = ['experience', 'education', 'skills', 'projects', 'certifications', 'summary', 'objective', 'achievements', 'work history'];
const ACTION_VERBS = ['led', 'built', 'developed', 'designed', 'managed', 'created', 'improved', 'implemented', 'launched', 'optimized', 'architected', 'delivered', 'increased', 'reduced', 'achieved'];
const SKILL_KEYWORDS = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'typescript', 'css', 'html', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'linux', 'django', 'fastapi', 'tensorflow', 'pytorch', 'excel', 'tableau', 'power bi', 'machine learning', 'deep learning', 'nlp', 'agile', 'scrum'];

function analyzeResume(text: string) {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sections = SECTION_KEYWORDS.filter(s => lower.includes(s));
  const verbs = ACTION_VERBS.filter(v => lower.includes(v));
  const skills = SKILL_KEYWORDS.filter(s => lower.includes(s));
  const quantified = (text.match(/\d+\s*(%|percent|x|times|years?|months?|\+|k|lakh|cr)/gi) || []).length;
  const hasContact = /\b[\w.-]+@[\w.-]+\.\w+\b/.test(text) || /\b\d{10}\b/.test(text);
  let score = 0;
  const issues: string[] = [];
  const praise: string[] = [];
  if (wordCount >= 300 && wordCount <= 800) { score += 15; praise.push('✅ Good resume length (300–800 words)'); }
  else if (wordCount < 300) { score += 5; issues.push('❌ Resume is too short — aim for at least 300 words'); }
  else { score += 10; issues.push('⚠️ Resume might be too long — consider trimming to under 800 words'); }
  if (sections.length >= 4) { score += 20; praise.push(`✅ ${sections.length} key sections detected`); }
  else { issues.push('⚠️ Missing standard sections — add headers like Experience, Education, Skills'); }
  if (verbs.length >= 5) { score += 20; praise.push('✅ strong action verbs used'); }
  else { issues.push('⚠️ Use more action verbs: Led, Built, Designed'); }
  if (skills.length >= 6) { score += 20; praise.push(`✅ ${skills.length} technical skills detected`); }
  else { issues.push('⚠️ List more technical skills'); }
  if (quantified >= 1) { score += 15; praise.push('✅ Quantified achievements found'); }
  else { issues.push('❌ No measurable results found — add numbers/percentages'); }
  if (hasContact) { score += 10; praise.push('✅ Contact info detected'); }
  else { issues.push('⚠️ Add your email or phone number'); }
  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Work';
  return { score, grade, issues, praise, skills, verbs, wordCount, sections };
}

import IndustryApplicability from '@/components/IndustryApplicability';

const PublicResumeChecker: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [activeJdTab, setActiveJdTab] = useState<'upload' | 'paste'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isJdUploading, setIsJdUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    toast.success(`${file.name} selected! ✨`);
  };

  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsJdUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`${API}/api/ai/extract-text`, { method: 'POST', body: formData });
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
    if (activeTab === 'upload') {
      if (!resumeFile) return toast.error('Please select a resume file first');
      setIsUploading(true);
      setAnalyzed(false);
      const formData = new FormData();
      formData.append('file', resumeFile);
      if (jobDescription) formData.append('job_description', jobDescription);
      if (targetRole) formData.append('target_role', targetRole);
      try {
        const resp = await fetch(`${API}/api/ai/analyze-public`, { method: 'POST', body: formData });
        if (!resp.ok) throw new Error('Analysis failed');
        const data = await resp.json();
        setResult({
          score: data.score,
          breakdown: data.breakdown || {
            Keywords: 70,
            Formatting: 85,
            Structure: 75,
            Readability: 80
          },
          grade: data.score >= 85 ? 'Excellent' : data.score >= 70 ? 'Good' : 'Needs Work',
          praise: data.strengths || [],
          issues: data.weaknesses || [],
          recommendation: data.recommendation,
          name: data.name,
          wordCount: data.word_count || 0,
          skillsCount: data.skills_detected || 0,
          rawText: data.resume_text || '' // Added for context
        });
        setAnalyzed(true);
        toast.success('AI Deep Analysis Complete! ✨');
      } catch (err) {
        toast.error('AI Engine error. Falling back to local check.');
        handleTextAnalyze();
      } finally {
        setIsUploading(false);
      }
    } else {
      if (resumeText.trim().length < 50) return toast.error('Resume text too short');
      setAnalyzed(false);
      const res = analyzeResume(resumeText);
      setResult({ ...res, skillsCount: res.skills.length, rawText: resumeText });
      setAnalyzed(true);
      toast.success('Instant Analysis Complete! 🎯');
    }
  };

  const handleTextAnalyze = () => {
      setAnalyzed(false);
      const res = analyzeResume(resumeText);
      setResult({ 
        ...res, 
        skillsCount: res.skills.length, 
        rawText: resumeText,
        breakdown: {
          Keywords: 60,
          Formatting: 80,
          Structure: 70,
          Readability: 75
        }
      });
      setAnalyzed(true);
  };

  const reset = () => {
    setAnalyzed(false);
    setResult(null);
    setResumeText('');
    setResumeFile(null);
    setJobDescription('');
    setTargetRole('');
  };

  const scoreColor = result
    ? result.score >= 85 ? 'text-emerald-400' : result.score >= 70 ? 'text-blue-400' : result.score >= 50 ? 'text-blue-500' : 'text-red-400'
    : 'text-white';

  return (
    <div className="min-h-screen bg-[#080b12] text-white overflow-x-hidden relative">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
              ✨ Free AI Screening Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              ATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Score Tracker</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={reset} className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all">Clear All</button>
            <Link to="/auth" className="px-6 py-3 rounded-xl bg-white text-black text-xs font-black hover:scale-105 transition-all shadow-2xl">Get Full Analysis →</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#11161d]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold tracking-widest">📍</div>
                  <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Role & Company</h3>
               </div>
               <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target Role..." className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all font-mono mb-6" />
               <div className="bg-black/20 rounded-[2rem] p-1.5 border border-white/5">
                 <div className="flex gap-1 mb-2">
                    <button onClick={() => setActiveJdTab('upload')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeJdTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>📄 JD File</button>
                    <button onClick={() => setActiveJdTab('paste')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeJdTab === 'paste' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>📝 Paste text</button>
                 </div>
                 <div className="p-4">
                  {activeJdTab === 'upload' ? (
                    <div onClick={() => jdFileInputRef.current?.click()} className="border border-dashed border-white/10 rounded-2xl px-6 py-8 text-center cursor-pointer hover:bg-white/5 group">
                        <input type="file" ref={jdFileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleJdFileUpload} />
                        {isJdUploading ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /> : <p className="text-gray-500 text-xs font-bold">{jobDescription ? '✅ JD Loaded' : 'Click to Upload JD'}</p>}
                    </div>
                  ) : <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job requirements..." rows={6} className="w-full bg-transparent border-none focus:ring-0 text-xs text-gray-400 font-mono resize-none" />}
                 </div>
               </div>
            </div>

            <div className="bg-[#11161d]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-sm font-bold tracking-widest">👤</div>
                    <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Resume</h3>
                  </div>
                  <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => setActiveTab('upload')} className={`px-5 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>File</button>
                    <button onClick={() => setActiveTab('paste')} className={`px-5 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'paste' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Text</button>
                  </div>
               </div>
               {activeTab === 'upload' ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 text-center hover:border-blue-500/50 transition-all cursor-pointer bg-black/20 group relative overflow-hidden flex flex-col items-center justify-center min-h-[250px]">
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-500">📁</div>
                  <h4 className="text-white font-black text-lg mb-1">{resumeFile ? resumeFile.name : 'Select Resume'}</h4>
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{resumeFile ? 'Ready to analyze' : 'PDF, DOCX, TXT'}</p>
                </div>
              ) : <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste resume content..." rows={8} className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all font-mono resize-none" />}
            </div>

            <button 
              onClick={handleMainAnalyze}
              disabled={isUploading || (activeTab === 'upload' && !resumeFile) || (activeTab === 'paste' && resumeText.length < 50)}
              className="group w-full py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-500/40 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 relative overflow-hidden"
            >
              {isUploading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
              ) : <>🎯 Analyze Now</>}
            </button>
          </div>

          <div className="lg:col-span-7">
            {!analyzed && !isUploading ? (
              <div className="bg-[#11161d]/40 border border-white/5 border-dashed rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center h-full min-h-[700px] group transition-all">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-7xl mb-8 group-hover:bg-blue-500/5 transition-colors border border-white/5 group-hover:border-blue-500/20">⚖️</div>
                <h3 className="text-white font-black text-2xl mb-4 tracking-tight uppercase">Ready to Scan</h3>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">Ensure you provide both your resume and a target JD for an accurate compatibility score.</p>
              </div>
            ) : (analyzed && result) ? (
              <div className="space-y-10 animate-in slide-in-from-right duration-700">
                <div className="bg-[#11161d]/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-10 mb-10 pb-10 border-b border-white/5">
                    <div className="relative">
                      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${result.score} ${100 - result.score}`} strokeLinecap="round" className={`transition-all duration-1000 ${scoreColor}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={`text-5xl font-black tracking-tighter ${scoreColor}`}>{result.score}</span>
                        <span className="text-gray-600 font-bold text-[8px] uppercase tracking-widest mt-1">Match Rate</span>
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                       <div className={`text-5xl font-black mb-4 tracking-tighter uppercase ${scoreColor}`}>{result.grade}</div>
                       <p className="text-gray-400 text-sm italic mb-4 leading-relaxed max-w-md">"{result.recommendation || 'Excellent compatibility!'}"</p>
                       <Link to="/auth" className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group/lnk">
                          Unlock Deep AI Suggestions <span className="group-hover/lnk:scale-150 transition-transform">→</span>
                       </Link>
                    </div>
                  </div>

                  <div className="mb-10">
                    <IndustryApplicability score={result.score} breakdown={result.breakdown} compact={true} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-emerald-500/5 rounded-[2.5rem] p-8 border border-emerald-500/10 h-full">
                      <h4 className="text-emerald-400 font-black text-[10px] tracking-widest mb-6 uppercase italic">Expert Praise</h4>
                      <div className="space-y-4">
                        {result.praise.slice(0, 2).map((p: string, i: number) => (
                           <p key={i} className="text-gray-300 text-[13px] font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">{p}</p>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-500/5 rounded-[2.5rem] p-8 border border-red-500/10 h-full">
                      <h4 className="text-red-400 font-black text-[10px] tracking-widest mb-6 uppercase italic">Critical Fixes</h4>
                      <div className="space-y-4">
                        {result.issues.slice(0, 2).map((issue: string, i: number) => (
                           <p key={i} className="text-gray-300 text-[13px] font-medium leading-relaxed italic border-l-2 border-red-500/20 pl-4">{issue}</p>
                        ))}
                        <p className="text-gray-500 text-[10px] uppercase font-black opacity-30 mt-4 tabular-nums italic">+ {result.issues.length - 2} High Severity Issues Hidden</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gradient-to-r from-blue-600/20 to-cyan-600/10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                       <span className="text-4xl filter grayscale opacity-20">💬</span>
                       <p className="text-[var(--text-secondary)] text-[11px] font-bold italic tracking-wide opacity-60 leading-relaxed max-w-sm">"Unlock Neural Dialogue to investigate these issues in real-time with our AI engine."</p>
                    </div>
                    <Link to="/auth" className="whitespace-nowrap px-10 py-5 bg-white text-black font-black text-[10px] rounded-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest">Chat with AI Prototype →</Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicResumeChecker;
