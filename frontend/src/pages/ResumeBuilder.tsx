import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Section {
  type: string;
  content: string;
}

const SECTION_TYPES = ['Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications', 'Achievements'];

const ResumeBuilder: React.FC = () => {
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');

  const [title, setTitle] = useState('My Resume');
  const [targetRole, setTargetRole] = useState('');
  const [sections, setSections] = useState<Section[]>([
    { type: 'Summary', content: '' },
    { type: 'Experience', content: '' },
    { type: 'Education', content: '' },
    { type: 'Skills', content: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('selected_template');
    if (t) setSelectedTemplate(t);

    if (resumeId) {
      loadResume();
    } else if (searchParams.get('mode') === 'ai_import') {
      const improved = localStorage.getItem('ai_improved_resume');
      if (improved) {
        setSections([{ type: 'Summary', content: improved }]);
        toast.success('AI Optimized Resume Imported! ✨');
        localStorage.removeItem('ai_improved_resume');
      }
    }
  }, [resumeId, searchParams]);

  const loadResume = async () => {
    setFetching(true);
    try {
      const resp = await fetch(`${API}/api/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Failed to load resume');
      const data = await resp.json();
      setTitle(data.title || 'Untitled Resume');
      setTargetRole(data.target_role || '');
      
      if (data.sections && typeof data.sections === 'object') {
        const newSections: Section[] = [];
        Object.entries(data.sections).forEach(([k, v]) => {
          if (v && typeof v === 'string') {
            const type = k.charAt(0).toUpperCase() + k.slice(1);
            newSections.push({ type, content: v });
          }
        });
        if (newSections.length > 0) setSections(newSections);
      } else if (data.content) {
        // Fallback: If no structured sections, put everything in Summary or split by lines
        setSections([{ type: 'Summary', content: data.content }]);
      }
      toast.success('Resume loaded successfully! ✨');
    } catch (err: any) {
      console.error("Load Error:", err);
      toast.error('Could not load resume data. Try refreshing.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch(`${API}/api/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!resp.ok) throw new Error('Upload failed');
      const data = await resp.json();
      
      if (data.sections && typeof data.sections === 'object') {
        const newSections: Section[] = [];
        Object.entries(data.sections).forEach(([key, content]) => {
          if (content && typeof content === 'string') {
            const type = key.charAt(0).toUpperCase() + key.slice(1);
            newSections.push({ type, content });
          }
        });
        if (newSections.length > 0) {
          setSections(newSections);
          toast.success('Imported successfully! ✨');
        } else {
          toast.error('AI could not identify sections. Try another file.');
        }
      } else if (data.raw_text) {
        setSections([{ type: 'Summary', content: data.raw_text }]);
        toast.success('Imported as raw text ✨');
      }
    } catch (err) {
      toast.error('Failed to parse resume. Use simple text/PDF.');
    } finally {
      setUploading(false);
    }
  };

  const updateSection = (idx: number, content: string) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, content } : s));
  };

  const addSection = (type: string) => {
    if (sections.find(s => s.type === type)) {
      toast.error(`${type} section already added`);
      return;
    }
    setSections(prev => [...prev, { type, content: '' }]);
  };

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const generateWithAI = async (idx: number) => {
    const section = sections[idx];
    if (!targetRole) { toast.error('Set target role first'); return; }

    setAiLoading(section.type);
    try {
      const resp = await fetch(`${API}/api/ai/build-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          section_type: section.type,
          context: section.content || `Experienced professional targeting ${targetRole}`,
          target_role: targetRole,
        }),
      });
      if (!resp.ok) throw new Error('AI generation failed');
      const data = await resp.json();
      updateSection(idx, data.content || '');
      toast.success(`${section.type} generated by AI ✨`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiLoading(null);
    }
  };

  const rewriteSection = async (idx: number) => {
    const section = sections[idx];
    if (!section.content.trim()) { toast.error('Add some content first'); return; }

    setAiLoading(`rewrite-${section.type}`);
    try {
      const resp = await fetch(`${API}/api/ai/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bullet_point: section.content, target_role: targetRole }),
      });
      if (!resp.ok) throw new Error('Rewrite failed');
      const data = await resp.json();
      updateSection(idx, data.rewritten || section.content);
      toast.success('Section rewritten with AI ✨');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiLoading(null);
    }
  };

  const saveResume = async () => {
    if (!title || sections.every(s => !s.content.trim())) {
      toast.error('Add some content before saving');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          target_role: targetRole,
          sections: Object.fromEntries(sections.map(s => [s.type.toLowerCase(), s.content])),
          content: sections.map(s => `${s.type}:\n${s.content}`).join('\n\n'),
        }),
      });
      if (!resp.ok) throw new Error('Save failed');
      toast.success('Resume saved! 🎉');
      setSaved(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sectionIcons: Record<string, string> = {
    Summary: '📋', Experience: '💼', Education: '🎓',
    Skills: '🧠', Projects: '🚀', Certifications: '🏆', Achievements: '⭐',
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
           <div className="flex items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                 🏗️ RESUME ARCHITECTURE
              </div>
              {selectedTemplate && (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                   🧬 {selectedTemplate.toUpperCase()} MATRIX
                </div>
              )}
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">NEURAL <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">CONSTRUCT</span></h1>
           <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Synthesizing your professional narrative through high-valence AI layers."</p>
        </div>
        <div className="flex gap-6">
           <button 
             onClick={saveResume} 
             disabled={loading}
             className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] italic"
           >
             {loading ? 'ARCHIVING...' : '💾 PERSIST MATRIX'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Configuration */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-12">
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all opacity-40 invisible dark:visible" />
            <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 italic ml-2">📍 SOURCE IDENTITY</h3>
            
            <div className="space-y-10">
              <div>
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] block mb-4 opacity-40 italic ml-1">RESUME TITLE</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-base)]/40 border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono uppercase tracking-widest italic shadow-inner"
                  placeholder="e.g. SR. DEV 2024"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] block mb-4 opacity-40 italic ml-1">TARGET ROLE</label>
                <input
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full bg-[var(--bg-base)]/40 border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono uppercase tracking-widest italic shadow-inner"
                  placeholder="e.g. AI ARCHITECT"
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[4rem] p-12 flex flex-col items-center text-center group hover:bg-emerald-500/10 transition-all shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-20 h-20 rounded-3xl bg-[var(--bg-base)] border border-[var(--border-color)] flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-2xl relative z-10">
               {uploading ? '⏳' : '📤'}
             </div>
             <h4 className="text-[var(--text-primary)] text-2xl font-black mb-2 tracking-tighter uppercase italic relative z-10">SMART SEED</h4>
             <p className="text-[var(--text-secondary)] text-[11px] font-bold opacity-40 italic uppercase tracking-[0.2em] mb-10 relative z-10 leading-relaxed">"DECONSTRUCT PRE-EXISTING NODES INSTANTLY"</p>
             <label className="cursor-pointer w-full py-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_15px_40px_rgba(16,185,129,0.3)] italic relative z-10 text-center">
               {uploading ? 'SYNTHESIZING...' : 'UPLOAD SOURCE'}
               <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" disabled={uploading} />
             </label>
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <h4 className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-40 italic ml-2">➕ ADD LAYER</h4>
            <div className="flex flex-wrap gap-4">
              {SECTION_TYPES.filter(t => !sections.find(s => s.type === t)).map(t => (
                <button
                  key={t}
                  onClick={() => addSection(t)}
                  className="px-6 py-3.5 rounded-xl text-[9px] font-black text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-all uppercase tracking-[0.2em] italic"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sections List */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-12">
          {fetching ? (
            <div className="py-40 flex items-center justify-center">
               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right duration-1000">
              {sections.map((section, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4.5rem] overflow-hidden transition-all hover:border-primary/40 shadow-2xl relative group/section">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40 opacity-40 group-hover/section:bg-primary/10 transition-all invisible dark:visible" />
                  
                  {/* Section header */}
                  <div className="flex items-center justify-between px-12 py-10 border-b border-[var(--border-color)] bg-black/5 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover/section:scale-110 transition-transform italic">
                        {sectionIcons[section.type] || '📌'}
                      </div>
                      <span className="text-[var(--text-primary)] font-black text-3xl tracking-tighter uppercase italic">{section.type}</span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => generateWithAI(idx)}
                        disabled={!!aiLoading}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-30 italic shadow-lg"
                      >
                        {aiLoading === section.type ? '⏳' : '✨ SYNTHESIZE'}
                      </button>
                      <button
                        onClick={() => rewriteSection(idx)}
                        disabled={!!aiLoading}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 italic shadow-lg"
                      >
                        {aiLoading === `rewrite-${section.type}` ? '⏳' : '🔁 DEEP REFINE'}
                      </button>
                      <button
                        onClick={() => removeSection(idx)}
                        className="w-12 h-12 flex items-center justify-center text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-12 relative z-10">
                    <textarea
                      value={section.content}
                      onChange={e => updateSection(idx, e.target.value)}
                      rows={6}
                      placeholder={`INJECT ${section.type.toUpperCase()} DATA HERE...`}
                      className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] placeholder:opacity-20 text-lg focus:outline-none resize-none leading-[1.8] font-medium italic scrollbar-hide"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {saved && (
            <div className="p-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-[3rem] text-sm font-black uppercase tracking-[0.2em] text-center shadow-2xl shadow-emerald-500/10 animate-in zoom-in duration-500 italic">
              ✅ PERSISTANCE COMPLETE! | <a href="/app/resumes" className="underline hover:text-white transition-colors cursor-pointer">ACCESS VAULT →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
