import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../../services/api';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        setData(res.data.analytics);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatPence = (p) => `£${(p / 100).toFixed(2)}`;
  const formatPounds = (p) => `£${p}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass !bg-slate-900/90 !backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 shadow-xl">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-success">{formatPounds(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-warning/50 border-t-warning rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Platform Analytics</h1>
      <p className="text-slate-400 mb-8">
        Overview of key metrics across users, draw pools, and charity contributions.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <span className="text-6xl">👥</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Active Subscribers</p>
          <p className="text-3xl font-bold text-white tabular-nums relative z-10">{data.activeSubscribers}</p>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <span className="text-6xl">🎰</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Curr. Prize Pool</p>
          <p className="text-3xl font-bold text-brand-400 tabular-nums relative z-10">{formatPence(data.currentPrizePool)}</p>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <span className="text-6xl">💚</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Charity impact</p>
          <p className="text-3xl font-bold text-success tabular-nums relative z-10">{formatPence(data.totalCharityContributions)}</p>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <span className="text-6xl">📈</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Draw Participation</p>
          <p className="text-3xl font-bold text-warning tabular-nums relative z-10">{data.participationRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1 relative z-10">Active subs with scores</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass rounded-2xl p-6 h-[400px]">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Top Charity Contributions (All-Time)</h3>
        
        {data.charityChartData && data.charityChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.charityChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `£${value}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.charityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={'#22c55e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-500">No contribution data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
