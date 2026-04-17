import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Overview() {
  const { user } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);

  const handleBilling = async () => {
    setBillingLoading(true);
    try {
      const { data } = await api.post('/api/subscriptions/portal');
      window.location.href = data.url;
    } catch (err) {
      if (err.response?.status === 400) {
        window.location.href = '/subscribe';
      }
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name?.split(' ')[0]}. Here's your overview.</p>
        </div>
        {user?.stripeCustomerId && (
          <button
            onClick={handleBilling}
            disabled={billingLoading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {billingLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            )}
            Manage Billing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Subscription',
            value:
              user?.subscriptionStatus === 'active' ? 'Active' :
              user?.subscriptionStatus === 'cancelled' ? 'Cancelled' :
              user?.subscriptionStatus === 'lapsed' ? 'Lapsed' : 'Inactive',
            color:
              user?.subscriptionStatus === 'active' ? 'text-success' :
              user?.subscriptionStatus === 'cancelled' ? 'text-warning' : 'text-danger',
          },
          { label: 'Plan', value: user?.subscriptionPlan === 'none' ? '—' : user?.subscriptionPlan?.charAt(0).toUpperCase() + user?.subscriptionPlan?.slice(1), color: 'text-brand-400' },
          { label: 'Next Draw', value: 'May 2026', color: 'text-white' },
          { label: 'Charity Given', value: '£0.00', color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
