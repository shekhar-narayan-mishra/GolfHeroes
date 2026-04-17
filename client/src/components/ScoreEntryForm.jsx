import { useState } from 'react';

/**
 * Form for adding a new Stableford score.
 * Props:
 *  - onSubmit(value, date) — async callback
 *  - submitting — disables the form while a submission is in progress
 *  - scoreCount — current number of scores (shows capacity indicator)
 */
export default function ScoreEntryForm({ onSubmit, submitting, scoreCount = 0 }) {
  const MAX_SCORES = 5;
  const today = new Date().toISOString().split('T')[0];

  const [value, setValue] = useState('');
  const [date, setDate] = useState(today);
  const [fieldError, setFieldError] = useState('');

  const validate = () => {
    if (!value) return 'Enter your Stableford score.';
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 45)
      return 'Score must be a whole number between 1 and 45.';
    if (!date) return 'Select the date of your round.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');

    const err = validate();
    if (err) {
      setFieldError(err);
      return;
    }

    try {
      await onSubmit(Number(value), date);
      setValue('');
      setDate(today);
    } catch (submitErr) {
      setFieldError(submitErr.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">Add Score</h3>
        {/* Capacity indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_SCORES }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < scoreCount ? 'bg-brand-500' : 'bg-surface-300/50'
              }`}
            />
          ))}
          <span className="text-xs text-slate-500 ml-1">{scoreCount}/{MAX_SCORES}</span>
        </div>
      </div>

      {fieldError && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {fieldError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
        {/* Score value */}
        <div>
          <label htmlFor="score-value" className="block text-xs font-medium text-slate-400 mb-1.5">
            Stableford Score
          </label>
          <input
            id="score-value"
            type="number"
            min={1}
            max={45}
            step={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFieldError('');
            }}
            placeholder="1–45"
            className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all tabular-nums"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="score-date" className="block text-xs font-medium text-slate-400 mb-1.5">
            Date of Round
          </label>
          <input
            id="score-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => {
              setDate(e.target.value);
              setFieldError('');
            }}
            className="w-full px-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all [color-scheme:dark]"
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {scoreCount >= MAX_SCORES && (
        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          At capacity — adding a new score will remove your oldest one.
        </p>
      )}
    </form>
  );
}
