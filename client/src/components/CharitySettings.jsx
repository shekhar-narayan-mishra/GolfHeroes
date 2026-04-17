import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MIN_PCT = 10;

/**
 * Dashboard widget: shows current charity selection and contribution slider.
 */
export default function CharitySettings() {
  const { user } = useAuth();

  const [charities, setCharities] = useState([]);
  const [selectedId, setSelectedId] = useState(user?.charityId || null);
  const [percent, setPercent] = useState(user?.contributionPercent || MIN_PCT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [charityName, setCharityName] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data } = await api.get('/api/charities');
        setCharities(data.charities);
        // Find name of current selection
        if (user?.charityId) {
          const current = data.charities.find((c) => c._id === user.charityId);
          if (current) setCharityName(current.name);
        }
      } catch {
        // silent
      }
    };
    fetchCharities();
  }, [user?.charityId]);

  const handleSave = async () => {
    if (!selectedId) {
      setError('Please select a charity.');
      return;
    }
    if (percent < MIN_PCT) {
      setError(`Minimum contribution is ${MIN_PCT}%.`);
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { data } = await api.post('/api/charities/select', {
        charityId: selectedId,
        contributionPercent: percent,
      });
      setCharityName(data.charity?.name || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCharity = charities.find((c) => c._id === selectedId);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">Charity & Giving</h3>
        {saved && (
          <span className="text-xs text-success font-semibold animate-[fadeIn_0.2s_ease]">✓ Saved</span>
        )}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
          {error}
        </div>
      )}

      {/* Current selection */}
      <div className="rounded-xl bg-surface-100/30 border border-white/5 p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            {selectedCharity?.images?.[0] ? (
              <img src={selectedCharity.images[0]} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="text-lg">💚</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {selectedCharity?.name || charityName || 'No charity selected'}
            </p>
            <p className="text-xs text-slate-500">
              Contributing <span className="text-success font-semibold">{percent}%</span> of subscription
            </p>
          </div>
        </div>
      </div>

      {/* Charity selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Change charity</label>
        <select
          value={selectedId || ''}
          onChange={(e) => { setSelectedId(e.target.value); setError(''); setSaved(false); }}
          className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-success/50 [color-scheme:dark]"
        >
          <option value="">Select a charity…</option>
          {charities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.featured ? '⭐' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Contribution slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-400">Contribution %</label>
          <span className="text-lg font-bold text-success tabular-nums">{percent}%</span>
        </div>
        <input
          type="range"
          min={MIN_PCT}
          max={100}
          value={percent}
          onChange={(e) => { setPercent(Number(e.target.value)); setSaved(false); }}
          className="w-full h-2 rounded-full appearance-none bg-surface-200/50 accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{MIN_PCT}% min</span>
          <span>100%</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : null}
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
