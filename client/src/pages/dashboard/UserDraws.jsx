import { useState, useEffect } from 'react';
import api from '../../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function UserDraws() {
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
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Draw Results</h1>
      <p className="text-slate-400 mb-8">
        Check your recent entries and see if your Stableford scores matched the drawn numbers.
      </p>

      {/* How it works compact */}
      <div className="glass rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold bg-white/10 text-slate-300">5</span>
          <div>
            <p className="font-semibold text-warning">5-Number Match</p>
            <p className="text-xs text-slate-500">40% pool (jackpot)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold bg-white/10 text-slate-300">4</span>
          <div>
            <p className="font-semibold text-brand-400">4-Number Match</p>
            <p className="text-xs text-slate-500">35% pool</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold bg-white/10 text-slate-300">3</span>
          <div>
            <p className="font-semibold text-slate-300">3-Number Match</p>
            <p className="text-xs text-slate-500">25% pool</p>
          </div>
        </div>
      </div>

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
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${selectedDraw === draw._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </button>

              {selectedDraw === draw._id && (
                <div className="mt-2 glass rounded-2xl overflow-hidden animate-[fadeIn_0.2s_ease]">
                  {detailLoading ? (
                    <div className="p-8 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : detail ? (
                    <>
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
                      <div className="px-6 py-4 border-b border-white/5">
                        <p className="text-xs text-slate-500 mb-2">Pool Breakdown</p>
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
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
