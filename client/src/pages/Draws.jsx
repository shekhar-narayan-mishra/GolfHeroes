import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const { data } = await api.get('/api/draws');
        setDraws(data.draws.filter((d) => d.status === 'published'));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchDraws();
  }, []);

  const loadDetail = async (drawId) => {
    if (selectedDraw === drawId) {
      setSelectedDraw(null);
      setDetail(null);
      return;
    }
    setSelectedDraw(drawId);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/api/draws/${drawId}`);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatPence = (p) => `£${(p / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full bg-brand-600/8 blur-[150px]" />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full bg-warning/5 blur-[120px]" />
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

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-6 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Prize Draw Results</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Monthly Stableford-based draws. Match numbers drawn against your stored scores to win.
          </p>
        </div>

        {/* How it works */}
        <div className="glass rounded-2xl p-6 mb-10">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '5', label: '5-Number Match', desc: '40% of prize pool (jackpot)', color: 'text-warning' },
              { icon: '4', label: '4-Number Match', desc: '35% of prize pool', color: 'text-brand-400' },
              { icon: '3', label: '3-Number Match', desc: '25% of prize pool', color: 'text-slate-300' },
            ].map((t) => (
              <div key={t.label} className="text-center">
                <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold bg-white/10 text-slate-300">{t.icon}</span>
                <p className={`text-sm font-semibold mt-1 ${t.color}`}>{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Draw list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-1">No draws yet</h3>
            <p className="text-sm text-slate-500">Check back at the end of the month for the first prize draw!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draws.map((draw) => (
              <div key={draw._id}>
                <button
                  onClick={() => loadDetail(draw._id)}
                  className="w-full glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/20 to-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                        <svg className="w-5 h-5 text-brand-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{MONTHS[draw.month - 1]} {draw.year}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pool: <span className="text-brand-400 font-semibold">{formatPence(draw.prizePool?.total || 0)}</span>
                          {' '} • {draw.drawType} draw
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Draw numbers preview */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {draw.numbers?.slice(0, 5).map((n) => (
                          <div key={n} className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
                            <span className="text-xs font-bold text-brand-300 tabular-nums">{n}</span>
                          </div>
                        ))}
                      </div>
                      <svg className={`w-5 h-5 text-slate-500 transition-transform ${selectedDraw === draw._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {selectedDraw === draw._id && (
                  <div className="mt-2 glass rounded-2xl overflow-hidden animate-[fadeIn_0.2s_ease]">
                    {detailLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : detail ? (
                      <>
                        {/* Numbers */}
                        <div className="px-6 py-4 border-b border-white/5">
                          <p className="text-xs text-slate-500 mb-2">Winning Numbers</p>
                          <div className="flex items-center gap-2">
                            {detail.draw.numbers.map((n) => (
                              <div key={n} className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
                                <span className="text-sm font-bold text-white tabular-nums">{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Results */}
                        <div className="px-6 py-4 border-b border-white/5">
                          <p className="text-xs text-slate-500 mb-2">Prize Pool Breakdown</p>
                          <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div>
                              <p className="font-bold text-warning">{formatPence(detail.draw.prizePool?.first || 0)}</p>
                              <p className="text-xs text-slate-500">5-Match</p>
                            </div>
                            <div>
                              <p className="font-bold text-brand-400">{formatPence(detail.draw.prizePool?.second || 0)}</p>
                              <p className="text-xs text-slate-500">4-Match</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-300">{formatPence(detail.draw.prizePool?.third || 0)}</p>
                              <p className="text-xs text-slate-500">3-Match</p>
                            </div>
                          </div>
                        </div>

                        {/* Winners */}
                        {detail.results && detail.results.length > 0 ? (
                          <div className="divide-y divide-white/5">
                            {detail.results.map((r) => (
                              <div key={r._id} className="px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    r.matchTier === 5 ? 'bg-warning/15 text-warning' :
                                    r.matchTier === 4 ? 'bg-brand-500/15 text-brand-400' :
                                    'bg-white/8 text-slate-300'
                                  }`}>
                                    {r.matchTier}
                                  </div>
                                  <p className="text-sm text-white">{r.userId?.name || 'User'}</p>
                                </div>
                                <span className="text-sm font-bold text-success tabular-nums">{formatPence(r.prizeAmount)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-6 py-6 text-center text-sm text-slate-500">
                            No winners this month — jackpot rolls over!
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
