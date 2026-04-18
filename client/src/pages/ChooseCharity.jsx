import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MIN_PCT = 10;

/**
 * Onboarding step: user selects a charity and contribution % after subscribing.
 */
export default function ChooseCharity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [percent, setPercent] = useState(MIN_PCT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data } = await api.get('/api/charities');
        setCharities(data.charities);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const handleSave = async () => {
    if (!selected) {
      setError('Please select a charity.');
      return;
    }
    if (percent < MIN_PCT) {
      setError(`Minimum contribution is ${MIN_PCT}%.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post('/api/charities/select', {
        charityId: selected,
        contributionPercent: percent,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-success/8 blur-[150px]" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium mb-4">
            Step 2 of 2
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Choose your charity</h1>
          <p className="text-slate-400">
            At least {MIN_PCT}% of your subscription goes to the charity you select.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        {/* Charity grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {charities.map((c) => (
              <button
                key={c._id}
                onClick={() => { setSelected(c._id); setError(''); }}
                className={`text-left rounded-2xl p-5 transition-all ${
                  selected === c._id
                    ? 'bg-success/10 border-2 border-success/30 ring-2 ring-success/10'
                    : 'glass hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center overflow-hidden shrink-0">
                    {c.images && c.images[0] ? (
                      <img src={c.images[0]} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.8-7-10a4 4 0 0 1 7-2.3A4 4 0 0 1 19 10c0 5.2-7 10-7 10z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                    {c.featured && (
                      <span className="text-[10px] text-success font-semibold">Featured</span>
                    )}
                  </div>
                  {selected === c._id && (
                    <svg className="w-5 h-5 text-success ml-auto shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {c.description || 'Supporting the community.'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Contribution % slider */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Contribution percentage</h3>
            <span className="text-xl font-bold text-success tabular-nums">{percent}%</span>
          </div>
          <input
            type="range"
            min={MIN_PCT}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-surface-200/50 accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{MIN_PCT}% min</span>
            <span>100%</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !selected}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {saving ? 'Saving…' : 'Continue to Dashboard →'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 mt-3 text-sm text-slate-500 hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
