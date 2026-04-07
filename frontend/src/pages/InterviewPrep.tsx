import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import AILoadingState from '@/components/AILoadingState';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Question {
  type: 'behavioral' | 'technical';
  question: string;
  expert_sample: string;
}

const InterviewPrep: React.FC = () => {
  const { token } = useAuthStore();
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateInterview = async () => {
    if (!role.trim()) return toast.error('Please specify the target role');
    setLoading(true);
    setQuestions(null);
    try {
      const resp = await fetch(`${API}/api/ai/generate-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, jd })
      });
      if (!resp.ok) throw new Error('Failed to generate interview prep');
      const data = await resp.json();
      
      setQuestions(data);
      setActiveIdx(0);
      toast.success('AI Interview Coach Ready! 🎤');
    } catch (err) {
      toast.error('AI Prep failed. Try again soon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">🎤 AI Interview Coach</h1>
          <p className="text-gray-500 text-sm mt-1">Practice for specific roles with AI-driven behavioral & technical prep.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">Shadow Mode Active</div>
      </div>

      {!questions ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
           <div className="lg:col-span-7">
              <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20" />
                 <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Setup Your Session</h3>
                 
                 <div className="space-y-6">
                    <div>
                       <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-2">Target Position</label>
                       <input 
                         type="text" 
                         value={role}
                         onChange={e => setRole(e.target.value)}
                         placeholder="e.g. Senior Software Engineer"
                         className="w-full bg-black/20 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                       />
                    </div>
                    <div>
                       <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-2">Job Context (Optional)</label>
                       <textarea 
                         rows={5}
                         value={jd}
                         onChange={e => setJd(e.target.value)}
                         placeholder="Paste the Job Description for better questions..."
                         className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono resize-none"
                       />
                    </div>
                    <button 
                      onClick={generateInterview}
                      disabled={loading}
                      className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-500/20 disabled:opacity-30"
                    >
                       {loading ? 'AI Intelligence Loading...' : '🎯 Generate Mock Interview'}
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="lg:col-span-5 text-center px-8">
              <div className="text-7xl mb-8">🤖</div>
              <h4 className="text-white font-black text-xl mb-4 tracking-tighter uppercase">AI Shadow Coach</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-0 font-medium">Get ready for real scenarios. Our AI generates questions based on your specific resume content and the job requirements simultaneously.</p>
           </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom duration-700">
           {loading && <AILoadingState message="Tailoring your interview roadmap..." />}
           
           <div className="bg-[#161b22] border border-white/10 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden text-center min-h-[500px] flex flex-col justify-center">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 text-gray-600 text-[10px] font-black uppercase tracking-widest">Question {activeIdx + 1} of {questions.length}</div>
              
              <div className="text-blue-400 font-black text-[9px] uppercase tracking-[0.4em] mb-8">{questions[activeIdx].type}</div>
              <h2 className="text-white font-black text-2xl md:text-3xl mb-12 tracking-tight leading-tight max-w-2xl mx-auto">"{questions[activeIdx].question}"</h2>
              
              {showAnswer && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] mb-12 max-w-xl mx-auto text-left animate-in zoom-in-95">
                   <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-3">AI Expert Guidance</p>
                   <p className="text-gray-400 text-sm italic font-medium">"{questions[activeIdx].expert_sample}"</p>
                </div>
              )}

              <div className="flex justify-center flex-wrap gap-4 mt-8">
                 <button onClick={() => setShowAnswer(!showAnswer)} className="px-8 py-3.5 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                    {showAnswer ? 'Hide Guidance' : '💡 Show Guidance'}
                 </button>
                 <button 
                   onClick={() => { setActiveIdx((activeIdx + 1) % questions.length); setShowAnswer(false); }}
                   className="px-8 py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/10"
                 >
                    Next Question →
                 </button>
              </div>
           </div>

           <div className="mt-12 text-center">
              <button onClick={() => setQuestions(null)} className="text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Restart Session</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
