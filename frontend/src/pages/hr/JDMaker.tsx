import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import AILoadingState from '@/components/AILoadingState';

const JDMaker: React.FC = () => {
  const { token } = useAuthStore();
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [tone, setTone] = useState('Professional & Modern');
  const [generatedJd, setGeneratedJd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleGenerate = async () => {
    if (!role) return toast.error('Role is required');
    setIsGenerating(true);
    try {
      const resp = await fetch(`${API}/api/ai/generate-jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, skills, experience, tone })
      });
      if (!resp.ok) throw new Error('Generation failed');
      const data = await resp.json();
      setGeneratedJd(data.jd);
      toast.success('JD Synthesized Successfully! 🚀');
    } catch (err) {
      toast.error('AI Protocol Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!chatMessage.trim()) return;
    setIsRefining(true);
    try {
       const resp = await fetch(`${API}/api/ai/chat-resume`, { // Using chat-resume logic for JD refinement
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            resume_text: generatedJd,
            message: `REFINE THIS JD BASED ON THIS SESSION: ${chatMessage}`,
            context: "JD_MAKER"
          })
       });
       if (!resp.ok) throw new Error('Refinement failed');
       const data = await resp.json();
       setGeneratedJd(data.response);
       setChatMessage('');
       toast.success('JD Refined! ✨');
    } catch (err) {
       toast.error('Refinement error');
    } finally {
       setIsRefining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12 mb-20">
        <div>
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/50 text-white text-[11px] font-black uppercase tracking-widest mb-8 italic shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              💼 HR PROTOCOL
           </div>
           <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-[0.9] italic">JD <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">SYNTHESIZER</span></h1>
           <p className="text-lg text-[var(--text-primary)] mt-6 font-medium italic opacity-60 max-w-lg leading-relaxed">"Architecting structural job requirements through neural synthesis."</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-12 xl:col-span-5 space-y-10">
           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
              <label className="block text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-80 italic ml-2">📍 CORE PARAMETERS</label>
              
              <div className="space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-gray-500 mb-3 ml-2 uppercase italic">Target Role</label>
                   <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Backend Architect" className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-mono uppercase tracking-widest italic" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 mb-3 ml-2 uppercase italic">Required Expertise (Skills)</label>
                   <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, AWS, Distributed Systems..." className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-mono italic" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 mb-3 ml-2 uppercase italic">Experience Spectrum</label>
                   <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="5-8 Years" className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-mono italic" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 mb-3 ml-2 uppercase italic">Voice & Tone</label>
                   <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-mono italic uppercase tracking-widest">
                      <option>Professional & Modern</option>
                      <option>Aggressive & High-Growth</option>
                      <option>Academic & Scientific</option>
                      <option>Friendly & Community-Centric</option>
                   </select>
                </div>
              </div>

              <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-12 py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl italic disabled:opacity-30">
                {isGenerating ? 'SYNTHESIZING...' : '🚀 DEPLOY JD GENERATOR'}
              </button>
           </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 h-full min-h-[700px]">
           {!generatedJd && !isGenerating ? (
             <div className="bg-[var(--bg-card)]/40 border-2 border-[var(--border-color)] border-dashed rounded-[5rem] p-24 flex flex-col items-center justify-center text-center h-full min-h-[700px] group transition-all relative overflow-hidden shadow-inner">
                <div className="w-48 h-48 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[100px] mb-12 group-hover:scale-110 transition-transform shadow-2xl relative z-10 italic grayscale opacity-20 group-hover:opacity-100 group-hover:grayscale-0 transition-all">📄</div>
                <h3 className="text-[var(--text-primary)] font-black text-4xl mb-6 tracking-tighter uppercase leading-[0.9] italic relative z-10">SPECIFICATION <br /><span className="text-primary">VAULT</span></h3>
                <p className="text-[var(--text-secondary)] text-xl max-w-sm leading-relaxed font-medium opacity-40 italic relative z-10">"Define parameters to synthesize professional job requirements."</p>
             </div>
           ) : isGenerating ? (
             <div className="h-full min-h-[700px] flex items-center justify-center bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[5rem] shadow-inner">
                <AILoadingState message="COLLECTING INDUSTRIAL VECTORS & SYNTHESIZING JD..." />
             </div>
           ) : (
             <div className="space-y-10 animate-in slide-in-from-right duration-1000">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                   <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                      <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">SYNTHESIZED MATRIX</h4>
                      <button onClick={() => setShowChat(!showChat)} className="text-white text-[9px] font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all italic">💬 REFINE WITH AI</button>
                   </div>
                   
                   <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-li:text-gray-400 prose-headings:text-white prose-p:italic prose-li:italic prose-p:leading-relaxed">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300 bg-black/20 p-8 rounded-3xl border border-white/5">
                        {generatedJd}
                      </pre>
                   </div>
                </div>

                {showChat && (
                  <div className="bg-[#0d1117] border border-primary/20 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-black">AI</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">NEURAL REFINEMENT MODE</span>
                    </div>
                    <div className="relative">
                      <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRefine()} placeholder="e.g. Add more focus on Kubernetes expertise..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm italic text-white focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-20" />
                      <button onClick={handleRefine} disabled={isRefining} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-30">
                        {isRefining ? 'SYNCHRONIZING...' : 'UPGRADE →'}
                      </button>
                    </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default JDMaker;
