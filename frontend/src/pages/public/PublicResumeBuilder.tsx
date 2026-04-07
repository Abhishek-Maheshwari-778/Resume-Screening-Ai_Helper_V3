import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, minimal design. Perfect for tech roles.',
    color: 'from-blue-500 to-cyan-500',
    icon: '💻',
    preview: ['Full Name', '📧 email@email.com  |  📞 +91 98765 43210  |  🔗 linkedin.com/in/name', '━━━━━━━━━━━━━━━━━━━━━', 'EXPERIENCE', '  Software Engineer — TechCorp (2022–Present)', '  • Led development of 3 core product features', 'SKILLS', '  React, TypeScript, Node.js, AWS'],
    tags: ['Tech', 'Engineering', 'IT', 'Software'],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional format. Best for corporate and finance roles.',
    color: 'from-violet-500 to-purple-500',
    icon: '🏛️',
    preview: ['FULL NAME', 'City | Email | Phone | LinkedIn', '─────────────────────────', 'PROFESSIONAL SUMMARY', '  Results-driven professional with 5+ years...', 'WORK EXPERIENCE', '  Senior Manager — CongloCorp (2020–Present)', '    • Managed cross-functional team of 12'],
    tags: ['Finance', 'Management', 'Consulting', 'Corporate'],
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and eye-catching. Great for design and marketing.',
    color: 'from-pink-500 to-rose-500',
    icon: '🎨',
    preview: ['[ Full Name ]', '─── Designer & Creative Director ───', 'Contact: portfolio.com | hi@email.com', '', 'ABOUT ME', '"I design experiences, not just visuals."', 'SELECTED WORK', '  Brand Identity — StartupXYZ (2023)'],
    tags: ['Design', 'Marketing', 'Media', 'Creative'],
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'Minimal and clean. Works well with all ATS systems.',
    color: 'from-emerald-500 to-green-500',
    icon: '📄',
    preview: ['Full Name', 'Email | Phone | Location', '', 'Education', '  B.Tech Computer Science — BITS Pilani (2021)', '', 'Skills', '  Python, SQL, Machine Learning, Excel', '', 'Projects', '  Customer Churn Predictor (Accuracy: 94%)'],
    tags: ['Fresher', 'Entry Level', 'Any Industry'],
  },
];

const steps = [
  {
    step: '01',
    title: 'Contact Information',
    description: 'Start with your full name, professional email, phone number, city, and LinkedIn/GitHub URL.',
    tip: 'Use a professional email like name@gmail.com, not coolkid99@email.com',
    icon: '📋',
  },
  {
    step: '02',
    title: 'Professional Summary',
    description: '3–4 lines summarizing who you are, your experience, and what you bring to the table.',
    tip: 'Write this LAST — after you\'ve written everything else, summarize it.',
    icon: '✍️',
  },
  {
    step: '03',
    title: 'Work Experience',
    description: 'List jobs in reverse chronological order. For each role: Title, Company, Date Range, and 3–5 bullet points.',
    tip: 'Each bullet point should start with an action verb: Led, Built, Increased, Optimized...',
    icon: '💼',
  },
  {
    step: '04',
    title: 'Education',
    description: 'Include your degree, institution, graduation year, and relevant coursework or GPA (if above 7.5).',
    tip: 'For experienced professionals, keep this section short — 2–3 lines.',
    icon: '🎓',
  },
  {
    step: '05',
    title: 'Skills',
    description: 'List technical skills, tools, and soft skills. Group them by category for clarity.',
    tip: 'Include keywords from the job description you\'re applying to — ATS scans for these.',
    icon: '🧠',
  },
  {
    step: '06',
    title: 'Projects & Certifications',
    description: 'Add 2–3 relevant projects with tech stack and impact. Include certifications with dates.',
    tip: 'Link to GitHub/live demos — it shows real initiative and proves your work.',
    icon: '🚀',
  },
];

const PublicResumeBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            🆓 Free Resume Guide — No Account Needed
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Build a Winning Resume</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow our step-by-step guide, pick a template, and use our AI builder to create an ATS-optimized resume in minutes.
          </p>
        </div>

        {/* Template Selector */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">Step 1 — Choose a Template Style</h2>
          <p className="text-gray-400 text-sm mb-8">Pick the style that matches your industry. You can change templates anytime in the full builder.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`cursor-pointer bg-[#0d1117] border rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${selectedTemplate === t.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-800 hover:border-gray-600'}`}
              >
                {/* Preview */}
                <div className={`bg-gradient-to-br ${t.color} p-0.5`}>
                  <div className="bg-[#0a0d14] p-4 font-mono text-[9px] text-gray-300 leading-relaxed min-h-[140px]">
                    {t.preview.map((line, i) => (
                      <div key={i} className={i === 0 ? 'text-white font-bold text-[10px]' : 'text-gray-400'}>{line || <br />}</div>
                    ))}
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{t.icon}</span>
                    <span className="font-semibold text-white">{t.name}</span>
                    {selectedTemplate === t.id && <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Selected</span>}
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{t.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">Step 2 — Build Section by Section</h2>
          <p className="text-gray-400 text-sm mb-8">Click any section to learn exactly what to write. Follow this order for the best ATS performance.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                className={`text-left bg-[#0d1117] border rounded-2xl p-6 transition-all hover:border-gray-600 ${activeStep === i ? 'border-blue-500/60 bg-blue-900/10' : 'border-gray-800'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${activeStep === i ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-600 text-xs font-mono">{s.step}</span>
                      <span className="text-white font-semibold text-sm">{s.title}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{s.description}</p>

                    {activeStep === i && (
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/20 rounded-xl px-4 py-3">
                        <span className="text-yellow-400 text-xs font-semibold">💡 Pro Tip:</span>
                        <p className="text-yellow-200/80 text-xs mt-1">{s.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA: Start Building with AI */}
        <section className="bg-gradient-to-br from-blue-900/50 to-violet-900/30 border border-blue-500/20 rounded-3xl p-10 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Let AI Write It For You
          </h2>
          <p className="text-gray-300 text-lg mb-4 max-w-xl mx-auto">
            Sign up free and use our Groq-powered AI builder to generate bullet points, rewrite weak sentences, and score your resume — all in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              to="/auth"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
            >
              🚀 Start Building Free
            </Link>
            <Link
              to="/check"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-base hover:bg-white/10 transition-all"
            >
              🎯 Check My Existing Resume
            </Link>
          </div>
          <p className="text-gray-500 text-xs">No credit card required · Free forever plan available</p>
        </section>
      </div>
    </div>
  );
};

export default PublicResumeBuilder;
