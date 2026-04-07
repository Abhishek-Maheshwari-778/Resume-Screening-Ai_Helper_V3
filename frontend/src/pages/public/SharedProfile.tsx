import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const SharedProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API}/api/resumes/public/${id}`);
        
        if (res.status === 403) {
          throw new Error('This profile is private and not currently shared.');
        } else if (!res.ok) {
          throw new Error('Public profile not found or invalid link.');
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6 opacity-20">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 max-w-md mb-8">{error}</p>
        <Link to="/" className="px-6 py-2.5 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">
          Return to Resume AI
        </Link>
      </div>
    );
  }

  // Helper to safely render text
  const safeText = (text: any) => typeof text === 'string' ? text : 'N/A';

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Navbar Minimal */}
      <nav className="border-b border-white/5 bg-[#161b22]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tighter text-white">
             Resume<span className="text-blue-500">.ai</span>
          </Link>
          <div className="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
             Verified AI Profile ✓
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="pt-16 pb-12 bg-gradient-to-b from-[#161b22] to-[#0d1117] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 p-[2px] shadow-2xl shadow-blue-500/20">
               <div className="w-full h-full bg-[#161b22] rounded-[22px] flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300">
                  {safeText(profile?.candidate_name || profile?.title || 'A')[0].toUpperCase()}
               </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {profile?.candidate_name || 'Anonymous Candidate'}
              </h1>
              <p className="text-xl text-blue-400 font-medium">
                {profile?.title || 'Professional'}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                {profile?.email && (
                  <span className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                    📧 {profile.email}
                  </span>
                )}
                <span className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                    ⏱ Updated {new Date(profile?.updated_at || Date.now()).toLocaleDateString()}
                </span>
                {profile?.ats_score && (
                   <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold">
                     📈 {profile.ats_score}% ATS Verified
                   </span>
                )}
              </div>
            </div>
            
            <div>
               <button className="px-6 py-3 bg-white text-black font-black text-sm rounded-xl hover:bg-gray-200 transition-all shadow-xl shadow-white/10">
                  Download PDF
               </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Sidebar */}
         <div className="col-span-1 space-y-8">
            <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl sticky top-24 shadow-2xl">
               <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-6 flex items-center gap-2">
                  <span className="text-blue-500">★</span> Extracted Skills
               </h3>
               <div className="flex flex-wrap gap-2">
                  {(profile?.extracted_skills && profile.extracted_skills.length > 0) ? 
                    profile.extracted_skills.slice(0, 15).map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 bg-[#0d1117] border border-white/10 rounded-lg text-xs font-semibold hover:border-blue-500/50 transition-colors">
                        {skill}
                      </span>
                    ))
                    : <p className="text-sm text-gray-500 w-full text-center italic py-2">No skills extracted.</p>
                  }
               </div>
            </div>
         </div>
         
         {/* Main Thread */}
         <div className="col-span-1 md:col-span-2 space-y-8">
            {Object.entries(profile?.sections || {}).map(([sectionName, items]: [string, any], idx) => {
               if (!items || items.length === 0) return null;
               
               return (
                 <div key={sectionName} className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                   <h2 className="text-2xl font-bold text-white mb-6 capitalize">{sectionName.replace('_', ' ')}</h2>
                   
                   <div className="space-y-6 relative before:absolute before:inset-0 before:w-px before:bg-white/10 before:ml-2">
                     {items.map((item: any, i: number) => (
                       <div key={i} className="relative pl-8 group">
                         {/* Timeline Dot */}
                         <div className="absolute left-0 w-4 h-4 rounded-full bg-[#161b22] border-2 border-blue-500 top-1.5 group-hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"></div>
                         
                         <div className="bg-[#161b22] border border-white/5 p-6 rounded-2xl group-hover:border-blue-500/30 transition-all shadow-lg">
                            {item.title && <h3 className="text-lg font-bold text-blue-100 mb-2">{item.title}</h3>}
                            <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                              {safeText(item.content)}
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default SharedProfile;
