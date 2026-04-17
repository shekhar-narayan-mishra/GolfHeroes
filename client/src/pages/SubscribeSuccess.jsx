import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SubscribeSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/onboarding/charity', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-success/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-500/6 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="mb-8 inline-flex">
          <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/20 flex items-center justify-center animate-[bounce_1s_ease-in-out]">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          You're all set!
        </h1>
        <p className="text-lg text-slate-400 mb-2">
          Welcome to Digital Heroes{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
        </p>
        <p className="text-slate-500 mb-10">
          Your subscription is now active. Start tracking scores, entering draws, and making a difference.
        </p>

        {/* Feature highlights */}
        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">What's unlocked</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '📊', label: 'Score tracking' },
              { icon: '🎰', label: 'Prize draws' },
              { icon: '💚', label: 'Charity giving' },
              { icon: '🏆', label: 'Leaderboards' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Redirect notice */}
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Redirecting to choose your charity in{' '}
            <span className="text-brand-400 font-semibold tabular-nums">{countdown}s</span>
          </p>
          {/* Progress bar */}
          <div className="mt-3 w-48 mx-auto h-1 rounded-full bg-surface-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>
        </div>

        <Link
          to="/onboarding/charity"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:brightness-110 transition-all"
        >
          Choose your charity →
        </Link>
        <Link
          to="/dashboard"
          className="block mt-3 text-sm text-slate-500 hover:text-white transition-colors"
        >
          Skip to Dashboard
        </Link>
      </div>
    </div>
  );
}
