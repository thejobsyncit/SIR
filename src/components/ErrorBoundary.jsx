import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Non-blocking telemetry to server monitoring endpoint
    try {
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/monitoring/client-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error?.message || 'Client Component Render Error',
            url: window.location.href,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {});
      }
    } catch (_) {}

    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary caught error]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-900/50">
          <div className="max-w-md w-full bg-navy-950 border border-gold-500/30 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Application Notice
            </h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              An unexpected condition occurred while displaying this section. Your data and session remain secure.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
