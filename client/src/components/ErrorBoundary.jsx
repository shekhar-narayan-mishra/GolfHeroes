import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-8 bg-slate-950 text-white">
          <div>
            <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5"
            >
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
