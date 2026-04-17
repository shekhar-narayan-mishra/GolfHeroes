import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (showFeatured) params.set('featured', 'true');
        const { data } = await api.get(`/api/charities?${params.toString()}`);
        setCharities(data.charities);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCharities, 300);
    return () => clearTimeout(debounce);
  }, [search, showFeatured]);

  return (
    <div className="min-h-screen bg-mesh">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full bg-success/6 blur-[150px]" />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full bg-brand-400/6 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Digital Heroes</span>
        </Link>
        <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
          Dashboard
        </Link>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Our Charities</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            A portion of every subscription goes directly to the charities you choose.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 max-w-xl mx-auto">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charities…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0 ${
              showFeatured
                ? 'bg-success/15 text-success border border-success/20'
                : 'bg-surface-100/60 border border-white/8 text-slate-400 hover:text-white'
            }`}
          >
            ⭐ Featured
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <span className="text-4xl mb-4 block">💚</span>
            <h3 className="text-lg font-semibold text-white mb-1">No charities found</h3>
            <p className="text-sm text-slate-500">
              {search ? 'Try a different search term.' : 'Charities will appear here once added.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity) => (
              <Link
                key={charity._id}
                to={`/charities/${charity.slug}`}
                className="glass rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group"
              >
                {/* Image */}
                <div className="aspect-video bg-surface-200/30 flex items-center justify-center overflow-hidden">
                  {charity.images && charity.images[0] ? (
                    <img
                      src={charity.images[0]}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-4xl">💚</div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {charity.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
                    {charity.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {charity.description || 'Supporting those who need it most.'}
                  </p>
                  {charity.events && charity.events.length > 0 && (
                    <p className="text-xs text-slate-500 mt-3">
                      📅 {charity.events.length} upcoming event{charity.events.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
