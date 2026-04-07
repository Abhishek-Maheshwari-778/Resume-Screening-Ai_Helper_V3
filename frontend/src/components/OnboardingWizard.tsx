import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OnboardingWizard: React.FC = () => {
  const { user, token, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: 'Entry Level',
    goal: 'Actively applying'
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API}/api/auth/onboarding`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          role: user?.role,
          company: user?.company || formData.targetRole
        })
      });
      
      if (!res.ok) throw new Error('Onboarding failed');
      
      toast.success('Welcome aboard! Let\'s get started. 🚀');
      if (user) {
        setUser({ ...user, onboarding_complete: true });
      }
      navigate('/app');
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guard: If not logged in, or already completed onboarding, don't render anything
  if (!user || user.onboarding_complete || user.role === 'admin') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-300">
      <div className="bg-[#161b22] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-blue-900/20">
        
        {/* Progress Header */}
        <div className="bg-[#0d1117] px-8 py-6 border-b border-white/5 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Setup your Profile</h2>
            <div className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Step {step} of 3
            </div>
          </div>
          <div className="relative z-10 h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Body */}
        <div className="p-8 md:p-12 min-h-[340px] flex flex-col justify-center relative">
          
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-3xl font-bold text-white mb-3">What's your target role?</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">Let our AI know what jobs you're aiming for so we can tailor our ATS keyword recommendations exactly to your industry.</p>
              
              <input 
                type="text"
                autoFocus
                value={formData.targetRole}
                onChange={e => setFormData({...formData, targetRole: e.target.value})}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder:text-gray-600"
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="text-5xl mb-6">📈</div>
               <h3 className="text-3xl font-bold text-white mb-3">Experience Level</h3>
               <p className="text-gray-400 mb-8 leading-relaxed">This helps us calibrate the tone of your cover letters and the complexity of suggested AI bullet points.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {['Entry Level', 'Mid-Level', 'Senior/Exec'].map(lvl => (
                   <button 
                     key={lvl}
                     onClick={() => setFormData({...formData, experienceLevel: lvl})}
                     className={`py-4 rounded-2xl border-2 transition-all font-bold ${
                       formData.experienceLevel === lvl 
                         ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                         : 'border-white/5 bg-[#0d1117] text-gray-400 hover:border-white/20'
                     }`}
                   >
                     {lvl}
                   </button>
                 ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="text-5xl mb-6">🚀</div>
               <h3 className="text-3xl font-bold text-white mb-3">What brings you here?</h3>
               <p className="text-gray-400 mb-8 leading-relaxed">We'll set up your dashboard based on what you need most right now.</p>
               
               <div className="grid grid-cols-1 gap-4">
                 {[
                   { title: 'Actively applying', desc: 'I need to beat the ATS immediately.', icon: '⚡' },
                   { title: 'Just updating', desc: 'Keeping my resume fresh for future roles.', icon: '📝' },
                   { title: 'Exploring features', desc: 'Just checking out the AI capabilities.', icon: '👀' }
                 ].map(g => (
                   <button 
                     key={g.title}
                     onClick={() => setFormData({...formData, goal: g.title})}
                     className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${
                       formData.goal === g.title 
                         ? 'border-emerald-500 bg-emerald-500/10' 
                         : 'border-white/5 bg-[#0d1117] hover:border-white/20'
                     }`}
                   >
                     <div className="text-2xl">{g.icon}</div>
                     <div>
                       <div className={`font-bold ${formData.goal === g.title ? 'text-white' : 'text-gray-300'}`}>{g.title}</div>
                       <div className="text-xs text-gray-500 mt-1">{g.desc}</div>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#0d1117] px-8 py-5 border-t border-white/5 flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              Back
            </button>
          )}
          
          <button 
            onClick={step === 3 ? handleFinish : handleNext}
            disabled={isSubmitting || (step === 1 && !formData.targetRole.trim())}
            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
              isSubmitting || (step === 1 && !formData.targetRole.trim())
                ? 'bg-blue-600/50 cursor-not-allowed text-white/50'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? 'Finalizing Profile...' : step === 3 ? 'Go to Dashboard 🚀' : 'Continue →'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;
