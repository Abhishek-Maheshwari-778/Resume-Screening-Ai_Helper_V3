import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ResumeChatWidgetProps {
  resumeText: string;
  targetRole?: string;
  onClose?: () => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResumeChatWidget: React.FC<ResumeChatWidgetProps> = ({ resumeText, targetRole, onClose }) => {
  const { token, user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi ${user?.name || 'there'}! I've analyzed your resume. Ask me anything about it—like "How can I improve my summary?" or "Tell me which skills are missing."` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const resp = await fetch(`${API}/api/ai/chat-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          resume_text: resumeText,
          message: userMsg,
          target_role: targetRole
        })
      });

      if (!resp.ok) throw new Error('AI Protocol Error');
      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      toast.error("Signal Lost. Try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black">AI</div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">NEURAL DIALOGUE</span>
        </div>
        {onClose && <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-[13px] font-medium leading-relaxed italic ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-xl' : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/5'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white/5 border border-white/5 px-5 py-4 rounded-2xl rounded-bl-none">
               <div className="flex gap-1.5 align-center h-4 items-center">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="TYPE FREQUENCY..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs italic font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:opacity-20"
          />
          <button onClick={sendMessage} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-xs hover:scale-110 transition-transform">PROCEED →</button>
        </div>
      </div>
    </div>
  );
};

export default ResumeChatWidget;
