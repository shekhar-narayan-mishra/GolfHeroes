import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Banner shown in the dashboard when subscription is lapsed, cancelled (and expired),
 * or non-existent. Prompts the user to subscribe or renew.
 */
export default function SubscriptionBanner() {
  const { user } = useAuth();

  if (!user) return null;

  const status = user.subscriptionStatus;
  const expiry = user.subscriptionExpiry;
  const isExpired = expiry && new Date(expiry) <= new Date();

  // Active or trialing — don't show banner
  if (status === 'active' || status === 'trialing') return null;

  // Cancelled but still within paid period — show soft notice
  if (status === 'cancelled' && !isExpired) {
    const expiryDate = new Date(expiry).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="rounded-2xl border border-warning/20 bg-warning/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Subscription ending soon</p>
            <p className="text-xs text-slate-400 truncate">
              Your access continues until {expiryDate}. Renew to keep your streak.
            </p>
          </div>
        </div>
        <Link
          to="/subscribe"
          className="shrink-0 px-5 py-2 rounded-xl bg-warning/20 text-warning text-sm font-semibold hover:bg-warning/30 transition-colors"
        >
          Renew plan
        </Link>
      </div>
    );
  }

  // Lapsed or no subscription — show urgent banner
  return (
    <div className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {status === 'lapsed' ? 'Payment failed' : 'No active subscription'}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {status === 'lapsed'
              ? 'Your latest payment could not be processed. Update your billing or re-subscribe.'
              : 'Subscribe to unlock score tracking, prize draws, and charity giving.'}
          </p>
        </div>
      </div>
      <Link
        to="/subscribe"
        className="shrink-0 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/20 hover:shadow-brand-600/35 hover:brightness-110 transition-all"
      >
        {status === 'lapsed' ? 'Fix billing' : 'Subscribe now'}
      </Link>
    </div>
  );
}
