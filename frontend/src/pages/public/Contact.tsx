import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', subject: 'General Inquiry' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Message sent! Our AI team will reach out shortly. 🚀');
    setForm({ name: '', email: '', message: '', subject: 'General Inquiry' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden flex items-center justify-center transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      <div className="max-w-7xl w-full px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        
        <div className="text-left space-y-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary border-2 border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(34,211,238,0.3)]">
            🚀 DIRECT PROTOCOL
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--text-primary)] mb-8 tracking-tighter uppercase leading-[0.95] italic">
            INITIALIZE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">SYNC</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium italic opacity-60 leading-relaxed max-w-sm">
            "Whether you require granular support or a custom enterprise-grade deployment — our team is on standby to assist your evolution."
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-12 transition-transform">📧</div>
              <div>
                <div className="text-white font-black text-[11px] uppercase tracking-[0.2em] opacity-80">Intelligence Sync</div>
                <div className="text-[var(--text-primary)] text-lg font-black tracking-tight italic">support@resumiai.com</div>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-12 transition-transform">🏢</div>
              <div>
                <div className="text-white font-black text-[11px] uppercase tracking-[0.2em] opacity-80">Enterprise Matrix</div>
                <div className="text-[var(--text-primary)] text-lg font-black tracking-tight italic">sales@resumiai.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)]/80 backdrop-blur-3xl border border-[var(--border-color)] rounded-[4rem] p-12 md:p-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-20 -mr-40 -mt-40 group-hover:bg-primary/10 transition-all" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Identity</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary/50 transition-all font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Communication</label>
                <input
                  type="email"
                  required
                  placeholder="name@nexus.com"
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary/50 transition-all font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Target Protocol</label>
              <select 
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary/50 transition-all font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] appearance-none"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Pro Plan Access">Pro Plan Access (₹9)</option>
                <option value="Enterprise Solution">Enterprise Matrix (Built for You)</option>
                <option value="Bug Report">Intelligence Core Bug</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Intelligence Brief</label>
              <textarea
                required
                rows={4}
                placeholder="How can we assist your evolution today?"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary/50 transition-all font-mono font-bold resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[11px] uppercase tracking-[0.3em] py-6 px-10 rounded-2xl transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Initializing Transmission...' : 'Transmit Sequence →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
