import React from 'react';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 1,
    name: "The Executive",
    description: "Classic, professional format preferred by traditional corporate employers and Fortune 500s.",
    color: "from-blue-900 to-slate-900",
    tags: ["Corporate", "Traditional", "ATS-Optimized"],
    previewUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "👔"
  },
  {
    id: 2,
    name: "Tech Startup",
    description: "Two-column modern design that highlights technical skills alongside project portfolios.",
    color: "from-emerald-600 to-teal-900",
    tags: ["Tech", "Modern", "Two-Column"],
    previewUrl: "https://images.unsplash.com/photo-1626264889056-11f87968af1e?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "🚀"
  },
  {
    id: 3,
    name: "Minimalist",
    description: "Typography-focused layout that lets your experience breathe with maximum whitespace.",
    color: "from-gray-100 to-gray-300",
    textColor: "text-gray-900",
    tags: ["Clean", "Design", "Typography"],
    previewUrl: "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "✨"
  },
  {
    id: 4,
    name: "Creative Dark",
    description: "Stand out in the digital crowd with a bold dark mode resume that instantly grabs attention.",
    color: "from-violet-900 to-fuchsia-900",
    tags: ["Creative", "Dark Mode", "Digital"],
    previewUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "🎨"
  },
  {
    id: 5,
    name: "Data Scientist",
    description: "Metric-heavy design focusing on quantifiable achievements and precise technical capabilities.",
    color: "from-cyan-700 to-blue-900",
    tags: ["Analytical", "Metrics", "Technical"],
    previewUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "📊"
  },
  {
    id: 6,
    name: "Academic Scholar",
    description: "Comprehensive structure designed for extensive publications, research, and educational histories.",
    color: "from-amber-700 to-orange-900",
    tags: ["Research", "CV", "Detailed"],
    previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400&h=500",
    icon: "🎓"
  },
];

const PublicTemplates: React.FC = () => {
  return (
    <div className="bg-[#0a0f1a] min-h-screen pb-20 selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[100px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
            <span>✨ 100% ATS Optimized</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 tracking-tight">
            Templates that <span className="bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Win Interviews</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing what recruiters want. Our AI-designed templates are mathematically structured to pass ATS scanners while impressing human eyes.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="group relative bg-[#121826] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col"
            >
              {/* Preview Image / Graphic */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-transparent to-transparent z-10"></div>
                <img 
                  src={template.previewUrl} 
                  alt={template.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Fallback pattern overlay for aesthetic */}
                <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-40 mix-blend-overlay`}></div>
                
                <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md border border-white/10 p-2 rounded-xl text-xl">
                  {template.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
                  {template.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hover Action */}
                <Link 
                  to="/auth" 
                  className="w-full py-3 px-4 bg-white/5 hover:bg-blue-600 text-white text-center font-bold rounded-xl border border-white/10 hover:border-blue-500 transition-all duration-300"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-[#121826] to-[#0a0f1a] border border-white/5 p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 blur-[100px]"></div>
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Don't see what you need, or have already an old ATS resume?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
            Our AI can analyze your existing PDF or Docx resume and automatically adapt it into any of our premium structures without losing a single bullet point.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <Link to="/build" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1 transition-all">
              Try the AI Builder
            </Link>
            <Link to="/check" className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
               Free ATS Check
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTemplates;
