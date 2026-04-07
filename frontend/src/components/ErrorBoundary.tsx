import React, { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
          <div className="text-center max-w-lg mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">Something Went Wrong</h1>
            <p className="text-gray-400 mb-2">An unexpected error occurred in the application.</p>
            {this.state.error && (
              <p className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3 mb-8 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
