import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/layout/Layout'
import PublicLayout from '@/components/layout/PublicLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import HRRoute from '@/components/auth/HRRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingScreen from '@/components/LoadingScreen'
import CookieConsent from '@/components/CookieConsent'
import NotFound from '@/pages/NotFound'

// Public Pages
import Home from '@/pages/public/Home'
import About from '@/pages/public/About'
import Features from '@/pages/public/Features'
import Pricing from '@/pages/public/Pricing'
import Contact from '@/pages/public/Contact'
import HowItWorks from '@/pages/public/HowItWorks'
import PublicResumeBuilder from '@/pages/public/PublicResumeBuilder'
import PublicResumeChecker from '@/pages/public/PublicResumeChecker'
import PublicTemplates from '@/pages/public/PublicTemplates'
import Privacy from '@/pages/public/Privacy'
import Terms from '@/pages/public/Terms'
import Security from '@/pages/public/Security'
import SharedProfile from '@/pages/public/SharedProfile'
import Auth from '@/pages/Auth'

// Candidate dashboard pages
import Dashboard from '@/pages/Dashboard'
import ResumeBuilder from '@/pages/ResumeBuilder'
import ResumeChecker from '@/pages/ResumeChecker'
import Templates from '@/pages/Templates'
import Profile from '@/pages/Profile'
import MyResumes from '@/pages/MyResumes'

// Phase 2 - New Candidate Pages
import JobMatch from '@/pages/JobMatch'
import CoverLetter from '@/pages/CoverLetter'
const InterviewPrep = lazy(() => import('@/pages/InterviewPrep'))
const AppTracker = lazy(() => import('@/pages/AppTracker'))

// HR pages
import HRDashboard from '@/pages/hr/HRDashboard'
import CandidateScreening from '@/pages/hr/CandidateScreening'
import SkillExtraction from '@/pages/hr/SkillExtraction'
import BulkAnalysis from '@/pages/hr/BulkAnalysis'
import JobPostings from '@/pages/hr/JobPostings'
import HRAnalytics from '@/pages/hr/HRAnalytics'
import SemanticSearch from '@/pages/hr/SemanticSearch'
import JDMaker from '@/pages/hr/JDMaker'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'
import PlatformAnalytics from '@/pages/admin/PlatformAnalytics'

import { useAuthStore } from '@/stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

// Admin-only guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'admin') return <Navigate to="/app" replace />
  return <>{children}</>
}

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen message="Signing you in..." />
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-[var(--bg-base)] transition-colors duration-500">
            <CookieConsent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
              }}
            />

            <Suspense fallback={<LoadingScreen message="Loading Intelligence..." />}>
              <Routes>
                {/* Public */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/build" element={<PublicResumeBuilder />} />
                  <Route path="/check" element={<PublicResumeChecker />} />
                  <Route path="/templates" element={<PublicTemplates />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/resume/public/:id" element={<SharedProfile />} />
                </Route>

                {/* Auth */}
                <Route path="/auth" element={<Auth />} />

                {/* Candidate Dashboard */}
                <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="builder" element={<ResumeBuilder />} />
                  <Route path="checker" element={<ResumeChecker />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="resumes" element={<MyResumes />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="job-match" element={<JobMatch />} />
                  <Route path="cover-letter" element={<CoverLetter />} />
                  <Route path="tracker" element={<AppTracker />} />
                  <Route path="interview" element={<InterviewPrep />} />
                </Route>

                {/* HR / Employer Dashboard */}
                <Route path="/hr" element={<HRRoute><Layout /></HRRoute>}>
                  <Route index element={<HRDashboard />} />
                  <Route path="screening" element={<CandidateScreening />} />
                  <Route path="skills" element={<SkillExtraction />} />
                  <Route path="bulk" element={<BulkAnalysis />} />
                  <Route path="analytics" element={<HRAnalytics />} />
                  <Route path="jd-maker" element={<JDMaker />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin */}
                <Route path="/x-control-center" element={<AdminRoute><Layout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<PlatformAnalytics />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
