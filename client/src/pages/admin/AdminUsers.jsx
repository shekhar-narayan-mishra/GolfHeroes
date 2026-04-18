import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/admin/users');
        setUsers(data.users || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load users.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">View and manage subscriber accounts.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-100/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="px-6 py-4 border-b border-white/5 grid grid-cols-[1fr_1fr_1fr_0.5fr] gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid min-w-[640px]">
            <div>User</div>
            <div>Status</div>
            <div>Role</div>
            <div className="text-right">Scores</div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading...</div>
          ) : (
            <div className="divide-y divide-white/5 min-w-[640px]">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_0.5fr] gap-4 items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-400">
                      {user.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
                          ? 'bg-success/10 text-success'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {(user.subscriptionStatus || 'inactive').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <div className="text-left md:text-right text-sm font-semibold text-white">
                    {user.scoresCount}/5
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
