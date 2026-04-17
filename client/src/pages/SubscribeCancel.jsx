import { Link } from 'react-router-dom';

export default function SubscribeCancel() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-600/6 blur-[150px]" />
      </div>

      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-8 inline-flex">
          <div className="w-20 h-20 rounded-full bg-surface-200/50 border border-white/8 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          No worries!
        </h1>
        <p className="text-lg text-slate-400 mb-3">
          You weren't charged. Your checkout was cancelled.
        </p>
        <p className="text-slate-500 mb-10 max-w-sm mx-auto">
          If you changed your mind or have questions about our plans, we're here to help. You can subscribe anytime.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/subscribe"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            View plans again
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass text-white font-medium hover:bg-white/8 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Support link */}
        <p className="mt-10 text-sm text-slate-600">
          Need help?{' '}
          <a href="mailto:support@digitalheroes.com" className="text-brand-400 hover:text-brand-300 transition-colors">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
