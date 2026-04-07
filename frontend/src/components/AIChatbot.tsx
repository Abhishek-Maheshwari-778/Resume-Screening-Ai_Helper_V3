import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Initialize Protocol. How can I optimize your career vectors today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user, token } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const resp = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query: userMsg,
          history: messages.slice(-10) 
        })
      });

      if (!resp.ok) throw new Error('Neural Link Interrupted');
      
      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err: any) {
      toast.error("AI Signal Lost");
      setMessages(prev => [...prev, { role: 'ai', text: "Protocol Error. Please re-initialize connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto mb-6 w-[22rem] sm:w-[26rem] h-[32rem] bg-[#0d1117]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 scale-100">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-xl shadow-lg shadow-primary/20">🤖</div>
              <div>
                <div className="text-white font-black text-xs uppercase tracking-widest leading-none">Neural Assistant</div>
                <div className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  Active Matrix
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-[13px] font-medium leading-relaxed italic ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-xl' 
                    : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 px-5 py-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1.5 align-center h-4 items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-black/40 border-t border-white/5">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="TYPE FREQUENCY..."
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-20"
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-primary/20"
              >
                🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[0_20px_60px_rgba(34,211,238,0.4)] transition-all hover:scale-110 active:scale-90 relative overflow-hidden group ${
          isOpen ? 'bg-red-500 rotate-[360deg]' : 'bg-primary'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
};

export default AIChatbot;
