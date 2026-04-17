import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SubscriptionBanner from '../components/SubscriptionBanner';
import CharitySettings from '../components/CharitySettings';
import MyWinnings from '../components/MyWinnings';
import api from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [billingLoading, setBillingLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBilling = async () => {
    setBillingLoading(true);
    try {
      const { data } = await api.post('/api/subscriptions/portal');
      window.location.href = data.url;
    } catch (err) {
      // If no Stripe customer yet, redirect to subscribe page
      if (err.response?.status === 400) {
        navigate('/subscribe');
      }
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      {/* Top bar */}
      <header className="border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-bold text-white">Digital Heroes</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Billing button */}
            {user?.stripeCustomerId && (
              <button
                onClick={handleBilling}
                disabled={billingLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {billingLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                )}
                Billing
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 mb-8">Welcome back, {user?.name?.split(' ')[0]}. Here's your overview.</p>

        {/* Subscription banner — shown if not active */}
        <div className="mb-8">
          <SubscriptionBanner />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Subscription',
              value:
                user?.subscriptionStatus === 'active'
                  ? 'Active'
                  : user?.subscriptionStatus === 'cancelled'
                  ? 'Cancelled'
                  : user?.subscriptionStatus === 'lapsed'
                  ? 'Lapsed'
                  : 'Inactive',
              color:
                user?.subscriptionStatus === 'active'
                  ? 'text-success'
                  : user?.subscriptionStatus === 'cancelled'
                  ? 'text-warning'
                  : 'text-danger',
            },
            { label: 'Plan', value: user?.subscriptionPlan === 'none' ? '—' : user?.subscriptionPlan?.charAt(0).toUpperCase() + user?.subscriptionPlan?.slice(1), color: 'text-brand-400' },
            { label: 'Next Draw', value: 'May 2026', color: 'text-white' },
            { label: 'Charity Given', value: '£0.00', color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/scores"
            className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">Scores</h3>
            </div>
            <p className="text-xs text-slate-500">Track your Stableford rounds →</p>
          </Link>

          <Link
            to="/draws"
            className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                <span className="text-lg">🎰</span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-warning transition-colors">Draws</h3>
            </div>
            <p className="text-xs text-slate-500">View prize draw results →</p>
          </Link>

          <Link
            to="/charities"
            className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <span className="text-lg">💚</span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-success transition-colors">Charities</h3>
            </div>
            <p className="text-xs text-slate-500">Support causes you care about →</p>
          </Link>
        </div>

        {/* Winnings */}
        <div className="mt-8">
          <MyWinnings />
        </div>

        {/* Charity settings */}
        <div className="mt-8">
          <CharitySettings />
        </div>

        {/* Admin panel link */}
        {user?.role === 'admin' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/draws"
              className="glass rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-warning transition-colors">Manage Draws</h3>
                  <p className="text-xs text-slate-500">Configure & publish</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-warning transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
            <Link
              to="/admin/winners"
              className="glass rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-success transition-colors">Verify Winners</h3>
                  <p className="text-xs text-slate-500">Proofs & payouts</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-success transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
