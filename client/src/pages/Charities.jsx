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
    <div className="min-h-screen bg-[#050a14]">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[150px]" />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full bg-brand-400/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.5l1.9 3.86 4.26.62-3.08 2.99.72 4.23L11 13.3l-3.8 1.9.73-4.23-3.09-2.99 4.27-.62L11 3.5z" />
              <path strokeLinecap="round" d="M11 13.3V21" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Golf Heroes</span>
        </Link>
        <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
          Dashboard
        </Link>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Our Charities</h1>
          <p className="max-w-lg mx-auto text-slate-400">
            A portion of every subscription goes directly to the charities you choose.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 max-w-xl mx-auto">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e8462' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charities…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all text-sm bg-white/5 text-white placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0 ${
              showFeatured
                ? 'bg-success/15 text-success border border-success/20'
                : 'border text-[#4d6641]'
            }`}
            style={!showFeatured ? { background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.85)' } : undefined}
          >
            Featured
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#0b1a08' }}>No charities found</h3>
            <p className="text-sm" style={{ color: '#5f7253' }}>
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
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="#2d7020" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.8-7-10a4 4 0 0 1 7-2.3A4 4 0 0 1 19 10c0 5.2-7 10-7 10z" />
                    </svg>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {charity.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-warning/20 text-warning text-[10px] font-bold uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-brand-400 transition-colors">
                    {charity.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {charity.description || 'Supporting those who need it most.'}
                  </p>
                  {charity.events && charity.events.length > 0 && (
                    <p className="text-xs mt-4 text-slate-500 font-medium">
                      {charity.events.length} upcoming event{charity.events.length !== 1 ? 's' : ''}
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
