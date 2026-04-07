import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TEMPLATES = [
  { id: 'modern', name: 'Modern Pro', tags: ['ATS-Friendly', 'Tech'], emoji: '💼', colors: 'from-blue-500 to-cyan-500', description: 'Clean, minimal layout with sidebar. Top pick for tech roles.' },
  { id: 'executive', name: 'Executive', tags: ['Corporate', 'Management'], emoji: '👔', colors: 'from-gray-700 to-gray-500', description: 'Formal, traditional header for senior management positions.' },
  { id: 'creative', name: 'Creative', tags: ['Design', 'Marketing'], emoji: '🎨', colors: 'from-violet-500 to-pink-500', description: 'Colorful, visual-heavy layout for creative professionals.' },
  { id: 'minimal', name: 'Minimal', tags: ['Clean', 'ATS-Friendly'], emoji: '⬜', colors: 'from-white/20 to-white/5', description: 'Ultra-clean white layout for maximum ATS compatibility.' },
  { id: 'academic', name: 'Academic', tags: ['Research', 'Scholar'], emoji: '🎓', colors: 'from-emerald-600 to-green-600', description: 'Focused on publications, research, and academic credentials.' },
  { id: 'technical', name: 'Technical', tags: ['Developer', 'Engineer'], emoji: '⚙️', colors: 'from-orange-500 to-red-500', description: 'GitHub-style technical layout with code-font sections.' },
];

const Templates: React.FC = () => {
  const { token } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const applyTemplate = async (templateId: string) => {
    setApplying(true);
    setSelected(templateId);
    try {
      toast.success(`${TEMPLATES.find(t => t.id === templateId)?.name} template selected! Use it in the Resume Builder.`);
      localStorage.setItem('selected_template', templateId);
    } catch { toast.error('Failed'); }
    setApplying(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">
              🎨 VISUAL ARCHETYPES
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">LAYOUT <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">MATRICES</span></h1>
           <p className="text-xl text-[var(--text-secondary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Selecting the optimal structural foundation for your career evolution."</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {TEMPLATES.map(t => (
          <div
            key={t.id}
            onClick={() => applyTemplate(t.id)}
            className={`group/card bg-[var(--bg-card)] border rounded-[4rem] overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-2xl relative flex flex-col h-[600px] ${
              selected === t.id ? 'border-primary/50 ring-4 ring-primary/5' : 'border-[var(--border-color)] hover:border-primary/20'
            }`}
          >
            {/* Preview foundations */}
            <div className={`h-[300px] bg-gradient-to-br ${t.colors} relative flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
              <div className="relative z-10 text-center animate-in zoom-in duration-700">
                <div className="text-8xl mb-4 group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform italic drop-shadow-2xl">{t.emoji}</div>
                <div className="text-white font-black text-3xl tracking-tighter uppercase italic drop-shadow-xl">{t.name}</div>
              </div>
              
              {selected === t.id && (
                <div className="absolute top-8 right-8 w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center shadow-2xl animate-in fade-in zoom-in duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-12 flex flex-col flex-1 relative overflow-hidden bg-black/5">
              <div className="absolute top-0 right-0 p-8 text-primary/10 text-6xl font-black italic select-none pointer-events-none group-hover/card:scale-125 transition-transform">{t.id.toUpperCase().slice(0, 4)}</div>
              
              <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {t.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full bg-[var(--bg-base)]/60 text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-[0.2em] border border-[var(--border-color)] italic">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-[var(--text-secondary)] text-lg font-medium italic opacity-60 leading-relaxed mb-10 relative z-10">"{t.description}"</p>
              
              <div className="mt-auto relative z-10">
                <button
                  className={`w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic shadow-xl ${
                    selected === t.id
                      ? 'bg-primary text-[var(--bg-base)]'
                      : 'bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-color)] group-hover/card:bg-[var(--text-primary)] group-hover/card:text-[var(--bg-base)]'
                  }`}
                >
                  {selected === t.id ? '✓ CORE SELECTED' : 'DEPLOY MATRIX'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
