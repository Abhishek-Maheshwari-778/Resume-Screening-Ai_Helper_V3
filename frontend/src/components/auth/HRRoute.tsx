import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface HRRouteProps {
  children: React.ReactNode;
}

const HRRoute: React.FC<HRRouteProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hrRoles = ['hr', 'employer', 'enterprise', 'admin'];

  if (!hrRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center p-4">
        <div className="bg-[#111420] border border-white/5 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Employer Access Only</h2>
          <p className="text-gray-400 mb-6">
            This area is for HR professionals, employers, and enterprise users. Please sign up with a different role or contact your admin.
          </p>
          <a
            href="/app"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all font-medium"
          >
            Go to Candidate Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default HRRoute;
