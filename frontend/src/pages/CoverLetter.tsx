import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const tones = ['Professional', 'Enthusiastic', 'Concise', 'Creative'];

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CoverLetter: React.FC = () => {
  const { token } = useAuthStore();
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('Professional');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // UX-16 FIX: Was using a hardcoded fake template — now calls real /api/ai/cover-letter endpoint
  const generate = async () => {
    if (!resumeText || !jobDesc) return;
    setLoading(true);
    setError('');

    try {
      const toneNote = tone !== 'Professional' ? ` Use a ${tone.toLowerCase()} tone.` : '';
      const jobTitle = role ? `${role}${company ? ` at ${company}` : ''}` : '';

      const resp = await fetch(`${API}/api/ai/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDesc + toneNote,
          job_title: jobTitle,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate cover letter');
      }

      const data = await resp.json();
      setLetter(data.cover_letter || '');
      toast.success('Cover letter generated! ✉️', {
        style: { background: '#111420', color: '#fff', borderRadius: '12px' },
      });
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${role || 'application'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">✉️ Cover Letter Generator</h1>
        <p className="text-gray-400">
          Generate a tailored, professional cover letter powered by Groq AI in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Role / Position
              </label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Tone
            </label>
            <div className="flex gap-2 flex-wrap">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tone === t
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-[#0d1117] border border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Resume (paste text) <span className="text-red-400">*</span>
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={5}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              rows={5}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || !resumeText || !jobDesc}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating with Groq AI...
              </>
            ) : (
              '✨ Generate Cover Letter'
            )}
          </button>
        </div>

        {/* Output */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              Generated Cover Letter
              {letter && (
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  AI Generated
                </span>
              )}
            </h3>
            {letter && (
              <div className="flex gap-2">
                <button
                  onClick={download}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  📥 Download
                </button>
                <button
                  onClick={copy}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            )}
          </div>
          {letter ? (
            <pre className="flex-1 text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-[#0d1117] rounded-xl p-5 border border-gray-700 overflow-auto">
              {letter}
            </pre>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600">
              <div>
                <div className="text-5xl mb-4 opacity-50">✉️</div>
                <p className="text-sm font-medium mb-1 text-gray-500">Your cover letter will appear here</p>
                <p className="text-xs text-gray-600">Fill in your resume, job description, and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
