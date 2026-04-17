import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdminDraws() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step state: configure → simulate → publish
  const [step, setStep] = useState('configure');
  const [draws, setDraws] = useState([]);
  const [activeDraw, setActiveDraw] = useState(null);
  const [simulation, setSimulation] = useState(null);

  // Form state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [drawType, setDrawType] = useState('random');
  const [bias, setBias] = useState('most');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load existing draws
  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const { data } = await api.get('/api/draws');
        setDraws(data.draws);
      } catch {
        // silent fail
      }
    };
    fetchDraws();
  }, []);

  // ── Step 1: Create draw config ─────────────────────────────
  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/draws', {
        month,
        year,
        drawType,
        algorithmicBias: bias,
      });
      setActiveDraw(data.draw);
      setStep('simulate');
      setDraws((prev) => [data.draw, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create draw.');
      // If draw already exists, offer to use it
      if (err.response?.data?.drawId) {
        setActiveDraw({ _id: err.response.data.drawId });
        setStep('simulate');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Simulate ──────────────────────────────────────
  const handleSimulate = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/api/draws/${activeDraw._id}/simulate`);
      setSimulation(data);
      setActiveDraw(data.draw);
      setStep('publish');
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Publish ───────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      const { data } = await api.post(`/api/draws/${activeDraw._id}/publish`);
      setActiveDraw(data.draw);
      setSimulation((prev) => ({ ...prev, ...data }));
      setShowConfirm(false);

      // Update draws list
      setDraws((prev) =>
        prev.map((d) => (d._id === data.draw._id ? data.draw : d))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish draw.');
    } finally {
      setPublishing(false);
    }
  };

  const formatPence = (p) => `£${(p / 100).toFixed(2)}`;

  return (
    <div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Draw Management</h1>
        <p className="text-slate-400 mb-8">Configure, simulate, and publish monthly prize draws.</p>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-danger/60 hover:text-danger">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── 3-Step Progress ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8">
          {['configure', 'simulate', 'publish'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25'
                  : ['configure', 'simulate', 'publish'].indexOf(step) > i
                  ? 'bg-success/20 text-success'
                  : 'bg-surface-200/50 text-slate-500'
              }`}>
                {['configure', 'simulate', 'publish'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium capitalize ${step === s ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Configure ────────────────────────────── */}
        {step === 'configure' && (
          <div className="glass rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Configure Draw</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 [color-scheme:dark]"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Draw Type</label>
                <select
                  value={drawType}
                  onChange={(e) => setDrawType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 [color-scheme:dark]"
                >
                  <option value="random">Random</option>
                  <option value="algorithmic">Algorithmic (Score-weighted)</option>
                </select>
              </div>
              {drawType === 'algorithmic' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Algorithmic Bias</label>
                  <select
                    value={bias}
                    onChange={(e) => setBias(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 [color-scheme:dark]"
                  >
                    <option value="most">Most frequent scores</option>
                    <option value="least">Least frequent scores</option>
                  </select>
                </div>
              )}
            </div>

            {/* Tier breakdown info */}
            <div className="rounded-xl bg-surface-100/30 border border-white/5 p-4 mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Prize Pool Distribution</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tier: '5-Match', pct: '40%', label: 'Jackpot', color: 'text-warning' },
                  { tier: '4-Match', pct: '35%', label: 'Second', color: 'text-brand-400' },
                  { tier: '3-Match', pct: '25%', label: 'Third', color: 'text-slate-300' },
                ].map((t) => (
                  <div key={t.tier} className="text-center">
                    <p className={`text-lg font-bold ${t.color}`}>{t.pct}</p>
                    <p className="text-xs text-slate-500">{t.tier}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
              Create Draw — {MONTHS[month - 1]} {year}
            </button>
          </div>
        )}

        {/* ── Step 2: Simulate ────────────────────────────── */}
        {step === 'simulate' && (
          <div className="glass rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-white mb-2">Run Simulation</h2>
            <p className="text-sm text-slate-400 mb-6">
              Generate draw numbers and preview results before publishing. Nothing is saved to user records yet.
            </p>

            {activeDraw && (
              <div className="rounded-xl bg-surface-100/30 border border-white/5 p-4 mb-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Month</p>
                    <p className="text-sm font-semibold text-white">{MONTHS[(activeDraw.month || month) - 1]} {activeDraw.year || year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-sm font-semibold text-white capitalize">{activeDraw.drawType || drawType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rollover</p>
                    <p className="text-sm font-semibold text-warning">{formatPence(activeDraw.jackpotRollover || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running simulation…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                  Run Simulation
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Step 3: Publish ─────────────────────────────── */}
        {step === 'publish' && simulation && (
          <div className="space-y-6">
            {/* Draw Numbers */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Draw Numbers</h3>
              <div className="flex items-center gap-3 mb-2">
                {simulation.numbers.map((n) => (
                  <div
                    key={n}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-600/20"
                  >
                    <span className="text-lg font-bold text-white tabular-nums">{n}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Type: <span className="text-slate-300 capitalize">{activeDraw?.drawType}</span>
              </p>
            </div>

            {/* Prize Pool */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Prize Pool</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{formatPence(simulation.prizePool?.total || 0)}</p>
                  <p className="text-xs text-slate-500">Total Pool</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-warning">{formatPence(simulation.prizePool?.tiers?.first || 0)}</p>
                  <p className="text-xs text-slate-500">5-Match (40%)</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-brand-400">{formatPence(simulation.prizePool?.tiers?.second || 0)}</p>
                  <p className="text-xs text-slate-500">4-Match (35%)</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-300">{formatPence(simulation.prizePool?.tiers?.third || 0)}</p>
                  <p className="text-xs text-slate-500">3-Match (25%)</p>
                </div>
              </div>
              {simulation.prizePool?.jackpotRollover > 0 && (
                <p className="text-xs text-warning mt-3">
                  Includes {formatPence(simulation.prizePool.jackpotRollover)} jackpot rollover from previous month
                </p>
              )}
            </div>

            {/* Winners table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Simulation Results</h3>
                <span className="text-xs text-slate-500">{simulation.totalWinners} winner{simulation.totalWinners !== 1 ? 's' : ''}</span>
              </div>

              {/* Tier summary */}
              <div className="px-6 py-3 border-b border-white/5 flex gap-6 text-xs">
                <span className="text-warning font-semibold">5-Match: {simulation.tierSummary?.[5] || 0}</span>
                <span className="text-brand-400 font-semibold">4-Match: {simulation.tierSummary?.[4] || 0}</span>
                <span className="text-slate-300 font-semibold">3-Match: {simulation.tierSummary?.[3] || 0}</span>
              </div>

              {simulation.matches && simulation.matches.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {simulation.matches.map((m, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          m.matchTier === 5 ? 'bg-warning/15 text-warning' :
                          m.matchTier === 4 ? 'bg-brand-500/15 text-brand-400' :
                          'bg-white/8 text-slate-300'
                        }`}>
                          {m.matchTier}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{m.userName}</p>
                          <p className="text-xs text-slate-500">{m.userEmail}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-success tabular-nums">{formatPence(m.prizeAmount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                  No winners in this simulation. Jackpot will roll over.
                </div>
              )}

              {!simulation.hasJackpotWinner && (
                <div className="px-6 py-3 border-t border-white/5 bg-warning/5 text-xs text-warning">
                  ⚠️ No 5-match winner — {formatPence(simulation.prizePool?.tiers?.first || 0)} will roll over to next month's jackpot
                </div>
              )}
            </div>

            {/* Publish button */}
            {activeDraw?.status !== 'published' ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-success/80 to-success text-white font-semibold text-sm shadow-lg shadow-success/20 hover:shadow-success/35 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Publish Draw Results
              </button>
            ) : (
              <div className="rounded-xl bg-success/10 border border-success/20 px-5 py-4 text-center">
                <p className="text-success font-semibold">✓ Draw published successfully</p>
                <p className="text-xs text-slate-500 mt-1">Results are now visible to all users on the public draws page.</p>
              </div>
            )}

            <button
              onClick={() => { setStep('configure'); setSimulation(null); setActiveDraw(null); }}
              className="w-full py-3 rounded-xl glass text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Start new draw
            </button>
          </div>
        )}

        {/* ── Confirmation Modal ──────────────────────────── */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Confirm Publish</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                This action is <strong className="text-white">irreversible</strong>. Draw results will be persisted, winner records created, and results made publicly visible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success/80 to-success text-white font-semibold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {publishing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {publishing ? 'Publishing…' : 'Yes, publish'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={publishing}
                  className="flex-1 py-3 rounded-xl glass text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Existing Draws History ──────────────────────── */}
        {draws.length > 0 && step === 'configure' && (
          <div className="mt-10 glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Previous Draws</h3>
            </div>
            <div className="divide-y divide-white/5">
              {draws.map((d) => (
                <div key={d._id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{MONTHS[d.month - 1]} {d.year}</p>
                    <p className="text-xs text-slate-500">{d.drawType} • {d.numbers?.length || 0} numbers drawn</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      d.status === 'published' ? 'bg-success/10 text-success' :
                      d.status === 'simulated' ? 'bg-warning/10 text-warning' :
                      'bg-surface-200/50 text-slate-400'
                    }`}>
                      {d.status}
                    </span>
                    {d.prizePool && (
                      <span className="text-xs text-slate-500 tabular-nums">{formatPence(d.prizePool.total)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
