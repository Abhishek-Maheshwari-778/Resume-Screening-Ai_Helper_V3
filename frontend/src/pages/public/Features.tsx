import React from 'react';

const Features: React.FC = () => {
  const sections = [
    {
      category: 'For Candidates',
      icon: '👤',
      color: 'from-blue-400 to-cyan-400',
      items: [
        { title: 'AI Bullet Points', text: 'Generate high-impact, professional bullets with Groq Llama 3.' },
        { title: 'Keyword Optimization', text: 'DeepSeek analyzes missing keywords against target job descriptions.' },
        { title: 'ATS Score Check', text: 'Instant feedback on formatting, structure, and readability.' },
        { title: 'Smart PDF Export', text: 'Perfectly formatted ATS-friendly templates using WeasyPrint.' },
      ]
    },
    {
      category: 'For Employers',
      icon: '🏢',
      color: 'from-emerald-400 to-green-400',
      items: [
        { title: 'Bulk Screening', text: 'Analyze hundreds of resumes in seconds with our parallel NLP pipeline.' },
        { title: 'TF-IDF Ranking', text: 'Advanced similarity scoring using scikit-learn cosine matrices.' },
        { title: 'AI Match Summaries', text: 'Get concise applicant summaries instead of reading full documents.' },
        { title: 'Candidate Matrix', text: 'Compare top applicants side-by-side with skill-gap analysis.' },
      ]
    },
    {
      category: 'Enterprise Tech',
      icon: '⚙️',
      color: 'from-violet-400 to-purple-400',
      items: [
        { title: 'spaCy NER Dictionary', text: 'Custom Python NLP dictionary for precision skill extraction.' },
        { title: 'FastAPI Backend', text: 'Lightning-fast asynchronous operations for zero-latency analysis.' },
        { title: 'Role-Based Auth', text: 'Secure JWT authentication for Candidates, HR, and Admins.' },
        { title: 'Docker Architecture', text: 'Ready for production-grade scaling on AWS, Azure, or GCP.' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <div className="mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary border-2 border-primary/50 text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_10px_30px_rgba(34,211,238,0.3)]">
            🛠️ CORE CAPABILITIES
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] mb-8 tracking-tighter uppercase leading-[0.95] italic">
            NEXT-GEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-black">NEURAL ENGINE</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium italic opacity-90 leading-relaxed shadow-sm">
            "Engineered for sub-second precision. Explore the sophisticated algorithms that fuel the world's most advanced career intelligence portal."
          </p>
        </div>

        <div className="space-y-32">
          {sections.map((section, s_idx) => (
            <div key={s_idx}>
              <div className="flex items-center gap-8 mb-16">
                <div className={`h-[2px] flex-1 bg-gradient-to-r ${section.color} opacity-40`} />
                <div className="flex items-center gap-4">
                  <span className="text-4xl group-hover:rotate-12 transition-transform">{section.icon}</span>
                  <h2 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${section.color} uppercase tracking-[0.3em] italic`}>
                    {section.category}
                  </h2>
                </div>
                <div className={`h-[2px] flex-1 bg-gradient-to-l ${section.color} opacity-10`} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map((item, i_idx) => (
                  <div key={i_idx} className="bg-[var(--bg-card)]/80 backdrop-blur-3xl border border-[var(--border-color)] p-10 rounded-[3rem] hover:border-primary/40 transition-all text-left relative overflow-hidden group h-full flex flex-col shadow-2xl">
                    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${section.color} opacity-10 group-hover:opacity-100 transition-opacity`} />
                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 group-hover:text-primary transition-colors italic leading-none">{item.title}</h3>
                    <p className="text-[var(--text-primary)] text-[13px] leading-relaxed font-medium flex-1 italic opacity-90">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
